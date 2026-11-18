// Sepolia smoke test of the deployed game: claim → name → cast → reveal 5 fish → sell → rod upgrade (2 steps)
// → flex if a Secret was caught. Usage: npx hardhat run scripts/smoke.ts --network sepolia
import { FhevmType } from "@fhevm/hardhat-plugin";
import { deployments, ethers, fhevm } from "hardhat";

const TIERS = ["Biasa", "Langka", "Epik", "Legenda", "Secret"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
// The public RPC is load-balanced and can answer from a node behind the last receipt (SPIKE_LOG S14).
async function retry<T>(f: () => Promise<T>, tries = 10): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await f();
    } catch (e) {
      if (i >= tries) throw e;
      await sleep(3000);
    }
  }
}
const t0 = Date.now();
const log = (m: string) => console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s] ${m}`);

async function main() {
  await fhevm.initializeCLIApi();
  const [alice] = await ethers.getSigners();
  const game = await ethers.getContractAt("DeepSecretGame", (await deployments.get("DeepSecretGame")).address);
  const coin = await ethers.getContractAt("PearlCoin", (await deployments.get("PearlCoin")).address);
  const nft = await ethers.getContractAt("SecretFishNFT", (await deployments.get("SecretFishNFT")).address);
  const gameAddr = await game.getAddress();
  const coinAddr = await coin.getAddress();
  const send = async (label: string, p: Promise<{ hash: string; wait: () => Promise<unknown> }>) => {
    const tx = await p;
    const rc = (await tx.wait()) as { gasUsed: bigint; blockNumber: number; logs: never[] };
    log(`${label}: tx ${tx.hash} gas=${rc.gasUsed}`);
    return rc;
  };
  const balance = async (block: number) => {
    const h = await retry(() => coin.confidentialBalanceOf(alice.address, { blockTag: block }));
    return h === ethers.ZeroHash ? 0n : retry(() => fhevm.userDecryptEuint(FhevmType.euint64, h, coinAddr, alice));
  };

  log(`game ${gameAddr} player ${alice.address}`);
  const p0 = await retry(() => game.player(alice.address));
  if (!p0.starterClaimed) await send("claimStarter", game.claimStarter());
  await send("setName", game.setName("Alice"));

  let rc = await send("cast(0)", game.cast(0));
  const ev = rc.logs.map((l) => game.interface.parseLog(l)).find((e) => e?.name === "Cast")!;
  const first: bigint = ev.args.firstFishId;
  const fish = [];
  for (let i = 0n; i < 5n; i++) {
    const f = await retry(() => game.getFish(first + i, { blockTag: rc.blockNumber }));
    const v = await retry(() => fhevm.userDecryptEuint(FhevmType.euint32, f.packed, gameAddr, alice));
    const price = await retry(() => fhevm.userDecryptEuint(FhevmType.euint64, f.price, gameAddr, alice));
    const n = Number(v);
    fish.push({ id: first + i, tier: n & 7, weight: (n >> 8) & 255, aura: (n >> 5) & 1, price });
  }
  for (const f of fish) log(`  fish #${f.id}: ${TIERS[f.tier]} weight=${f.weight} aura=${f.aura} price=${f.price}`);

  const before = await balance(rc.blockNumber);
  const toSell = fish.filter((f) => f.tier !== 4);
  rc = await send(`sell ${toSell.length}`, game.sell(toSell.map((f) => f.id)));
  const after = await balance(rc.blockNumber);
  const expected = toSell.reduce((s, f) => s + f.price, 0n);
  log(`balance ${before} → ${after} (expected +${expected}): ${after - before === expected ? "OK" : "MISMATCH"}`);

  const lvl = (await retry(() => game.player(alice.address, { blockTag: rc.blockNumber }))).rodLevel;
  rc = await send("requestRodUpgrade", game.requestRodUpgrade());
  const paidHandle = (await retry(() => game.player(alice.address, { blockTag: rc.blockNumber }))).upgradePaid;
  const pd = await retry(() => fhevm.publicDecrypt([paidHandle]));
  rc = await send("finalizeRodUpgrade", game.finalizeRodUpgrade(alice.address, pd.abiEncodedClearValues, pd.decryptionProof));
  const lvl2 = (await retry(() => game.player(alice.address, { blockTag: rc.blockNumber }))).rodLevel;
  log(`rod level ${lvl} → ${lvl2}`);

  const secret = fish.find((f) => f.tier === 4);
  if (secret) {
    rc = await send(`flex #${secret.id}`, game.flex(secret.id));
    const packed = (await retry(() => game.getFish(secret.id, { blockTag: rc.blockNumber }))).packed;
    const fd = await retry(() => fhevm.publicDecrypt([packed]));
    rc = await send("finalizeFlex", game.finalizeFlex(secret.id, fd.abiEncodedClearValues, fd.decryptionProof));
    log(`NFT minted: total ${await retry(() => nft.totalMinted({ blockTag: rc.blockNumber }))}`);
  } else {
    log("no Secret this cast (1-in-40 per fish); flex is covered by the mock tests");
  }
  log("SMOKE DONE");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
