import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// Development season on Sepolia. The final judging deployment gets a fresh season (GAME_SPEC §6.4, §17).
const SEASON = {
  number: 1,
  endsAt: Math.floor(Date.UTC(2027, 2, 31) / 1000), // open through judging
  secretQuota: 20,
  starterAmount: 100n,
  baitPrice: 5n,
  secretOneIn: 40,
  legendOneIn: 25,
  epicOneIn: 8,
  rareOneIn: 3,
  rodBonusPct: 25,
  reefBonusPct: 50,
  trenchBonusPct: 100,
  rodPrices: [20n, 40n, 80n, 160n],
};

const func: DeployFunction = async function ({ deployments, getNamedAccounts, ethers }: HardhatRuntimeEnvironment) {
  const { deployer } = await getNamedAccounts();
  const { deploy, execute, read, log } = deployments;

  const coin = await deploy("PearlCoin", { from: deployer, args: [deployer], log: true });
  const nft = await deploy("SecretFishNFT", { from: deployer, args: [deployer], log: true });
  const game = await deploy("DeepSecretGame", { from: deployer, args: [coin.address, nft.address, SEASON], log: true });

  if ((await read("PearlCoin", "game")) === ethers.ZeroAddress) {
    await execute("PearlCoin", { from: deployer, log: true }, "setGame", game.address);
  }
  if ((await read("SecretFishNFT", "game")) === ethers.ZeroAddress) {
    await execute("SecretFishNFT", { from: deployer, log: true }, "setGame", game.address);
  }
  log(`PearlCoin ${coin.address}\nSecretFishNFT ${nft.address}\nDeepSecretGame ${game.address}`);
};
export default func;
func.id = "deploy_deep_secret";
func.tags = ["DeepSecret"];
