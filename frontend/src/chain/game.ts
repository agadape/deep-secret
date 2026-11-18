// Every on-chain action the UI performs. Values come only from the chain and from decryptions the player is
// entitled to; nothing here invents progress or results.
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  parseEther,
  parseEventLogs,
  type EIP1193Provider,
  type LocalAccount,
  type TransactionReceipt,
  type WalletClient,
} from "viem";
import { sepolia } from "viem/chains";
import { ZamaSDK } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { createConfig } from "@zama-fhe/sdk/viem";
import { sepolia as sepoliaFhe } from "@zama-fhe/sdk/chains";
import { COIN, FEES, GAME, GAS, NFT, SEPOLIA_RPC } from "../config";
import { decodeFish, type Fish } from "../fish";
import type { AquariumEntry, PlayerView } from "../store";

export const publicClient = createPublicClient({ chain: sepolia, transport: http(SEPOLIA_RPC) });

type Session = {
  /** The player: owner of fish, Pearls and NFTs. All reads use this address. */
  address: `0x${string}`;
  /** Who signs and pays gas: the browser wallet, a guest key, or a session key acting for the player. */
  account: `0x${string}` | LocalAccount;
  wallet: WalletClient;
  sdk: ZamaSDK;
  permitted: boolean;
  /** Unix seconds when a session key stops being accepted by the contract (undefined = no session key). */
  expiresAt?: number;
};
let session: Session | undefined;
const need = () => {
  if (!session) throw new Error("Connect a wallet first");
  return session;
};

/** A browser wallet (EIP-1193), or — in local development only — a throwaway testnet key (see wallet.ts). */
export function startSession(source: EIP1193Provider | LocalAccount, address: `0x${string}`, expiresAt?: number) {
  const local = "signTransaction" in source;
  const account = local ? (source as LocalAccount) : address;
  const transport = local ? http(SEPOLIA_RPC) : custom(source as EIP1193Provider);
  const wallet = createWalletClient({ account, chain: sepolia, transport });
  const config = createConfig({
    chains: [sepoliaFhe],
    publicClient,
    walletClient: wallet,
    relayers: { [sepoliaFhe.id]: web() },
  } as Parameters<typeof createConfig>[0]);
  session = { address, account, wallet, sdk: new ZamaSDK(config), permitted: false, expiresAt };
}

/** The address that pays gas: the local key when there is one, otherwise the player's own wallet. */
export function gasAddress(): `0x${string}` {
  const s = need();
  return typeof s.account === "string" ? s.account : s.account.address;
}

export class SessionExpiredError extends Error {
  constructor() {
    super("SessionExpired: your 24-hour play session ended. Renew it with one confirmation.");
  }
}

/** One EIP-712 signature per session lets the player read their own fish and coins (SPIKE_LOG S13). */
export async function ensurePermit() {
  const s = need();
  if (s.permitted) return;
  await s.sdk.permits.grantPermit([GAME.address, COIN.address]);
  s.permitted = true;
}

export function signLogin(message: string) {
  const s = need();
  return s.wallet.signMessage({ account: s.account, message });
}

// ------------------------------------------------------------------ low-level helpers

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The public RPC is load-balanced; a read right after a receipt can hit a lagging node (SPIKE_LOG S14). */
async function retry<T>(f: () => Promise<T>, tries = 8): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await f();
    } catch (e) {
      if (i >= tries) throw e;
      await sleep(1500 + i * 500);
    }
  }
}

type GameFn = "claimStarter" | "setName" | "cast" | "sell" | "requestRodUpgrade" | "finalizeRodUpgrade" | "flex" | "finalizeFlex";

async function write(functionName: GameFn, args: readonly unknown[], gas: bigint, onSent?: (hash: string) => void) {
  const s = need();
  // The contract rejects an expired session key with SessionExpired; catch it before paying gas for a revert.
  if (s.expiresAt !== undefined && Date.now() / 1000 > s.expiresAt - 60) throw new SessionExpiredError();
  // If the player authorized another key elsewhere, this key would act as a brand-new player of its own.
  if (s.expiresAt !== undefined) {
    const owner = await retry(() => publicClient.readContract({ address: GAME.address, abi: GAME.abi, functionName: "playerOfKey", args: [gasAddress()] }));
    if (owner.toLowerCase() !== s.address.toLowerCase()) throw new SessionExpiredError();
  }
  const hash = await s.wallet.writeContract({
    account: s.account,
    chain: sepolia,
    address: GAME.address,
    abi: GAME.abi,
    functionName,
    args,
    gas,
    ...FEES,
  } as Parameters<WalletClient["writeContract"]>[0]);
  onSent?.(hash);
  const receipt = await publicClient.waitForTransactionReceipt({ hash, pollingInterval: 2000 });
  if (receipt.status !== "success") {
    // with an explicit gas limit the revert reason is not decoded: re-read the session to tell an expiry apart
    if (s.expiresAt !== undefined) {
      const now = await readSession(s.address).catch(() => undefined);
      if (now && (now.key.toLowerCase() !== gasAddress().toLowerCase() || now.expiresAt <= Date.now() / 1000)) throw new SessionExpiredError();
    }
    throw new Error(`Transaction reverted: ${hash}`);
  }
  return receipt;
}

const gameLogs = (r: TransactionReceipt) => parseEventLogs({ abi: GAME.abi, logs: r.logs });

/**
 * Decrypt values this player is allowed to read. Right after a transaction the decryption network may not have
 * seen the new ACL grant yet and answers "not entitled"; that clears within seconds, so retry those only.
 */
async function decrypt(handles: `0x${string}`[], contract: `0x${string}`, tries = 12, sdk?: ZamaSDK) {
  const s = need();
  if (!sdk) await ensurePermit();
  const client = sdk ?? s.sdk;
  const inputs = handles.map((h) => ({ encryptedValue: h, contractAddress: contract }));
  let out: Awaited<ReturnType<typeof client.decryption.decryptValues>> | undefined;
  for (let i = 0; !out; i++) {
    try {
      out = await client.decryption.decryptValues(inputs);
    } catch (e) {
      const m = `${(e as Error).name} ${(e as Error).message}`;
      if (i >= tries || !/not ?entitled|failed to decrypt/i.test(m)) throw e;
      await sleep(2500);
    }
  }
  return (h: `0x${string}`) => BigInt(out[h] as bigint | number | boolean as bigint);
}

async function publicProof(handle: `0x${string}`) {
  const s = need();
  const r = (await s.sdk.decryption.decryptPublicValues([handle])) as unknown as {
    abiEncodedClearValues: `0x${string}`;
    decryptionProof: `0x${string}`;
  };
  return r;
}

// ------------------------------------------------------------------ reads

/** The session key the contract currently accepts for this player (docs/FE_INTEGRATION_SESSIONS.md). */
export async function readSession(player: `0x${string}`) {
  const r = await retry(() => publicClient.readContract({ address: GAME.address, abi: GAME.abi, functionName: "sessionOf", args: [player] }));
  return { key: r.key as `0x${string}`, expiresAt: Number(r.expiresAt) };
}

/** The player a session key acts for, or the zero address. */
export async function keyOwner(key: `0x${string}`) {
  return retry(() => publicClient.readContract({ address: GAME.address, abi: GAME.abi, functionName: "playerOfKey", args: [key] }));
}

/** Poll until a fresh key's balance is visible: a lagging RPC node can still answer 0 right after the funding tx. */
export async function waitForBalance(address: `0x${string}`, timeoutMs = 60_000) {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const b = await publicClient.getBalance({ address }).catch(() => 0n);
    if (b > 0n) return b;
    if (Date.now() > end) return 0n;
    await sleep(2500);
  }
}

/**
 * One MetaMask transaction: register `key` as the player's session key until `expiresAt` and forward `valueEth`
 * to it for gas. After this every game action is signed by the key, without pop-ups.
 */
export async function authorizeSession(
  provider: EIP1193Provider,
  player: `0x${string}`,
  key: `0x${string}`,
  expiresAt: number,
  valueEth: string,
  onSent?: (hash: string) => void,
) {
  const wallet = createWalletClient({ account: player, chain: sepolia, transport: custom(provider) });
  const hash = await wallet.writeContract({
    account: player,
    chain: sepolia,
    address: GAME.address,
    abi: GAME.abi,
    functionName: "authorizeSession",
    args: [key, BigInt(expiresAt)],
    value: parseEther(valueEth),
    ...FEES,
  });
  onSent?.(hash);
  const receipt = await publicClient.waitForTransactionReceipt({ hash, pollingInterval: 2000 });
  if (receipt.status !== "success") throw new Error(`Transaction reverted: ${hash}`);
  return receipt;
}

export async function loadEth(address: `0x${string}`) {
  return retry(() => publicClient.getBalance({ address }));
}

export async function loadPlayer(address: `0x${string}`, blockNumber?: bigint): Promise<PlayerView> {
  const p = await retry(() =>
    publicClient.readContract({ address: GAME.address, abi: GAME.abi, functionName: "player", args: [address], blockNumber }),
  );
  return {
    starterClaimed: p.starterClaimed,
    rodLevel: Number(p.rodLevel),
    castCount: Number(p.castCount),
    emberCount: Number(p.emberCount),
    upgradePending: p.upgradePending,
  };
}

export async function loadName(address: `0x${string}`) {
  return retry(() => publicClient.readContract({ address: GAME.address, abi: GAME.abi, functionName: "names", args: [address] }));
}

export async function loadPearls(address: `0x${string}`, blockNumber?: bigint) {
  const h = await retry(() =>
    publicClient.readContract({
      address: COIN.address,
      abi: COIN.abi,
      functionName: "confidentialBalanceOf",
      args: [address],
      blockNumber,
    }),
  );
  if (BigInt(h) === 0n) return 0n;
  return (await decrypt([h], COIN.address))(h);
}

const fishCache = new Map<string, { packed: bigint; price: bigint }>();

/** The player's own bucket: every fish still in the bucket (or waiting for a flex proof), decrypted locally. */
const SESSION_SHARE_LIMIT = 40; // DeepSecretGame shares the newest 40 bucket fish with a new session key

/**
 * The player's own bucket: every fish still in the bucket (or waiting for a flex proof), decrypted locally.
 * With a session key, fish older than the key's grant cannot be read by the key: they come back in `locked`
 * (open them with unlockWithWallet) instead of stalling the whole login.
 */
export async function loadBucket(address: `0x${string}`, blockNumber?: bigint): Promise<{ fish: Fish[]; locked: bigint[] }> {
  const s = need();
  const ids = await retry(() =>
    publicClient.readContract({ address: GAME.address, abi: GAME.abi, functionName: "fishIdsOf", args: [address], blockNumber }),
  );
  if (ids.length === 0) return { fish: [], locked: [] };
  const rows = await retry(() =>
    publicClient.multicall({
      allowFailure: false,
      blockNumber,
      contracts: ids.map((id) => ({ address: GAME.address, abi: GAME.abi, functionName: "getFish", args: [id] }) as const),
    }),
  );
  const live = rows.map((f, i) => ({ id: ids[i], f })).filter(({ f }) => f.state === 0 || f.state === 4);
  const sessionKey = s.expiresAt !== undefined;
  const granted = new Set(live.slice(-SESSION_SHARE_LIMIT).map(({ id }) => String(id)));
  const missing = live.filter(({ id }) => !fishCache.has(String(id)));
  const locked: bigint[] = [];
  // newest first, so the fish the key can surely read are decrypted before any older ones are tried
  const order = [...missing].reverse();
  for (let i = 0; i < order.length; i += 10) {
    const chunk = order.slice(i, i + 10);
    const older = sessionKey && chunk.some(({ id }) => !granted.has(String(id)));
    try {
      const read = await decrypt(
        chunk.flatMap(({ f }) => [f.packed, f.price]),
        GAME.address,
        older ? 1 : 12,
      );
      for (const { id, f } of chunk) fishCache.set(String(id), { packed: read(f.packed), price: read(f.price) });
    } catch (e) {
      if (!older) throw e;
      locked.push(...chunk.map(({ id }) => id));
    }
  }
  const fish = live
    .filter(({ id }) => fishCache.has(String(id)))
    .map(({ id, f }) => {
      const c = fishCache.get(String(id))!;
      return decodeFish(id, c.packed, c.price, f.state);
    });
  return { fish, locked };
}

/**
 * Rare case in session mode: open older fish with the player's own wallet (one signature, no transaction).
 * A temporary SDK signs the decryption permit with MetaMask; results join the same local cache.
 */
export async function unlockWithWallet(provider: EIP1193Provider, player: `0x${string}`, ids: bigint[]) {
  const wallet = createWalletClient({ account: player, chain: sepolia, transport: custom(provider) });
  const config = createConfig({
    chains: [sepoliaFhe],
    publicClient,
    walletClient: wallet,
    relayers: { [sepoliaFhe.id]: web() },
  } as Parameters<typeof createConfig>[0]);
  const sdk = new ZamaSDK(config);
  await sdk.permits.grantPermit([GAME.address, COIN.address]);
  const rows = await retry(() =>
    publicClient.multicall({
      allowFailure: false,
      contracts: ids.map((id) => ({ address: GAME.address, abi: GAME.abi, functionName: "getFish", args: [id] }) as const),
    }),
  );
  for (let i = 0; i < rows.length; i += 10) {
    const chunk = rows.slice(i, i + 10);
    const read = await decrypt(
      chunk.flatMap((f) => [f.packed, f.price]),
      GAME.address,
      4,
      sdk,
    );
    chunk.forEach((f, j) => fishCache.set(String(ids[i + j]), { packed: read(f.packed), price: read(f.price) }));
  }
}

export async function loadAquarium(): Promise<AquariumEntry[]> {
  const total = await retry(() => publicClient.readContract({ address: NFT.address, abi: NFT.abi, functionName: "totalMinted" }));
  const out: AquariumEntry[] = [];
  for (let id = 1n; id <= total; id++) {
    const [m, owner] = await Promise.all([
      retry(() => publicClient.readContract({ address: NFT.address, abi: NFT.abi, functionName: "meta", args: [id] })),
      retry(() => publicClient.readContract({ address: NFT.address, abi: NFT.abi, functionName: "ownerOf", args: [id] })),
    ]);
    const ownerName = (await loadName(owner)) || `${owner.slice(0, 6)}…${owner.slice(-4)}`;
    out.push({
      tokenId: id,
      owner,
      ownerName,
      species: Number(m[3]),
      aura: Number(m[4]) === 1,
      weight: Number(m[5]),
      serial: Number(m[2]),
      season: Number(m[1]),
    });
  }
  return out;
}

export async function loadOdds(rodLevel: number, zoneId: number) {
  return retry(() =>
    publicClient.readContract({ address: GAME.address, abi: GAME.abi, functionName: "oddsFor", args: [rodLevel, zoneId] }),
  );
}

export async function loadSeason() {
  return retry(() => publicClient.readContract({ address: GAME.address, abi: GAME.abi, functionName: "season" }));
}

/** Demo device for judges: try to read the newest fish that belongs to someone else, and show the refusal. */
export async function tryPeekStranger(): Promise<string> {
  const s = need();
  const count = await retry(() => publicClient.readContract({ address: GAME.address, abi: GAME.abi, functionName: "fishCount" }));
  for (let id = count - 1n; id >= 0n && id >= count - 50n; id--) {
    const f = await retry(() => publicClient.readContract({ address: GAME.address, abi: GAME.abi, functionName: "getFish", args: [id] }));
    if (f.owner.toLowerCase() === s.address.toLowerCase()) continue;
    try {
      await decrypt([f.packed], GAME.address);
      return `Fish #${id} decrypted — this should never happen.`;
    } catch (e) {
      const msg = (e as Error).message ?? String(e);
      return `Fish #${id} belongs to ${f.owner.slice(0, 8)}… — the decryption network refused: ${msg.slice(0, 140)}`;
    }
  }
  return "No other player's fish found yet.";
}

// ------------------------------------------------------------------ actions

export async function claimStarter(onSent?: (h: string) => void) {
  return write("claimStarter", [], GAS.claimStarter, onSent);
}

export async function setName(name: string, onSent?: (h: string) => void) {
  return write("setName", [name], GAS.setName, onSent);
}

/** Cast 5 hooks. Returns the 5 fish, decrypted for the owner only. */
export async function cast(zoneId: number, onSent?: (h: string) => void, onConfirmed?: () => void) {
  const receipt = await write("cast", [zoneId], GAS.cast, onSent);
  onConfirmed?.();
  const ev = gameLogs(receipt).find((l) => l.eventName === "Cast");
  if (!ev || ev.eventName !== "Cast") throw new Error("Cast event missing");
  const first = ev.args.firstFishId;
  const ids = [0n, 1n, 2n, 3n, 4n].map((i) => first + i);
  const rows = await retry(() =>
    publicClient.multicall({
      allowFailure: false,
      blockNumber: receipt.blockNumber,
      contracts: ids.map((id) => ({ address: GAME.address, abi: GAME.abi, functionName: "getFish", args: [id] }) as const),
    }),
  );
  // Reveal needs only the packed attributes (5 values, ~7 s); prices load with the bucket afterwards.
  const read = await decrypt(
    rows.map((f) => f.packed),
    GAME.address,
  );
  const fish = rows.map((f, i) => decodeFish(ids[i], read(f.packed), 0n, f.state));
  return { fish, receipt };
}

export async function sell(ids: bigint[], onSent?: (h: string) => void) {
  return write("sell", [ids], GAS.sell, onSent);
}

/** Two steps: pay under encryption, then publish the verified "paid" bit to raise the public rod level. */
export async function upgradeRod(onStep: (msg: string) => void) {
  const s = need();
  onStep("Confirm the payment in your wallet…");
  const r1 = await write("requestRodUpgrade", [], GAS.requestRodUpgrade, () => onStep("Paying the rod shop…"));
  const p = await retry(() =>
    publicClient.readContract({ address: GAME.address, abi: GAME.abi, functionName: "player", args: [s.address], blockNumber: r1.blockNumber }),
  );
  onStep("Getting the decryption proof…");
  const proof = await retry(() => publicProof(p.upgradePaid));
  onStep("Confirm the proof in your wallet…");
  const r2 = await write(
    "finalizeRodUpgrade",
    [s.address, proof.abiEncodedClearValues, proof.decryptionProof],
    GAS.finalize,
    () => onStep("Verifying on-chain…"),
  );
  const ev = gameLogs(r2).find((l) => l.eventName === "RodUpgradeFinalized");
  return ev && ev.eventName === "RodUpgradeFinalized" ? { paid: ev.args.paid, level: Number(ev.args.rodLevel) } : undefined;
}

/** Two steps: open the fish for public decryption, then submit the KMS proof; a Secret becomes an NFT. */
export async function flex(fishId: bigint, onStep: (msg: string) => void) {
  onStep("Confirm in your wallet…");
  const r1 = await write("flex", [fishId], GAS.flex, () => onStep("Opening your fish to the world…"));
  const f = await retry(() =>
    publicClient.readContract({ address: GAME.address, abi: GAME.abi, functionName: "getFish", args: [fishId], blockNumber: r1.blockNumber }),
  );
  onStep("Getting the decryption proof…");
  const proof = await retry(() => publicProof(f.packed));
  onStep("Confirm the proof in your wallet…");
  const r2 = await write("finalizeFlex", [fishId, proof.abiEncodedClearValues, proof.decryptionProof], GAS.finalizeFlex, () =>
    onStep("Verifying on-chain…"),
  );
  const ev = gameLogs(r2).find((l) => l.eventName === "Flexed" || l.eventName === "FlexRejected");
  return { flexed: ev?.eventName === "Flexed", tx: r2.transactionHash, args: ev?.eventName === "Flexed" ? ev.args : undefined };
}
