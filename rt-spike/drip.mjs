// Gas drip for guest players ("Play now"): sends a little Sepolia ETH to a fresh in-browser wallet so a judge can
// play without MetaMask or a faucet. Testnet only. Limits keep a script from draining the funding wallet.
import { createPublicClient, createWalletClient, formatEther, http, isAddress, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const DAY = 24 * 3600 * 1000;
const FEES = { maxFeePerGas: 200_000n, maxPriorityFeePerGas: 100_000n }; // Sepolia base fee ≈ 20 wei (SPIKE_LOG S16)

export function createDrip({ privateKey, rpc, amountEth = "0.0002", minEth = "0.00005", dailyBudgetEth = "0.02" }) {
  if (!privateKey) return undefined;
  const account = privateKeyToAccount(privateKey);
  const pub = createPublicClient({ chain: sepolia, transport: http(rpc) });
  const wallet = createWalletClient({ account, chain: sepolia, transport: http(rpc) });
  const amount = parseEther(amountEth);
  const min = parseEther(minEth);
  const budget = parseEther(dailyBudgetEth);

  let day = Math.floor(Date.now() / DAY);
  let spent = 0n;
  const perAddress = new Map();
  const perIp = new Map();
  const recent = new Map(); // address → { tx, at }: a drip still confirming counts as done
  let nonce; // tracked locally: the load-balanced RPC can report a stale nonce right after a send
  let queue = Promise.resolve();

  const rollDay = () => {
    const d = Math.floor(Date.now() / DAY);
    if (d !== day) {
      day = d;
      spent = 0n;
      perAddress.clear();
      perIp.clear();
    }
  };

  async function send(to) {
    if (nonce === undefined) nonce = await pub.getTransactionCount({ address: account.address, blockTag: "pending" });
    try {
      // Funding a brand-new account costs ~207k gas on Sepolia today, not 21k: always estimate (+20%).
      const est = await pub.estimateGas({ account: account.address, to, value: amount });
      const hash = await wallet.sendTransaction({ to, value: amount, nonce, gas: (est * 12n) / 10n, ...FEES });
      nonce += 1;
      return hash;
    } catch (e) {
      nonce = undefined; // resync on the next request
      throw e;
    }
  }

  /** Returns { status, ...detail } and an HTTP status code. */
  async function request(address, ip) {
    rollDay();
    if (!isAddress(address)) return [400, { status: "bad_address" }];
    const to = address.toLowerCase();
    const last = recent.get(to);
    if (last && Date.now() - last.at < 120_000) return [200, { status: "pending", tx: last.tx }];
    if ((perAddress.get(to) ?? 0) >= 3) return [429, { status: "address_limit" }];
    if ((perIp.get(ip) ?? 0) >= 5) return [429, { status: "ip_limit" }];
    if (spent + amount > budget) return [503, { status: "daily_budget_spent" }];
    // claim the slot synchronously so concurrent requests for the same address cannot both pass the checks
    recent.set(to, { tx: undefined, at: Date.now() });
    try {
      if ((await pub.getCode({ address: to })) !== undefined) {
        recent.delete(to);
        return [400, { status: "not_a_wallet" }];
      }
      const balance = await pub.getBalance({ address: to });
      if (balance >= min) {
        recent.delete(to);
        return [200, { status: "enough", balance: formatEther(balance) }];
      }
      perAddress.set(to, (perAddress.get(to) ?? 0) + 1);
      perIp.set(ip, (perIp.get(ip) ?? 0) + 1);
      spent += amount;
      const hash = await (queue = queue.then(() => send(to), () => send(to)));
      recent.set(to, { tx: hash, at: Date.now() });
      return [200, { status: "sent", tx: hash, amount: amountEth }];
    } catch (e) {
      recent.delete(to);
      throw e;
    }
  }

  return { request, from: account.address };
}
