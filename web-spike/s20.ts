// S20 — real wallet (MetaMask) on a cross-origin-isolated page (COOP same-origin + COEP require-corp):
// connect, EIP-712 decryption permit through the wallet, two transactions, then decrypt the catch.
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  parseAbi,
  parseEventLogs,
  type EIP1193Provider,
} from "viem";
import { sepolia } from "viem/chains";
import { ZamaSDK } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { createConfig } from "@zama-fhe/sdk/viem";
import { sepolia as sepoliaFhe } from "@zama-fhe/sdk/chains";

const GAME = "0x501b3FD5089dafc7562430E473F350768FD129D1" as const;
const abi = parseAbi([
  "function claimStarter()",
  "function cast() returns (uint256)",
  "function claimed(address) view returns (bool)",
  "function getFish(uint256) view returns (address, bytes32, bytes32, bytes32)",
  "event Cast(address indexed player, uint256 firstFishId)",
]);
// Sepolia base fee is ~20 wei; wallet default tips would overpay by orders of magnitude (SPIKE_LOG S16).
const FEES = { maxFeePerGas: 200_000n, maxPriorityFeePerGas: 100_000n };
const TIERS = ["Biasa", "Langka", "Epik", "Legenda", "Secret"];

const out = document.getElementById("out")!;
const lines: string[] = [];
const log = (m: string) => {
  lines.push(m);
  out.textContent = lines.join("\n");
  fetch("/__log", { method: "POST", body: JSON.stringify({ t: new Date().toISOString(), m }) }).catch(() => {});
};
const secs = (t: number) => ((performance.now() - t) / 1000).toFixed(1) + " s";
const btn = (id: string) => document.getElementById(id) as HTMLButtonElement;

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
});
let provider: EIP1193Provider | undefined;
let walletName = "";
let account: `0x${string}`;
let sdk: ZamaSDK;
let firstFishId: bigint | undefined;

// EIP-6963 wallet discovery
const found: { info: { name: string; rdns: string }; provider: EIP1193Provider }[] = [];
window.addEventListener("eip6963:announceProvider", (e: any) => found.push(e.detail));
window.dispatchEvent(new Event("eip6963:requestProvider"));

log(`crossOriginIsolated=${self.crossOriginIsolated} SharedArrayBuffer=${typeof SharedArrayBuffer}`);
log(`UA=${navigator.userAgent}`);
setTimeout(() => {
  const names = found.map((w) => `${w.info.name} (${w.info.rdns})`).join(", ") || "(tidak ada)";
  log(`dompet terdeteksi: ${names}; window.ethereum=${!!(window as any).ethereum}`);
}, 500);

async function step(id: string, next: string | undefined, f: () => Promise<void>) {
  btn(id).disabled = true;
  try {
    await f();
    if (next) btn(next).disabled = false;
  } catch (e: any) {
    log(`GAGAL ${id}: ${e?.shortMessage ?? e?.message ?? e}`);
    btn(id).disabled = false;
  }
}

btn("b1").onclick = () =>
  step("b1", "b2", async () => {
    const pick = found.find((w) => w.info.rdns === "io.metamask") ?? found[0];
    provider = pick?.provider ?? (window as any).ethereum;
    walletName = pick?.info.name ?? "window.ethereum";
    if (!provider) throw new Error("Tidak ada dompet di browser ini");
    let t = performance.now();
    const accts = (await provider.request({ method: "eth_requestAccounts" })) as `0x${string}`[];
    account = accts[0];
    log(`[1] terhubung ke ${walletName}: ${account} (${secs(t)})`);
    const chainId = await provider.request({ method: "eth_chainId" });
    if (chainId !== "0xaa36a7") {
      t = performance.now();
      await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0xaa36a7" }] });
      log(`[1] pindah ke Sepolia (${secs(t)})`);
    }
    const walletClient = createWalletClient({ account, chain: sepolia, transport: custom(provider) });
    sdk = new ZamaSDK(
      createConfig({ chains: [sepoliaFhe], publicClient, walletClient, relayers: { [sepoliaFhe.id]: web() } } as any),
    );
    const bal = await publicClient.getBalance({ address: account });
    log(`[1] saldo Sepolia: ${Number(bal) / 1e18} ETH`);
  });

btn("b2").onclick = () =>
  step("b2", "b3", async () => {
    const t = performance.now();
    await sdk.permits.grantPermit([GAME]);
    log(`[2] izin dekripsi (EIP-712) ditandatangani lewat ${walletName} (${secs(t)} termasuk waktu menyetujui)`);
  });

async function send(label: string, functionName: "claimStarter" | "cast", gas: bigint) {
  const walletClient = createWalletClient({ account, chain: sepolia, transport: custom(provider!) });
  let t = performance.now();
  const hash = await walletClient.writeContract({ address: GAME, abi, functionName, gas, ...FEES });
  log(`${label} dikirim: ${hash} (${secs(t)} termasuk persetujuan)`);
  t = performance.now();
  const rc = await publicClient.waitForTransactionReceipt({ hash });
  log(`${label} terkonfirmasi di blok ${rc.blockNumber}, status=${rc.status}, gas=${rc.gasUsed} (${secs(t)})`);
  if (rc.status !== "success") throw new Error(`${label} revert`);
  return rc;
}

btn("b3").onclick = () =>
  step("b3", "b4", async () => {
    if (await publicClient.readContract({ address: GAME, abi, functionName: "claimed", args: [account] })) {
      log("[3] starter pack sudah pernah diklaim, dilewati");
      return;
    }
    await send("[3] claimStarter", "claimStarter", 1_500_000n);
  });

btn("b4").onclick = () =>
  step("b4", "b5", async () => {
    const rc = await send("[4] cast", "cast", 12_000_000n);
    const ev = parseEventLogs({ abi, logs: rc.logs, eventName: "Cast" })[0];
    firstFishId = ev.args.firstFishId;
    log(`[4] ikan pertama #${firstFishId}`);
  });

btn("b5").onclick = () =>
  step("b5", undefined, async () => {
    const handles: `0x${string}`[] = [];
    for (let i = 0n; i < 5n; i++) {
      const f = await publicClient.readContract({
        address: GAME,
        abi,
        functionName: "getFish",
        args: [firstFishId! + i],
      });
      handles.push(f[1]);
    }
    const t = performance.now();
    const v = await sdk.decryption.decryptValues(handles.map((h) => ({ encryptedValue: h, contractAddress: GAME })));
    log(`[5] 5 ikan terbuka (${secs(t)}):`);
    handles.forEach((h) => {
      const n = Number(v[h]);
      const name = n === 0 ? "Sandal Jepit" : TIERS[n & 7];
      log(`    ${name} jenis=${(n >> 3) & 3} berat=${(n >> 8) & 255} aura=${(n >> 5) & 1}`);
    });
    log("[5] SELESAI");
  });
