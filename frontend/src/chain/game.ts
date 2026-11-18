// Every on-chain action the UI performs. Values come only from the chain and from decryptions the player is
// entitled to; nothing here invents progress or results.
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
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
  address: `0x${string}`;
  account: `0x${string}` | LocalAccount;
  wallet: WalletClient;
  sdk: ZamaSDK;
  permitted: boolean;
};
let session: Session | undefined;
const need = () => {
  if (!session) throw new Error("Connect a wallet first");
  return session;
};

/** A browser wallet (EIP-1193), or — in local development only — a throwaway testnet key (see wallet.ts). */
export function startSession(source: EIP1193Provider | LocalAccount, address: `0x${string}`) {
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
  session = { address, account, wallet, sdk: new ZamaSDK(config), permitted: false };
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
  if (receipt.status !== "success") throw new Error(`Transaction reverted: ${hash}`);
  return receipt;
}

const gameLogs = (r: TransactionReceipt) => parseEventLogs({ abi: GAME.abi, logs: r.logs });

/**
 * Decrypt values this player is allowed to read. Right after a transaction the decryption network may not have
 * seen the new ACL grant yet and answers "not entitled"; that clears within seconds, so retry those only.
 */
async function decrypt(handles: `0x${string}`[], contract: `0x${string}`) {
  const s = need();
  await ensurePermit();
  const inputs = handles.map((h) => ({ encryptedValue: h, contractAddress: contract }));
  let out: Awaited<ReturnType<typeof s.sdk.decryption.decryptValues>> | undefined;
  for (let i = 0; !out; i++) {
    try {
      out = await s.sdk.decryption.decryptValues(inputs);
    } catch (e) {
      const m = `${(e as Error).name} ${(e as Error).message}`;
      if (i >= 12 || !/not ?entitled|failed to decrypt/i.test(m)) throw e;
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
export async function loadBucket(address: `0x${string}`, blockNumber?: bigint): Promise<Fish[]> {
  const ids = await retry(() =>
    publicClient.readContract({ address: GAME.address, abi: GAME.abi, functionName: "fishIdsOf", args: [address], blockNumber }),
  );
  if (ids.length === 0) return [];
  const rows = await retry(() =>
    publicClient.multicall({
      allowFailure: false,
      blockNumber,
      contracts: ids.map((id) => ({ address: GAME.address, abi: GAME.abi, functionName: "getFish", args: [id] }) as const),
    }),
  );
  const live = rows.map((f, i) => ({ id: ids[i], f })).filter(({ f }) => f.state === 0 || f.state === 4);
  const missing = live.filter(({ id }) => !fishCache.has(String(id)));
  for (let i = 0; i < missing.length; i += 10) {
    const chunk = missing.slice(i, i + 10);
    const read = await decrypt(
      chunk.flatMap(({ f }) => [f.packed, f.price]),
      GAME.address,
    );
    for (const { id, f } of chunk) fishCache.set(String(id), { packed: read(f.packed), price: read(f.price) });
  }
  return live.map(({ id, f }) => {
    const c = fishCache.get(String(id))!;
    return decodeFish(id, c.packed, c.price, f.state);
  });
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
