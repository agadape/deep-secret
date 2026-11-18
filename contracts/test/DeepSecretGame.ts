import { FhevmType } from "@fhevm/hardhat-plugin";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
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
}>;

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
  ).deploy(await coin.getAddress(), await nft.getAddress(), cfg)) as unknown as DeepSecretGame;
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
      let legends = 0;
      for (let i = 0; i < 6; i++) {
        for (const f of await castAndRead(ctx, alice)) {
          if (f.tier === TIER.SECRET) secrets++;
          if (f.tier === TIER.LEGENDA) legends++;
        }
      }
      expect(secrets).to.eq(3);
      expect(legends).to.be.gt(0); // over-quota Secret rolls fall back to Legenda
      expect(await fhevm.debugger.decryptEuint(FhevmType.euint8, await ctx.game.secretsLeftHandle())).to.eq(0n);
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
