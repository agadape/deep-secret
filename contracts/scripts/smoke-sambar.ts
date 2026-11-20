// Sepolia smoke test of Sambar Ember (SPIKE_LOG S23 gas + uniform trace, S24 ACL after a snatch).
// Alice is the victim (hides a net), Bob is the thief. Takes ~5 minutes because of the public pair cooldown.
// Usage: SEPOLIA_RPC_URL=https://rpc.sepolia.ethpandaops.io npx hardhat run scripts/smoke-sambar.ts --network sepolia
import { FhevmType } from "@fhevm/hardhat-plugin";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { deployments, ethers, fhevm } from "hardhat";

const TIERS = ["Biasa", "Langka", "Epik", "Legenda", "Secret"];
const TX_CAP = 16_777_216n; // per-transaction gas cap on Sepolia
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function retry<T>(f: () => Promise<T>, tries = 15): Promise<T> {
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
  const [alice, bob] = await ethers.getSigners();
  const game = await ethers.getContractAt("DeepSecretGame", (await deployments.get("DeepSecretGame")).address);
  const coin = await ethers.getContractAt("PearlCoin", (await deployments.get("PearlCoin")).address);
  const gameAddr = await game.getAddress();
  const coinAddr = await coin.getAddress();
  log(`game ${gameAddr}`);

  const nonces = new Map<string, number>();
  type Rc = { gasUsed: bigint; blockNumber: number; logs: { address: string; topics: readonly string[] }[] };
  async function send(
    who: HardhatEthersSigner,
    label: string,
    estimate: () => Promise<bigint>,
    f: (o: object) => Promise<{ hash: string; wait: () => Promise<unknown> }>,
  ): Promise<Rc> {
    if (!nonces.has(who.address)) nonces.set(who.address, await ethers.provider.getTransactionCount(who.address, "pending"));
    const est = await retry(estimate, 3);
    const gasLimit = (est * 12n) / 10n > TX_CAP ? TX_CAP : (est * 12n) / 10n;
    const nonce = nonces.get(who.address)!;
    nonces.set(who.address, nonce + 1);
    const t = await f({ gasPrice: 100_000n, gasLimit, nonce });
    const r = (await t.wait()) as Rc;
    log(`${label}: tx ${t.hash} estimate=${est} gas=${r.gasUsed}`);
    return r;
  }
  const decrypt32 = (h: string, who: HardhatEthersSigner) =>
    retry(() => fhevm.userDecryptEuint(FhevmType.euint32, h, gameAddr, who)).then(Number);
  const balance = async (who: HardhatEthersSigner, block: number) =>
    retry(async () =>
      fhevm.userDecryptEuint(
        FhevmType.euint64,
        await coin.confidentialBalanceOf(who.address, { blockTag: block }),
        coinAddr,
        who,
      ),
    );
  const denied = async (h: string, who: HardhatEthersSigner) => {
    try {
      await fhevm.userDecryptEuint(FhevmType.euint32, h, gameAddr, who);
      return false;
    } catch {
      return true;
    }
  };

  // 1. both players get coins; Alice casts 3x (past the newcomer shield), Bob 2x (minimum thief casts)
  for (const [who, casts] of [
    [alice, 3],
    [bob, 2],
  ] as const) {
    const p = await game.player(who.address);
    if (!p.starterClaimed)
      await send(who, `${who === alice ? "alice" : "bob"} claimStarter`, () => game.connect(who).claimStarter.estimateGas(), (o) =>
        game.connect(who).claimStarter(o),
      );
    for (let i = Number(p.castCount); i < casts; i++)
      await send(who, `${who === alice ? "alice" : "bob"} cast(0)`, () => game.connect(who).cast.estimateGas(0), (o) =>
        game.connect(who).cast(0, o),
      );
  }

  // 2. Alice reads her bucket and picks two non-Secret fish: one bait target, one under the hidden net
  const ids = await retry(() => game.fishIdsOf(alice.address));
  const picks: { id: bigint; packed: number }[] = [];
  for (const id of ids) {
    const f = await retry(() => game.getFish(id));
    if (f.state !== 0n || f.targeted) continue;
    const v = await decrypt32(f.packed, alice);
    if ((v & 7) !== 4 && (v & 7) > 0) picks.push({ id, packed: v }); // skip Secret, prefer something worth stealing
    if (picks.length === 2) break;
  }
  const [target, netted] = picks;
  log(`alice's picks: #${target.id} (${TIERS[target.packed & 7]}), net on #${netted.id} (${TIERS[netted.packed & 7]})`);

  const enc = await fhevm.createEncryptedInput(gameAddr, alice.address).add32(Number(netted.id)).encrypt();
  let rc = await send(alice, "alice setNet (encrypted fish id)", () => game.connect(alice).setNet.estimateGas(enc.handles[0], enc.inputProof), (o) =>
    game.connect(alice).setNet(enc.handles[0], enc.inputProof, o),
  );
  const net = (await retry(() => game.player(alice.address, { blockTag: rc.blockNumber }))).netFish;
  log(`alice decrypts her net: #${await decrypt32(net, alice)}; bob denied: ${await denied(net, bob)}`);
  const aliceBefore = await balance(alice, rc.blockNumber);

  // 3. snatch that succeeds
  await sleep(25_000); // fresh catches are "wet" for 20 s
  let newId = await game.fishCount();
  const okRc = await send(bob, `bob snatch #${target.id} (should succeed)`, () => game.connect(bob).snatch.estimateGas(alice.address, target.id), (o) =>
    game.connect(bob).snatch(alice.address, target.id, o),
  );
  const sack = await retry(() => game.getFish(newId, { blockTag: okRc.blockNumber }));
  const slot = await retry(() => game.getFish(target.id, { blockTag: okRc.blockNumber }));
  log(`S24 bob decrypts sack #${newId}: ${await decrypt32(sack.packed, bob)} (expected ${target.packed}); alice denied: ${await denied(sack.packed, alice)}`);
  log(`S24 alice decrypts her old slot #${target.id}: ${await decrypt32(slot.packed, alice)} (expected 0); bob denied: ${await denied(slot.packed, bob)}`);

  // 4. snatch into the net (fails); the pair cooldown is 3 minutes in the demo season
  log("waiting 185 s for the public pair cooldown...");
  await sleep(185_000);
  newId = await game.fishCount();
  const failRc = await send(bob, `bob snatch #${netted.id} (into the net)`, () => game.connect(bob).snatch.estimateGas(alice.address, netted.id), (o) =>
    game.connect(bob).snatch(alice.address, netted.id, o),
  );
  const sack2 = await retry(() => game.getFish(newId, { blockTag: failRc.blockNumber }));
  const slot2 = await retry(() => game.getFish(netted.id, { blockTag: failRc.blockNumber }));
  log(`bob decrypts sack #${newId}: ${await decrypt32(sack2.packed, bob)} (expected 0 = Sandal Jepit)`);
  log(`alice still has #${netted.id}: ${await decrypt32(slot2.packed, alice)} (expected ${netted.packed})`);
  log(`alice balance ${aliceBefore} -> ${await balance(alice, failRc.blockNumber)} (expected +5 from the trapped bait)`);
  const sig = (r: Rc) => r.logs.map((l) => `${l.address.slice(0, 8)}:${l.topics[0].slice(0, 10)}`);
  const a = sig(okRc);
  const b = sig(failRc);
  const shield = game.interface.getEvent("ShieldBroken")!.topicHash.slice(0, 10);
  const aNoShield = a.filter((x) => !x.endsWith(shield));
  log(`S23 trace: success ${a.length} logs / gas ${okRc.gasUsed}; fail ${b.length} logs / gas ${failRc.gasUsed}`);
  log(`S23 same log sequence (ignoring bob's one-time ShieldBroken): ${JSON.stringify(aNoShield) === JSON.stringify(b)}`);

  // 5. Pak Kumis
  const npc = await game.PAK_KUMIS();
  if ((await game.npcFresh()) < 3n) {
    rc = await send(bob, "restockNpc (6 fish + hidden net)", () => game.connect(bob).restockNpc.estimateGas(), (o) => game.connect(bob).restockNpc(o));
    await sleep(25_000);
  }
  const npcIds = await retry(() => game.fishIdsOf(npc));
  newId = await game.fishCount();
  rc = await send(bob, `bob snatch Pak Kumis #${npcIds[npcIds.length - 1]}`, () => game.connect(bob).snatch.estimateGas(npc, npcIds[npcIds.length - 1]), (o) =>
    game.connect(bob).snatch(npc, npcIds[npcIds.length - 1], o),
  );
  const v = await decrypt32((await retry(() => game.getFish(newId, { blockTag: rc.blockNumber }))).packed, bob);
  log(`bob's NPC sack: ${v === 0 ? "Sandal Jepit (net)" : `${TIERS[v & 7]} weight=${(v >> 8) & 255}`}`);
  log("SAMBAR SMOKE DONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
