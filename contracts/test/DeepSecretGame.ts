import { FhevmType } from "@fhevm/hardhat-plugin";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { anyUint } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { DeepSecretGame, PearlCoin, SecretFishNFT } from "../types";

// ---------------------------------------------------------------- helpers

const TIER = { BIASA: 0, LANGKA: 1, EPIK: 2, LEGENDA: 3, SECRET: 4 } as const;

type Decoded = { tier: number; species: number; aura: number; weight: number; valid: number };
const decode = (v: bigint): Decoded => {
  const n = Number(v);
  return { tier: n & 7, species: (n >> 3) & 3, aura: (n >> 5) & 1, weight: (n >> 8) & 255, valid: (n >> 16) & 1 };
};
const expectedPrice = (f: Decoded): bigint => {
  if (f.valid === 0 || f.tier === TIER.SECRET) return 0n;
  const p = [2, 8, 30, 150][f.tier] + f.weight;
  return BigInt(f.aura ? p * 2 : p);
};

type SeasonOverrides = Partial<{
  secretQuota: number;
  starterAmount: bigint;
  secretOneIn: number;
  endsInSeconds: number;
  sambar: Partial<SambarCfg>;
}>;

type SambarCfg = {
  snatchBait: bigint;
  netCost: bigint;
  thiefCooldown: number;
  pairCooldown: number;
  victimCooldown: number;
  wetSeconds: number;
  npcRestockCooldown: number;
  maxTargetedPerHour: number;
  minThiefCasts: number;
  shieldCasts: number;
  minEmber: number;
  ghostPer256: number;
};
const DEMO_SAMBAR: SambarCfg = {
  snatchBait: 5n,
  netCost: 3n,
  thiefCooldown: 45,
  pairCooldown: 180,
  victimCooldown: 60,
  wetSeconds: 20,
  npcRestockCooldown: 180,
  maxTargetedPerHour: 4,
  minThiefCasts: 2,
  shieldCasts: 3,
  minEmber: 3,
  ghostPer256: 0, // deterministic tests; the ghost net has its own test
};

type Signable = { address: string; signingKey?: { sign: (d: string) => { v: number; r: string; s: string } } };
/** The key's co-signature on its own registration; an address with no key we hold gets an invalid signature. */
async function sessionSig(game: { getAddress: () => Promise<string> }, player: string, key: Signable, expiresAt: number) {
  const { chainId } = await ethers.provider.getNetwork();
  const digest = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "uint256", "address", "uint64"],
      [await game.getAddress(), chainId, player, expiresAt],
    ),
  );
  if (!key.signingKey) return [27, ethers.ZeroHash, ethers.ZeroHash] as const;
  const sig = key.signingKey.sign(digest);
  return [sig.v, sig.r, sig.s] as const;
}
/** authorizeSession sent by `who`, co-signed by `key` (or by `opts.signer` to forge it). */
async function authSession(
  ctx: Ctx,
  who: HardhatEthersSigner | { address: string },
  key: Signable,
  expiresAt: number,
  opts: { value?: bigint; signer?: Signable } = {},
) {
  const [v, r, sg] = await sessionSig(ctx.game, who.address, opts.signer ?? key, expiresAt);
  return ctx.game
    .connect(who as HardhatEthersSigner)
    .authorizeSession(key.address, expiresAt, v, r, sg, opts.value ? { value: opts.value } : {});
}

async function deploy(overrides: SeasonOverrides = {}) {
  const [deployer] = await ethers.getSigners();
  const coin = (await (await ethers.getContractFactory("PearlCoin")).deploy(deployer.address)) as unknown as PearlCoin;
  const nft = (await (await ethers.getContractFactory("SecretFishNFT")).deploy(deployer.address)) as unknown as SecretFishNFT;
  const now = await time.latest();
  const cfg = {
    number: 1,
    endsAt: now + (overrides.endsInSeconds ?? 30 * 24 * 3600),
    secretQuota: overrides.secretQuota ?? 5,
    starterAmount: overrides.starterAmount ?? 1000n,
    baitPrice: 5n,
    secretOneIn: overrides.secretOneIn ?? 40,
    legendOneIn: 25,
    epicOneIn: 8,
    rareOneIn: 3,
    rodBonusPct: 25,
    reefBonusPct: 50,
    trenchBonusPct: 100,
    rodPrices: [20n, 40n, 80n, 160n] as [bigint, bigint, bigint, bigint],
  };
  const game = (await (
    await ethers.getContractFactory("DeepSecretGame")
  ).deploy(await coin.getAddress(), await nft.getAddress(), cfg, { ...DEMO_SAMBAR, ...overrides.sambar })) as unknown as DeepSecretGame;
  await (await coin.setGame(await game.getAddress())).wait();
  await (await nft.setGame(await game.getAddress())).wait();
  return { coin, nft, game, cfg, gameAddress: await game.getAddress(), coinAddress: await coin.getAddress() };
}

type Ctx = Awaited<ReturnType<typeof deploy>>;

async function castAndRead(ctx: Ctx, who: HardhatEthersSigner, zone = 0) {
  const tx = await ctx.game.connect(who).cast(zone);
  const rc = await tx.wait();
  const ev = rc!.logs
    .map((l) => ctx.game.interface.parseLog(l))
    .find((e) => e?.name === "Cast")!;
  const first: bigint = ev.args.firstFishId;
  const fish = [];
  for (let i = 0n; i < 5n; i++) {
    const f = await ctx.game.getFish(first + i);
    const packed = await fhevm.debugger.decryptEuint(FhevmType.euint32, f.packed);
    const price = await fhevm.debugger.decryptEuint(FhevmType.euint64, f.price);
    fish.push({ id: first + i, packed, price, ...decode(packed) });
  }
  return fish;
}

async function balanceOf(ctx: Ctx, who: HardhatEthersSigner) {
  const h = await ctx.coin.confidentialBalanceOf(who.address);
  if (h === ethers.ZeroHash) return 0n;
  return fhevm.userDecryptEuint(FhevmType.euint64, h, ctx.coinAddress, who);
}

async function publicProof(handle: string) {
  const r = await fhevm.publicDecrypt([handle]);
  return { cleartexts: r.abiEncodedClearValues, proof: r.decryptionProof };
}

// ---------------------------------------------------------------- tests

describe("DeepSecretGame", function () {
  this.timeout(10 * 60_000);
  let alice: HardhatEthersSigner, bob: HardhatEthersSigner, carol: HardhatEthersSigner;

  before(async function () {
    if (!fhevm.isMock) this.skip(); // Sepolia is covered by scripts/smoke.ts
    [, alice, bob, carol] = await ethers.getSigners();
  });

  describe("setup and public odds", function () {
    it("wires coin and NFT to the game exactly once", async function () {
      const ctx = await deploy();
      expect(await ctx.coin.game()).to.eq(ctx.gameAddress);
      await expect(ctx.coin.setGame(alice.address)).to.be.revertedWithCustomError(ctx.coin, "GameAlreadySet");
      await expect(ctx.nft.setGame(alice.address)).to.be.revertedWithCustomError(ctx.nft, "GameAlreadySet");
      await expect(ctx.coin.connect(alice).mint(alice.address, ethers.ZeroHash)).to.be.revertedWithCustomError(
        ctx.coin,
        "OnlyGame",
      );
    });

    it("publishes cumulative thresholds that grow with rod level and zone", async function () {
      const ctx = await deploy();
      const R = 2n ** 32n;
      const base = await ctx.game.oddsFor(0, 0);
      expect(base.secret).to.eq(R / 40n);
      expect(base.legend).to.eq(R / 40n + R / 25n);
      expect(base.epic).to.eq(R / 40n + R / 25n + R / 8n);
      expect(base.rare).to.eq(R / 40n + R / 25n + R / 8n + R / 3n);
      const rod4 = await ctx.game.oddsFor(4, 0);
      expect(rod4.secret).to.eq(((R / 40n) * 200n) / 100n);
      const trench = await ctx.game.oddsFor(4, 2);
      expect(trench.secret).to.eq((((R / 40n) * 200n) / 100n) * 2n);
      const reef = await ctx.game.oddsFor(2, 1);
      expect(reef.rare - reef.epic).to.eq(((R / 3n) * 150n) / 100n);
    });
  });

  describe("starter pack and names", function () {
    it("gives each player one encrypted starter pack", async function () {
      const ctx = await deploy();
      await expect(ctx.game.connect(alice).claimStarter()).to.emit(ctx.game, "StarterClaimed").withArgs(alice.address);
      expect(await balanceOf(ctx, alice)).to.eq(1000n);
      await expect(ctx.game.connect(alice).claimStarter()).to.be.revertedWithCustomError(ctx.game, "AlreadyClaimed");
    });

    it("stores a short public nickname", async function () {
      const ctx = await deploy();
      await expect(ctx.game.connect(alice).setName("Sari")).to.emit(ctx.game, "NameSet").withArgs(alice.address, "Sari");
      expect(await ctx.game.names(alice.address)).to.eq("Sari");
      await expect(ctx.game.connect(alice).setName("")).to.be.revertedWithCustomError(ctx.game, "BadName");
      await expect(ctx.game.connect(alice).setName("x".repeat(17))).to.be.revertedWithCustomError(ctx.game, "BadName");
    });
  });

  describe("cast", function () {
    it("rolls 5 encrypted fish, burns the bait, and fills the Sambar hooks", async function () {
      const ctx = await deploy();
      await ctx.game.connect(alice).claimStarter();
      await expect(ctx.game.connect(alice).cast(0)).to.emit(ctx.game, "Cast").withArgs(alice.address, 0, 0);
      expect(await balanceOf(ctx, alice)).to.eq(995n);
      const p = await ctx.game.player(alice.address);
      expect(p.castCount).to.eq(1);
      expect(p.emberCount).to.eq(5);
      expect(await ctx.game.fishIdsOf(alice.address)).to.deep.eq([0n, 1n, 2n, 3n, 4n]);
      for (let i = 0n; i < 5n; i++) {
        const f = await ctx.game.getFish(i);
        expect(f.owner).to.eq(alice.address);
        expect(f.caughtAt).to.be.gt(0);
        expect(f.origin).to.eq(0);
        expect(f.targeted).to.eq(false);
        const packed = await fhevm.userDecryptEuint(FhevmType.euint32, f.packed, ctx.gameAddress, alice);
        const price = await fhevm.userDecryptEuint(FhevmType.euint64, f.price, ctx.gameAddress, alice);
        const d = decode(packed);
        expect(d.valid).to.eq(1);
        expect(price).to.eq(expectedPrice(d));
      }
    });

    it("keeps every catch private to its owner", async function () {
      const ctx = await deploy();
      await ctx.game.connect(alice).claimStarter();
      await ctx.game.connect(alice).cast(0);
      const f = await ctx.game.getFish(0);
      await expect(fhevm.userDecryptEuint(FhevmType.euint32, f.packed, ctx.gameAddress, bob)).to.be.rejected;
      await expect(fhevm.userDecryptEuint(FhevmType.euint64, f.price, ctx.gameAddress, bob)).to.be.rejected;
    });

    it("turns an unpaid cast into 5 Sandal Jepit without reverting or touching the quota", async function () {
      const ctx = await deploy();
      const before = await fhevm.debugger.decryptEuint(FhevmType.euint8, await ctx.game.secretsLeftHandle());
      const fish = await castAndRead(ctx, bob);
      for (const f of fish) {
        expect(f.packed).to.eq(0n);
        expect(f.price).to.eq(0n);
      }
      expect(await fhevm.debugger.decryptEuint(FhevmType.euint8, await ctx.game.secretsLeftHandle())).to.eq(before);
    });

    it("gates zones by rod level", async function () {
      const ctx = await deploy();
      await ctx.game.connect(alice).claimStarter();
      await expect(ctx.game.connect(alice).cast(1))
        .to.be.revertedWithCustomError(ctx.game, "RodTooWeak")
        .withArgs(2);
      await expect(ctx.game.connect(alice).cast(2))
        .to.be.revertedWithCustomError(ctx.game, "RodTooWeak")
        .withArgs(4);
      await expect(ctx.game.connect(alice).cast(3)).to.be.revertedWithCustomError(ctx.game, "BadZone");
    });

    it("never hands out more Secrets than the hidden quota", async function () {
      const ctx = await deploy({ secretOneIn: 2, secretQuota: 3, starterAmount: 10_000n });
      await ctx.game.connect(alice).claimStarter();
      let secrets = 0;
      for (let i = 0; i < 6; i++) {
        for (const f of await castAndRead(ctx, alice)) if (f.tier === TIER.SECRET) secrets++;
      }
      // A cast that would overshoot the quota turns all its Secret rolls into Legenda, so fewer than 3 is possible.
      const left = await fhevm.debugger.decryptEuint(FhevmType.euint8, await ctx.game.secretsLeftHandle());
      expect(secrets).to.be.gt(0).and.lte(3);
      expect(BigInt(secrets) + left).to.eq(3n);
    });
  });

  describe("sell", function () {
    it("pays the encrypted sum of the sold fish", async function () {
      const ctx = await deploy();
      await ctx.game.connect(alice).claimStarter();
      const fish = (await castAndRead(ctx, alice)).filter((f) => f.tier !== TIER.SECRET);
      const before = await balanceOf(ctx, alice);
      await expect(ctx.game.connect(alice).sell(fish.map((f) => f.id)))
        .to.emit(ctx.game, "Sold")
        .withArgs(alice.address, fish.length);
      const sum = fish.reduce((s, f) => s + f.price, 0n);
      expect(await balanceOf(ctx, alice)).to.eq(before + sum);
      expect((await ctx.game.player(alice.address)).emberCount).to.eq(5 - fish.length);
    });

    it("sums a large batch with a shallow FHE tree", async function () {
      const ctx = await deploy({ starterAmount: 10_000n });
      await ctx.game.connect(alice).claimStarter();
      const all = [];
      for (let i = 0; i < 8; i++) all.push(...(await castAndRead(ctx, alice)));
      const sellable = all.filter((f) => f.tier !== TIER.SECRET).slice(0, 37); // odd size exercises the carry
      const before = await balanceOf(ctx, alice);
      await ctx.game.connect(alice).sell(sellable.map((f) => f.id));
      expect(await balanceOf(ctx, alice)).to.eq(before + sellable.reduce((s, f) => s + f.price, 0n));
    });

    it("rejects double sells, foreign fish and bad batch sizes", async function () {
      const ctx = await deploy();
      await ctx.game.connect(alice).claimStarter();
      await ctx.game.connect(alice).cast(0);
      await ctx.game.connect(alice).sell([0]);
      await expect(ctx.game.connect(alice).sell([0]))
        .to.be.revertedWithCustomError(ctx.game, "WrongState")
        .withArgs(0, 1);
      await expect(ctx.game.connect(bob).sell([1]))
        .to.be.revertedWithCustomError(ctx.game, "NotYourFish")
        .withArgs(1);
      await expect(ctx.game.connect(alice).sell([1, 1])).to.be.revertedWithCustomError(ctx.game, "WrongState");
      await expect(ctx.game.connect(alice).sell([])).to.be.revertedWithCustomError(ctx.game, "BadSellCount");
      await expect(ctx.game.connect(alice).sell(new Array(41).fill(1))).to.be.revertedWithCustomError(
        ctx.game,
        "BadSellCount",
      );
    });
  });

  describe("rod upgrade", function () {
    it("raises the public rod level after a verified 'paid' bit", async function () {
      const ctx = await deploy();
      await ctx.game.connect(alice).claimStarter();
      await ctx.game.connect(alice).requestRodUpgrade();
      await expect(ctx.game.connect(alice).requestRodUpgrade()).to.be.revertedWithCustomError(ctx.game, "UpgradePending");
      const { cleartexts, proof } = await publicProof((await ctx.game.player(alice.address)).upgradePaid);
      await expect(ctx.game.connect(carol).finalizeRodUpgrade(alice.address, cleartexts, proof))
        .to.emit(ctx.game, "RodUpgradeFinalized")
        .withArgs(alice.address, 1, true);
      expect(await balanceOf(ctx, alice)).to.eq(980n);
      await expect(ctx.game.finalizeRodUpgrade(alice.address, cleartexts, proof)).to.be.revertedWithCustomError(
        ctx.game,
        "NoUpgradePending",
      );
    });

    it("keeps the level when the player could not pay", async function () {
      const ctx = await deploy();
      await ctx.game.connect(bob).requestRodUpgrade();
      const { cleartexts, proof } = await publicProof((await ctx.game.player(bob.address)).upgradePaid);
      await expect(ctx.game.finalizeRodUpgrade(bob.address, cleartexts, proof))
        .to.emit(ctx.game, "RodUpgradeFinalized")
        .withArgs(bob.address, 0, false);
    });

    it("rejects a forged cleartext", async function () {
      const ctx = await deploy();
      await ctx.game.connect(bob).requestRodUpgrade();
      const { proof } = await publicProof((await ctx.game.player(bob.address)).upgradePaid);
      const forged = ethers.AbiCoder.defaultAbiCoder().encode(["bool"], [true]);
      await expect(ctx.game.finalizeRodUpgrade(bob.address, forged, proof)).to.be.reverted;
    });

    it("unlocks Karang at rod level 2", async function () {
      const ctx = await deploy();
      await ctx.game.connect(alice).claimStarter();
      for (let i = 0; i < 2; i++) {
        await ctx.game.connect(alice).requestRodUpgrade();
        const { cleartexts, proof } = await publicProof((await ctx.game.player(alice.address)).upgradePaid);
        await ctx.game.finalizeRodUpgrade(alice.address, cleartexts, proof);
      }
      expect((await ctx.game.player(alice.address)).rodLevel).to.eq(2);
      await expect(ctx.game.connect(alice).cast(1)).to.emit(ctx.game, "Cast");
    });
  });

  describe("flex (show off a Secret)", function () {
    async function catchSecret(ctx: Ctx) {
      for (let i = 0; i < 10; i++) {
        const s = (await castAndRead(ctx, alice)).find((f) => f.tier === TIER.SECRET);
        if (s) return s;
      }
      throw new Error("no Secret in 50 fish at 1-in-4 odds");
    }

    it("turns a verified Secret into a 1-of-1 NFT with on-chain metadata", async function () {
      const ctx = await deploy({ secretOneIn: 4, starterAmount: 10_000n });
      await ctx.game.connect(alice).claimStarter();
      const s = await catchSecret(ctx);
      const emberBefore = (await ctx.game.player(alice.address)).emberCount;

      await expect(ctx.game.connect(bob).flex(s.id)).to.be.revertedWithCustomError(ctx.game, "NotYourFish");
      await expect(ctx.game.connect(alice).flex(s.id)).to.emit(ctx.game, "FlexRequested");
      const { cleartexts, proof } = await publicProof((await ctx.game.getFish(s.id)).packed);
      await expect(ctx.game.connect(carol).finalizeFlex(s.id, cleartexts, proof))
        .to.emit(ctx.game, "Flexed")
        .withArgs(alice.address, s.id, 1, s.species, s.aura, s.weight, 1);

      expect(await ctx.nft.ownerOf(1)).to.eq(alice.address);
      expect((await ctx.game.getFish(s.id)).state).to.eq(2);
      expect((await ctx.game.player(alice.address)).emberCount).to.eq(emberBefore - 1n);
      const uri = await ctx.nft.tokenURI(1);
      const json = JSON.parse(Buffer.from(uri.split(",")[1], "base64").toString());
      expect(json.name).to.contain("Secret #1");
      expect(json.attributes.find((a: { trait_type: string }) => a.trait_type === "Weight").value).to.eq(s.weight);
      await expect(ctx.game.connect(alice).sell([s.id])).to.be.revertedWithCustomError(ctx.game, "WrongState");
    });

    it("sends a non-Secret back to the bucket", async function () {
      const ctx = await deploy();
      await ctx.game.connect(alice).claimStarter();
      const plain = (await castAndRead(ctx, alice)).find((f) => f.tier !== TIER.SECRET)!;
      await ctx.game.connect(alice).flex(plain.id);
      expect((await ctx.game.player(alice.address)).emberCount).to.eq(4);
      const { cleartexts, proof } = await publicProof((await ctx.game.getFish(plain.id)).packed);
      await expect(ctx.game.finalizeFlex(plain.id, cleartexts, proof))
        .to.emit(ctx.game, "FlexRejected")
        .withArgs(alice.address, plain.id);
      expect((await ctx.game.getFish(plain.id)).state).to.eq(0);
      expect((await ctx.game.player(alice.address)).emberCount).to.eq(5);
      expect(await ctx.nft.totalMinted()).to.eq(0);
    });

    it("rejects a forged Secret", async function () {
      const ctx = await deploy();
      await ctx.game.connect(alice).claimStarter();
      const plain = (await castAndRead(ctx, alice)).find((f) => f.tier !== TIER.SECRET)!;
      await ctx.game.connect(alice).flex(plain.id);
      const { proof } = await publicProof((await ctx.game.getFish(plain.id)).packed);
      const forged = ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [(1n << 16n) | 4n]);
      await expect(ctx.game.finalizeFlex(plain.id, forged, proof)).to.be.reverted;
    });
  });

  describe("session keys (one wallet confirmation per session)", function () {
    async function newKey() {
      return ethers.Wallet.createRandom().connect(ethers.provider);
    }
    async function authorize(ctx: Ctx, who: HardhatEthersSigner, key: Signable, seconds = 3600) {
      const expiresAt = (await time.latest()) + seconds;
      await authSession(ctx, who, key, expiresAt, { value: ethers.parseEther("0.01") });
      return expiresAt;
    }

    it("registers the key, forwards gas money and exposes the session", async function () {
      const ctx = await deploy();
      const key = await newKey();
      const expiresAt = (await time.latest()) + 3600;
      await expect(authSession(ctx, alice, key, expiresAt, { value: ethers.parseEther("0.01") }))
        .to.emit(ctx.game, "SessionAuthorized")
        .withArgs(alice.address, key.address, expiresAt, 0);
      expect(await ethers.provider.getBalance(key.address)).to.eq(ethers.parseEther("0.01"));
      expect(await ctx.game.playerOfKey(key.address)).to.eq(alice.address);
      expect(await ctx.game.activeKeyOf(alice.address)).to.eq(key.address);
    });

    it("lets the key play for the player: the catch, the coins and the cost all belong to the player", async function () {
      const ctx = await deploy();
      await ctx.game.connect(alice).claimStarter();
      const key = await newKey();
      await authorize(ctx, alice, key);
      // the key already sees the balance it will spend from
      const balH = await ctx.coin.confidentialBalanceOf(alice.address);
      expect(await fhevm.userDecryptEuint(FhevmType.euint64, balH, ctx.coinAddress, key)).to.eq(1000n);

      await expect(ctx.game.connect(key).cast(0)).to.emit(ctx.game, "Cast").withArgs(alice.address, 0, 0);
      const f = await ctx.game.getFish(0);
      expect(f.owner).to.eq(alice.address);
      const byPlayer = await fhevm.userDecryptEuint(FhevmType.euint32, f.packed, ctx.gameAddress, alice);
      const byKey = await fhevm.userDecryptEuint(FhevmType.euint32, f.packed, ctx.gameAddress, key);
      expect(byKey).to.eq(byPlayer);
      await expect(fhevm.userDecryptEuint(FhevmType.euint32, f.packed, ctx.gameAddress, bob)).to.be.rejected;
      expect(await balanceOf(ctx, alice)).to.eq(995n);
      expect((await ctx.game.player(alice.address)).castCount).to.eq(1);
      expect((await ctx.game.player(key.address)).castCount).to.eq(0);

      // sell, upgrade and name all land on the player, and the key can read the new balance
      await ctx.game.connect(key).sell([0, 1, 2, 3, 4]);
      const after = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        await ctx.coin.confidentialBalanceOf(alice.address),
        ctx.coinAddress,
        key,
      );
      expect(after).to.eq(await balanceOf(ctx, alice));
      await ctx.game.connect(key).requestRodUpgrade();
      const { cleartexts, proof } = await publicProof((await ctx.game.player(alice.address)).upgradePaid);
      await ctx.game.connect(key).finalizeRodUpgrade(alice.address, cleartexts, proof);
      expect((await ctx.game.player(alice.address)).rodLevel).to.eq(1);
      await ctx.game.connect(key).setName("Sari");
      expect(await ctx.game.names(alice.address)).to.eq("Sari");
    });

    it("shares the existing bucket with a new key", async function () {
      const ctx = await deploy();
      await ctx.game.connect(alice).claimStarter();
      await ctx.game.connect(alice).cast(0);
      const key = await newKey();
      await expect(authSession(ctx, alice, key, (await time.latest()) + 3600))
        .to.emit(ctx.game, "SessionAuthorized")
        .withArgs(alice.address, key.address, anyUint, 5);
      const f = await ctx.game.getFish(3);
      expect(await fhevm.userDecryptEuint(FhevmType.euint64, f.price, ctx.gameAddress, key)).to.eq(
        await fhevm.userDecryptEuint(FhevmType.euint64, f.price, ctx.gameAddress, alice),
      );
    });

    it("stops a key when the session expires or is revoked", async function () {
      const ctx = await deploy();
      await ctx.game.connect(alice).claimStarter();
      const key = await newKey();
      await authorize(ctx, alice, key, 600);
      await time.increase(601);
      await expect(ctx.game.connect(key).cast(0))
        .to.be.revertedWithCustomError(ctx.game, "SessionExpired")
        .withArgs(key.address);
      expect(await ctx.game.activeKeyOf(alice.address)).to.eq(ethers.ZeroAddress);

      const key2 = await newKey();
      await authorize(ctx, alice, key2);
      await expect(ctx.game.connect(alice).revokeSession())
        .to.emit(ctx.game, "SessionRevoked")
        .withArgs(alice.address, key2.address);
      // after revocation the key is just an unrelated account: it cannot touch the player's fish or coins
      await ctx.game.connect(key2).cast(0);
      expect((await ctx.game.player(alice.address)).castCount).to.eq(0);
      expect(await balanceOf(ctx, alice)).to.eq(1000n);
    });

    it("rejects unsafe sessions", async function () {
      const ctx = await deploy();
      const now = await time.latest();
      const key = await newKey();
      const bad = (p: Promise<unknown>) => expect(p).to.be.revertedWithCustomError(ctx.game, "BadSession");
      await bad(authSession(ctx, alice, alice, now + 60));
      await bad(authSession(ctx, alice, key, now + 8 * 24 * 3600));
      await bad(authSession(ctx, alice, { address: ctx.gameAddress }, now + 60));
      await authorize(ctx, alice, key);
      await bad(authSession(ctx, bob, key, now + 600)); // the key already belongs to alice
      const third = await newKey();
      await bad(authSession(ctx, key, third, now + 600)); // a session key cannot own sessions
    });

    it("refuses to bind an address that did not co-sign (no locking other players out)", async function () {
      const ctx = await deploy();
      const now = await time.latest();
      const victimKey = await newKey(); // stands in for another player's fresh wallet
      const attacker = await newKey();
      await expect(authSession(ctx, bob, victimKey, now + 600, { signer: attacker })).to.be.revertedWithCustomError(
        ctx.game,
        "BadSession",
      );
      // a signature for another player or another expiry does not carry over
      const [v, r, sg] = await sessionSig(ctx.game, alice.address, victimKey, now + 600);
      await expect(ctx.game.connect(bob).authorizeSession(victimKey.address, now + 600, v, r, sg)).to.be.revertedWithCustomError(
        ctx.game,
        "BadSession",
      );
      await expect(ctx.game.connect(alice).authorizeSession(victimKey.address, now + 601, v, r, sg)).to.be.revertedWithCustomError(
        ctx.game,
        "BadSession",
      );
      expect(await ctx.game.playerOfKey(victimKey.address)).to.eq(ethers.ZeroAddress);
    });
  });

  describe("Sambar Ember (blind snatch, hidden nets)", function () {
    const dbg32 = (h: string) => fhevm.debugger.decryptEuint(FhevmType.euint32, h);
    const dbg64 = (h: string) => fhevm.debugger.decryptEuint(FhevmType.euint64, h);

    /** Alice has a full bucket and no newcomer shield; Bob is a thief with 2 casts. */
    async function island(overrides: SeasonOverrides = {}) {
      const ctx = await deploy({ starterAmount: 10_000n, ...overrides });
      for (const who of [alice, bob]) await ctx.game.connect(who).claimStarter();
      const aliceFish = [];
      for (let i = 0; i < 3; i++) aliceFish.push(...(await castAndRead(ctx, alice)));
      for (let i = 0; i < 2; i++) await ctx.game.connect(bob).cast(0);
      await time.increase(25); // past the "still wet" window
      return { ctx, aliceFish: aliceFish.filter((f) => f.tier !== TIER.SECRET) };
    }
    const snatchLogs = async (rc: { logs: { address: string; topics: readonly string[] }[] }) =>
      rc.logs.map((l) => `${l.address}:${l.topics[0]}:${l.topics.length}`);

    it("moves the fish to the thief and leaves a Sandal Jepit, readable only by the right owner", async function () {
      const { ctx, aliceFish } = await island();
      const target = aliceFish[0];
      const bobBefore = await balanceOf(ctx, bob);
      const aliceBefore = await balanceOf(ctx, alice);
      const newId = await ctx.game.fishCount();
      await expect(ctx.game.connect(bob).snatch(alice.address, target.id))
        .to.emit(ctx.game, "Snatched")
        .withArgs(bob.address, alice.address, target.id, newId);

      const sack = await ctx.game.getFish(newId);
      expect(sack.owner).to.eq(bob.address);
      expect(sack.origin).to.eq(1);
      expect(await fhevm.userDecryptEuint(FhevmType.euint32, sack.packed, ctx.gameAddress, bob)).to.eq(target.packed);
      await expect(fhevm.userDecryptEuint(FhevmType.euint32, sack.packed, ctx.gameAddress, alice)).to.be.rejected;
      const slot = await ctx.game.getFish(target.id);
      expect(await fhevm.userDecryptEuint(FhevmType.euint32, slot.packed, ctx.gameAddress, alice)).to.eq(0n);
      await expect(fhevm.userDecryptEuint(FhevmType.euint32, slot.packed, ctx.gameAddress, bob)).to.be.rejected;
      expect(slot.targeted).to.eq(true);
      expect(await balanceOf(ctx, bob)).to.eq(bobBefore - 5n);
      expect(await balanceOf(ctx, alice)).to.eq(aliceBefore); // the always-minted reward was 0
    });

    it("lets a hidden net catch the thief: the thief gets a sandal, the owner keeps the fish and the bait", async function () {
      const { ctx, aliceFish } = await island();
      const target = aliceFish[1];
      const enc = await fhevm.createEncryptedInput(ctx.gameAddress, alice.address).add32(Number(target.id)).encrypt();
      await expect(ctx.game.connect(alice).setNet(enc.handles[0], enc.inputProof)).to.emit(ctx.game, "NetSet");
      const aliceAfterNet = await balanceOf(ctx, alice);
      const net = (await ctx.game.player(alice.address)).netNext;
      await time.increase(21); // a new net arms after wetSeconds
      expect(await fhevm.userDecryptEuint(FhevmType.euint32, net, ctx.gameAddress, alice)).to.eq(target.id);
      await expect(fhevm.userDecryptEuint(FhevmType.euint32, net, ctx.gameAddress, bob)).to.be.rejected;

      const newId = await ctx.game.fishCount();
      await ctx.game.connect(bob).snatch(alice.address, target.id);
      expect(await dbg32((await ctx.game.getFish(newId)).packed)).to.eq(0n);
      expect(await dbg32((await ctx.game.getFish(target.id)).packed)).to.eq(target.packed);
      expect(await balanceOf(ctx, alice)).to.eq(aliceAfterNet + 5n);
    });

    it("makes Secret fish immune, and immunity looks exactly like a net", async function () {
      const ctx = await deploy({ starterAmount: 10_000n, secretOneIn: 2 });
      for (const who of [alice, bob]) await ctx.game.connect(who).claimStarter();
      let secret;
      for (let i = 0; i < 6 && !secret; i++) secret = (await castAndRead(ctx, alice)).find((f) => f.tier === TIER.SECRET);
      if (!secret) throw new Error("no Secret at 1-in-2 odds");
      for (let i = 0; i < 2; i++) await ctx.game.connect(bob).cast(0);
      for (let i = 0; i < 3; i++) await ctx.game.connect(alice).cast(0);
      await time.increase(25);
      const aliceBefore = await balanceOf(ctx, alice);
      const newId = await ctx.game.fishCount();
      await ctx.game.connect(bob).snatch(alice.address, secret.id);
      expect(await dbg32((await ctx.game.getFish(newId)).packed)).to.eq(0n);
      expect(await dbg32((await ctx.game.getFish(secret.id)).packed)).to.eq(secret.packed);
      expect(await balanceOf(ctx, alice)).to.eq(aliceBefore); // no net was hit, so no reward
    });

    it("leaves the same public trace whether the snatch succeeds or fails", async function () {
      const { ctx, aliceFish } = await island({ sambar: { thiefCooldown: 0, pairCooldown: 0, victimCooldown: 0 } });
      const caught = aliceFish[2];
      const enc = await fhevm.createEncryptedInput(ctx.gameAddress, alice.address).add32(Number(caught.id)).encrypt();
      await ctx.game.connect(alice).setNet(enc.handles[0], enc.inputProof);
      await time.increase(21);
      await ctx.game.connect(bob).snatch(alice.address, aliceFish[4].id); // first snatch also breaks bob's shield (public)
      const okRc = await (await ctx.game.connect(bob).snatch(alice.address, aliceFish[3].id)).wait();
      const failRc = await (await ctx.game.connect(bob).snatch(alice.address, caught.id)).wait();
      expect(await dbg32((await ctx.game.getFish(caught.id)).packed)).to.eq(caught.packed); // really failed
      expect(await snatchLogs(failRc!)).to.deep.eq(await snatchLogs(okRc!));
    });

    it("enforces the public anti-grief rules", async function () {
      const { ctx, aliceFish } = await island();
      const blocked = (p: Promise<unknown>, reason: number) =>
        expect(p).to.be.revertedWithCustomError(ctx.game, "SambarBlocked").withArgs(reason);
      await blocked(ctx.game.connect(alice).snatch(alice.address, aliceFish[0].id), 9);
      await ctx.game.connect(carol).cast(0); // carol: 1 cast, also shielded
      await blocked(ctx.game.connect(carol).snatch(alice.address, aliceFish[0].id), 1);
      await blocked(ctx.game.connect(alice).snatch(bob.address, 0), 3); // bob has the newcomer shield (2 casts < 3)

      await ctx.game.connect(bob).snatch(alice.address, aliceFish[0].id);
      await blocked(ctx.game.connect(bob).snatch(alice.address, aliceFish[1].id), 2); // thief cooldown
      await time.increase(50);
      await blocked(ctx.game.connect(bob).snatch(alice.address, aliceFish[1].id), 4); // pair cooldown (180 s)
      await time.increase(200);
      await blocked(ctx.game.connect(bob).snatch(alice.address, aliceFish[0].id), 8); // targeted once already
      // bob broke his own shield by snatching from a player
      expect((await ctx.game.player(bob.address)).shieldBroken).to.eq(true);
      const bobFish = await ctx.game.fishIdsOf(bob.address);
      await expect(ctx.game.connect(alice).snatch(bob.address, bobFish[0])).to.emit(ctx.game, "Snatched");
      // fresh catches are protected for 20 s
      const rc = await (await ctx.game.connect(alice).cast(0)).wait();
      const fresh = ctx.game.interface.parseLog(rc!.logs.find((l) => l.address === ctx.gameAddress)!)!.args.firstFishId;
      await time.increase(250);
      await ctx.game.connect(alice).cast(0);
      await blocked(ctx.game.connect(bob).snatch(alice.address, fresh + 5n), 8);
    });

    it("caps how often one victim can be targeted per hour", async function () {
      const { ctx, aliceFish } = await island({ sambar: { thiefCooldown: 0, pairCooldown: 0, victimCooldown: 0, maxTargetedPerHour: 2 } });
      await ctx.game.connect(bob).snatch(alice.address, aliceFish[0].id);
      await ctx.game.connect(bob).snatch(alice.address, aliceFish[1].id);
      await expect(ctx.game.connect(bob).snatch(alice.address, aliceFish[2].id))
        .to.be.revertedWithCustomError(ctx.game, "SambarBlocked")
        .withArgs(6);
      await time.increase(3601);
      await expect(ctx.game.connect(bob).snatch(alice.address, aliceFish[2].id)).to.emit(ctx.game, "Snatched");
    });

    it("gives a broke thief only a sandal and leaves the victim untouched", async function () {
      const { ctx, aliceFish } = await island();
      for (let i = 0; i < 2; i++) await ctx.game.connect(carol).cast(0); // carol never claimed: no coins
      const target = aliceFish[0];
      const newId = await ctx.game.fishCount();
      await ctx.game.connect(carol).snatch(alice.address, target.id);
      expect(await dbg32((await ctx.game.getFish(newId)).packed)).to.eq(0n);
      expect(await dbg32((await ctx.game.getFish(target.id)).packed)).to.eq(target.packed);
    });

    it("keeps Pak Kumis's practice bucket stocked, netted and Secret-free", async function () {
      const { ctx } = await island({ sambar: { thiefCooldown: 0, npcRestockCooldown: 60 } });
      const npc = await ctx.game.PAK_KUMIS();
      await expect(ctx.game.connect(carol).restockNpc()).to.emit(ctx.game, "NpcRestocked");
      const ids = await ctx.game.fishIdsOf(npc);
      expect(ids.length).to.eq(6);
      expect(await ctx.game.npcFresh()).to.eq(6);
      for (const id of ids) expect(Number(await dbg32((await ctx.game.getFish(id)).packed)) & 7).to.not.eq(TIER.SECRET);
      await expect(ctx.game.restockNpc()).to.be.revertedWithCustomError(ctx.game, "SambarBlocked").withArgs(10);
      await time.increase(25); // fresh fish are wet

      const net = await dbg32((await ctx.game.player(npc)).netFish);
      expect(net).to.be.gte(ids[0]).and.lte(ids[0] + 7n);
      for (const id of ids.slice(0, 4)) {
        const before = await dbg32((await ctx.game.getFish(id)).packed);
        const newId = await ctx.game.fishCount();
        await ctx.game.connect(bob).snatch(npc, id); // no shield, cooldown or minimum-bucket rules for the NPC
        const got = await dbg32((await ctx.game.getFish(newId)).packed);
        expect(got).to.eq(id === net ? 0n : before);
      }
      expect(await ctx.game.npcFresh()).to.eq(2);
      await time.increase(61);
      await expect(ctx.game.restockNpc()).to.emit(ctx.game, "NpcRestocked");
    });

    it("arms a new net only after wetSeconds, so it cannot be slipped in front of a pending snatch", async function () {
      const { ctx, aliceFish } = await island();
      const target = aliceFish[0];
      const enc = await fhevm.createEncryptedInput(ctx.gameAddress, alice.address).add32(Number(target.id)).encrypt();
      await ctx.game.connect(alice).setNet(enc.handles[0], enc.inputProof);
      const newId = await ctx.game.fishCount();
      await ctx.game.connect(bob).snatch(alice.address, target.id); // next block: the net is not armed yet
      expect(await dbg32((await ctx.game.getFish(newId)).packed)).to.eq(target.packed);
    });

    it("hides Secret immunity behind a public-odds ghost net", async function () {
      const { ctx, aliceFish } = await island({
        sambar: { ghostPer256: 255, thiefCooldown: 0, pairCooldown: 0, victimCooldown: 0 },
      });
      let sandals = 0;
      for (const target of aliceFish.slice(0, 3)) {
        const before = await balanceOf(ctx, alice);
        const newId = await ctx.game.fishCount();
        await ctx.game.connect(bob).snatch(alice.address, target.id);
        const got = await dbg32((await ctx.game.getFish(newId)).packed);
        const kept = await dbg32((await ctx.game.getFish(target.id)).packed);
        // exactly one side holds the fish, and a guarded fish pays its owner the bait
        expect(got === 0n ? kept : got).to.eq(target.packed);
        expect(await balanceOf(ctx, alice)).to.eq(before + (got === 0n ? 5n : 0n));
        if (got === 0n) sandals++;
      }
      expect(sandals).to.be.gte(2); // 255/256 per snatch
    });

    it("blocks player-to-player Pearl transfers (no farming starter coins with sybils)", async function () {
      const ctx = await deploy();
      await ctx.game.connect(alice).claimStarter();
      const bal = await ctx.coin.confidentialBalanceOf(alice.address);
      await expect(
        ctx.coin.connect(alice)["confidentialTransfer(address,bytes32)"](bob.address, bal),
      ).to.be.revertedWithCustomError(ctx.coin, "TransfersDisabled");
    });

    it("keeps counting Pak Kumis's leftovers after a restock", async function () {
      const { ctx } = await island({ sambar: { thiefCooldown: 0, npcRestockCooldown: 0 } });
      const npc = await ctx.game.PAK_KUMIS();
      await ctx.game.restockNpc();
      await time.increase(25);
      const ids = await ctx.game.fishIdsOf(npc);
      for (const id of ids.slice(0, 4)) await ctx.game.connect(bob).snatch(npc, id);
      await ctx.game.restockNpc(); // 2 left + 6 new
      expect(await ctx.game.npcFresh()).to.eq(8);
      await time.increase(25);
      for (const id of (await ctx.game.fishIdsOf(npc)).slice(4)) await ctx.game.connect(bob).snatch(npc, id);
      expect(await ctx.game.npcFresh()).to.eq(0);
    });

    it("works through a session key, on behalf of the player", async function () {
      const { ctx, aliceFish } = await island();
      const key = ethers.Wallet.createRandom().connect(ethers.provider);
      await authSession(ctx, bob, key, (await time.latest()) + 3600, { value: ethers.parseEther("0.01") });
      const newId = await ctx.game.fishCount();
      await expect(ctx.game.connect(key).snatch(alice.address, aliceFish[0].id))
        .to.emit(ctx.game, "Snatched")
        .withArgs(bob.address, alice.address, aliceFish[0].id, newId);
      const sack = await ctx.game.getFish(newId);
      expect(sack.owner).to.eq(bob.address);
      expect(await fhevm.userDecryptEuint(FhevmType.euint32, sack.packed, ctx.gameAddress, key)).to.eq(aliceFish[0].packed);
      expect(await dbg64(sack.price)).to.eq(aliceFish[0].price);
    });
  });

  describe("season end", function () {
    it("closes casting and proves how many Secrets were caught", async function () {
      const ctx = await deploy({ secretOneIn: 2, secretQuota: 4, endsInSeconds: 3600, starterAmount: 10_000n });
      await ctx.game.connect(alice).claimStarter();
      let caught = 0;
      for (const f of await castAndRead(ctx, alice)) if (f.tier === TIER.SECRET) caught++;
      await expect(ctx.game.endSeason()).to.be.revertedWithCustomError(ctx.game, "SeasonStillOpen");
      await time.increase(3601);
      await expect(ctx.game.connect(alice).cast(0)).to.be.revertedWithCustomError(ctx.game, "SeasonClosed");
      await expect(ctx.game.connect(bob).endSeason()).to.emit(ctx.game, "SeasonEndRequested");
      const { cleartexts, proof } = await publicProof(await ctx.game.secretsLeftHandle());
      await expect(ctx.game.finalizeSeason(cleartexts, proof))
        .to.emit(ctx.game, "SeasonEnded")
        .withArgs(1, 4 - caught, caught, 0);
      expect(await ctx.game.seasonEnded()).to.eq(true);
      await expect(ctx.game.finalizeSeason(cleartexts, proof)).to.be.revertedWith("not pending");
    });
  });
});
