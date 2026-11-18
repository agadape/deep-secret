// Sepolia smoke test of session keys: the player signs ONE transaction (authorizeSession + gas for the key);
// the key then claims, casts, reveals, sells and upgrades with no further wallet prompts.
// Usage: npx hardhat run scripts/smoke-session.ts --network sepolia
import { FhevmType } from "@fhevm/hardhat-plugin";
import { deployments, ethers, fhevm } from "hardhat";

const TIERS = ["Biasa", "Langka", "Epik", "Legenda", "Secret"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function retry<T>(f: () => Promise<T>, tries = 12): Promise<T> {
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
  const gameAddr = await game.getAddress();
  const coinAddr = await coin.getAddress();
  log(`game ${gameAddr}; coin.game() = ${await coin.game()}`);

  // the only transaction the player signs
  const key = ethers.Wallet.createRandom().connect(ethers.provider);
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  let tx = await game.connect(alice).authorizeSession(key.address, expiresAt, { value: ethers.parseEther("0.0005") });
  let rc = await tx.wait();
  log(`authorizeSession (player signs once): tx ${tx.hash} gas=${rc!.gasUsed}`);

  // wait until the forwarded gas money is visible (the load-balanced RPC can lag behind the receipt)
  const keyEth = await retry(async () => {
    const b = await ethers.provider.getBalance(key.address);
    if (b === 0n) throw new Error("not yet");
    return b;
  });
  log(`session key received ${ethers.formatEther(keyEth)} ETH for gas`);
  const asKey = game.connect(key);
  const fees = { gasPrice: 100_000n };
  // the key's nonce is tracked locally: the public RPC can lag right after a receipt
  let nonce = 0;
  const send = async (label: string, f: (o: object) => Promise<{ hash: string; wait: () => Promise<unknown> }>) => {
    const t = await f({ ...fees, nonce: nonce++ });
    const r = (await t.wait()) as { gasUsed: bigint; blockNumber: number; logs: never[] };
    log(`${label} (by session key, no prompt): tx ${t.hash} gas=${r.gasUsed}`);
    return r;
  };

  const p0 = await retry(() => game.player(alice.address, { blockTag: rc!.blockNumber }));
  if (!p0.starterClaimed) await send("claimStarter", (o) => asKey.claimStarter({ ...o, gasLimit: 1_500_000n }));
  rc = await send("cast(0)", (o) => asKey.cast(0, { ...o, gasLimit: 15_000_000n }));
  const ev = rc!.logs.map((l) => game.interface.parseLog(l)).find((e) => e?.name === "Cast")!;
  log(`Cast event player = ${ev.args.player} (expected the player, not the key)`);
  const first: bigint = ev.args.firstFishId;
  const ids: bigint[] = [];
  for (let i = 0n; i < 5n; i++) {
    const f = await retry(() => game.getFish(first + i, { blockTag: rc!.blockNumber }));
    const v = Number(await retry(() => fhevm.userDecryptEuint(FhevmType.euint32, f.packed, gameAddr, key)));
    log(`  key decrypts fish #${first + i}: ${TIERS[v & 7]} weight=${(v >> 8) & 255} (owner ${f.owner.slice(0, 8)})`);
    if ((v & 7) !== 4) ids.push(first + i);
  }
  rc = await send(`sell ${ids.length}`, (o) => asKey.sell(ids, { ...o, gasLimit: 4_000_000n }));
  const bal = await retry(async () =>
    fhevm.userDecryptEuint(
      FhevmType.euint64,
      await coin.confidentialBalanceOf(alice.address, { blockTag: rc!.blockNumber }),
      coinAddr,
      key,
    ),
  );
  log(`player's balance, decrypted by the session key: ${bal}`);
  log("SESSION SMOKE DONE");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
