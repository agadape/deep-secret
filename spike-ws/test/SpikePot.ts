import { FhevmType } from "@fhevm/hardhat-plugin";
import { expect } from "chai";
import { ethers, fhevm, network } from "hardhat";

// Local mock: deploys LocalUSDT + LocalCUSDT. Sepolia: uses the official USDTMock / cUSDTMock.
const SEPOLIA_USDT = "0xa7dA08FafDC9097Cc0E7D4f113A61e31d7e8e9b0";
const SEPOLIA_CUSDT = "0x4E7B06D78965594eB5EF5414c357ca21E1554491";
const U = 1_000_000n; // 6 decimals

describe("SpikePot (ERC-7984 stakes)", function () {
  this.timeout(20 * 60_000);

  let alice: any, bob: any, usdt: any, cusdt: any, pot: any;
  let cusdtAddr: string, potAddr: string;
  const t0 = Date.now();
  const log = (m: string) => console.log(`    [${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);
  const send = async (label: string, txp: Promise<any>) => {
    const s = Date.now();
    const tx = await txp;
    const rc = await tx.wait();
    log(`${label}: tx ${tx.hash} gas=${rc.gasUsed} ${((Date.now() - s) / 1000).toFixed(1)}s`);
    return rc;
  };
  // public RPCs are load-balanced: a read right after a tx can hit a node that has not seen the block yet
  const dec = async (h: string, contract: string, who: any): Promise<bigint> => {
    for (let i = 0; ; i++) {
      try {
        return await fhevm.userDecryptEuint(FhevmType.euint64, h, contract, who);
      } catch (e: any) {
        if (i >= 5 || !/not authorized/.test(e.message ?? "")) throw e;
        log("stale ACL read, retrying in 4s");
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
  };
  const bal = async (who: any) => {
    const h = await cusdt.confidentialBalanceOf(who.address);
    if (h === ethers.ZeroHash) return 0n;
    const s = Date.now();
    const v = await dec(h, cusdtAddr, who);
    log(`userDecrypt balance ${who.address.slice(0, 8)} = ${v} (${((Date.now() - s) / 1000).toFixed(1)}s)`);
    return v;
  };

  before(async function () {
    [alice, bob] = await ethers.getSigners();
    log(`network=${network.name} mock=${fhevm.isMock} alice=${alice.address} bob=${bob.address}`);
    if (fhevm.isMock) {
      usdt = await (await ethers.getContractFactory("LocalUSDT")).deploy();
      cusdt = await (await ethers.getContractFactory("LocalCUSDT")).deploy(await usdt.getAddress());
    } else {
      usdt = await ethers.getContractAt("LocalUSDT", SEPOLIA_USDT);
      cusdt = await ethers.getContractAt("LocalCUSDT", SEPOLIA_CUSDT);
    }
    cusdtAddr = await cusdt.getAddress();
    if (process.env.SPIKEPOT_ADDRESS) {
      pot = await ethers.getContractAt("SpikePot", process.env.SPIKEPOT_ADDRESS);
    } else {
      pot = await (await ethers.getContractFactory("SpikePot")).deploy(cusdtAddr);
      await pot.waitForDeployment();
    }
    potAddr = await pot.getAddress();
    log(`cUSDT=${cusdtAddr} SpikePot=${potAddr}`);
  });

  it("S8 mint mock USDT, wrap to cUSDT, read own encrypted balance", async function () {
    const before = await bal(alice);
    await send("USDT.mint(alice, 100)", usdt.connect(alice).mint(alice.address, 100n * U));
    await send("USDT.approve(cUSDT)", usdt.connect(alice).approve(cusdtAddr, 100n * U));
    await send("cUSDT.wrap(alice, 100)", cusdt.connect(alice).wrap(alice.address, 100n * U));
    expect((await bal(alice)) - before).to.eq(100n * U);
  });

  it("S9 stake into a game contract (public ante + hidden amount), then pay the winner", async function () {
    const aliceBefore = await bal(alice);
    const bobBefore = await bal(bob);
    const until = Math.floor(Date.now() / 1000) + 3600;
    await send("cUSDT.setOperator(pot)", cusdt.connect(alice).setOperator(potAddr, until));
    await send("pot.stakeFixed(10)", pot.connect(alice).stakeFixed(10n * U));

    const s = Date.now();
    const enc = await fhevm.createEncryptedInput(potAddr, alice.address).add64(5n * U).encrypt();
    log(`encrypt hidden stake: ${((Date.now() - s) / 1000).toFixed(1)}s`);
    await send("pot.stakeHidden(enc 5)", pot.connect(alice).stakeHidden(enc.handles[0], enc.inputProof));

    const staked = await dec(await pot.stakedOf(alice.address), potAddr, alice);
    expect(staked).to.eq(15n * U);
    expect(aliceBefore - (await bal(alice))).to.eq(15n * U);

    await send("pot.payout(bob)", pot.connect(alice).payout(bob.address));
    expect((await bal(bob)) - bobBefore).to.eq(15n * U);
  });

  it("S10 short balance: transfer silently moves 0 instead of reverting", async function () {
    // bob never set the pot as operator -> must revert (clear error); then with operator but huge amount -> 0 moved
    await expect(pot.connect(bob).stakeFixed.staticCall(1n * U)).to.be.reverted;
    const until = Math.floor(Date.now() / 1000) + 3600;
    await send("cUSDT.setOperator(pot) by bob", cusdt.connect(bob).setOperator(potAddr, until));
    const before = await bal(bob);
    await send("pot.stakeFixed(1e12) by bob", pot.connect(bob).stakeFixed(1_000_000n * U));
    const staked = await dec(await pot.stakedOf(bob.address), potAddr, bob);
    log(`bob staked=${staked} (expected 0: balance too small)`);
    expect(staked).to.eq(0n);
    expect(await bal(bob)).to.eq(before);
  });
});
