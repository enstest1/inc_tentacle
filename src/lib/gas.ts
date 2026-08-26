import { encodeFunctionData, type Address, type PublicClient } from "viem";
import { tentacleAbi } from "./contracts";

export type CostEstimate = {
  l2GasLimit: bigint;
  l2Fee: bigint;
  l1Fee: bigint;
  totalFee: bigint; // l2Fee + l1Fee, already buffered
  calldataBytes: number;
};

export const BUFFER_BPS = 2000n; // +20%

export function applyBuffer(raw: bigint, bps = BUFFER_BPS): bigint {
  return raw + (raw * bps) / 10_000n;
}

const GAS_PRICE_ORACLE = "0x420000000000000000000000000000000000000F" as const;
const oracleAbi = [
  {
    name: "getL1Fee",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_data", type: "bytes" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

type L2Client = PublicClient & {
  estimateL1Fee?: (tx: {
    account: Address;
    to: Address;
    data: `0x${string}`;
    value: bigint;
  }) => Promise<bigint>;
};

/**
 * Prices a batch as L2 execution + OP Stack L1 data fee, then adds 20%.
 * Never show execution-only cost on Ink.
 */
export async function estimateBatchCost(
  client: PublicClient,
  args: {
    account: Address;
    tentacle: Address;
    functionName: "batchNative" | "batchToken" | "batchTokenWithGas";
    args: readonly unknown[];
    value: bigint;
  },
): Promise<CostEstimate> {
  const data = encodeFunctionData({
    abi: tentacleAbi,
    functionName: args.functionName,
    args: args.args as never,
  });

  const tx = {
    account: args.account,
    to: args.tentacle,
    data,
    value: args.value,
  } as const;

  const l2Client = client as L2Client;
  const [l2GasLimit, l1Fee, gasPrice] = await Promise.all([
    client.estimateGas(tx),
    estimateL1Fee(l2Client, tx, data),
    client.getGasPrice(),
  ]);

  const l2Fee = l2GasLimit * gasPrice;
  const raw = l2Fee + l1Fee;
  const totalFee = applyBuffer(raw);

  return {
    l2GasLimit,
    l2Fee,
    l1Fee,
    totalFee,
    calldataBytes: (data.length - 2) / 2,
  };
}

async function estimateL1Fee(
  client: L2Client,
  tx: { account: Address; to: Address; data: `0x${string}`; value: bigint },
  data: `0x${string}`,
): Promise<bigint> {
  // Anvil is not an OP Stack chain — the GasPriceOracle predeploy is absent.
  if (client.chain?.id === 31337) return 0n;
  if (typeof client.estimateL1Fee === "function") {
    return client.estimateL1Fee(tx);
  }
  // Fallback: GasPriceOracle predeploy (spec §21.2).
  return client.readContract({
    address: GAS_PRICE_ORACLE,
    abi: oracleAbi,
    functionName: "getL1Fee",
    args: [data],
  });
}
