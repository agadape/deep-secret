// S1 — read-only facts from live Sepolia: chain, Zama core contracts, cUSDT mock, wrappers registry, wallet balances.
import { ethers, network } from "hardhat";

const ADDR = {
  ACL: "0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D",
  EXECUTOR: "0x92C920834Ec8941d2C77D188936E1f7A6f49c127",
  KMS_VERIFIER: "0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A",
  HCU_LIMIT: "0xa10998783c8CF88D886Bc30307e631D6686F0A22",
  REGISTRY: "0x2f0750Bbb0A246059d80e94c454586a7F27a128e",
  CUSDT: "0x4E7B06D78965594eB5EF5414c357ca21E1554491",
  USDT: "0xa7dA08FafDC9097Cc0E7D4f113A61e31d7e8e9b0",
};

async function tryCall(label: string, f: () => Promise<unknown>) {
  try {
    console.log(`${label}: ${String(await f())}`);
  } catch (e: any) {
    console.log(`${label}: ERROR ${(e.shortMessage ?? e.message).slice(0, 140)}`);
  }
}

async function main() {
  const p = ethers.provider;
  const net = await p.getNetwork();
  const block = await p.getBlock("latest");
  console.log(`network=${network.name} chainId=${net.chainId} block=${block?.number} ts=${block?.timestamp}`);
  const fee = await p.getFeeData();
  console.log(`gasPrice=${ethers.formatUnits(fee.gasPrice ?? 0n, "gwei")} gwei`);
  for (const [k, a] of Object.entries(ADDR)) {
    const code = await p.getCode(a);
    console.log(`${k} ${a} codeBytes=${(code.length - 2) / 2}`);
  }
  for (const s of await ethers.getSigners()) {
    console.log(`wallet ${s.address} balance=${ethers.formatEther(await p.getBalance(s.address))} ETH`);
  }
  const erc = ["function name() view returns (string)", "function symbol() view returns (string)", "function decimals() view returns (uint8)", "function totalSupply() view returns (uint256)"];
  const usdt = new ethers.Contract(ADDR.USDT, erc, p);
  const cusdt = new ethers.Contract(ADDR.CUSDT, [...erc, "function underlying() view returns (address)", "function rate() view returns (uint256)", "function contractURI() view returns (string)", "function confidentialTotalSupply() view returns (bytes32)", "function supportsInterface(bytes4) view returns (bool)", "function inferredTotalSupply() view returns (uint256)"], p);
  await tryCall("USDT.name", () => usdt.name());
  await tryCall("USDT.symbol", () => usdt.symbol());
  await tryCall("USDT.decimals", () => usdt.decimals());
  await tryCall("cUSDT.name", () => cusdt.name());
  await tryCall("cUSDT.symbol", () => cusdt.symbol());
  await tryCall("cUSDT.decimals", () => cusdt.decimals());
  await tryCall("cUSDT.underlying", () => cusdt.underlying());
  await tryCall("cUSDT.rate", () => cusdt.rate());
  await tryCall("cUSDT.inferredTotalSupply", () => cusdt.inferredTotalSupply());
  await tryCall("cUSDT.confidentialTotalSupply(handle)", () => cusdt.confidentialTotalSupply());
  // ERC-1363 on the underlying decides whether one-tx wrap (transferAndCall) is possible
  const i165 = new ethers.Contract(ADDR.USDT, ["function supportsInterface(bytes4) view returns (bool)"], p);
  await tryCall("USDT.supportsInterface(ERC1363 0xb0202a11)", () => i165.supportsInterface("0xb0202a11"));
  const reg = new ethers.Contract(ADDR.REGISTRY, ["function getConfidentialTokenAddress(address) view returns (bool, address)"], p);
  await tryCall("registry.getConfidentialTokenAddress(USDT)", () => reg.getConfidentialTokenAddress(ADDR.USDT));
  // can anyone mint the mock underlying? simulate from our wallet without sending
  const [me] = await ethers.getSigners();
  const mint = new ethers.Contract(ADDR.USDT, ["function mint(address,uint256)"], me);
  await tryCall("USDT.mint(me, 1000e6) simulation", async () => {
    await mint.mint.staticCall(me.address, 1_000_000_000n);
    return "would succeed";
  });
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
