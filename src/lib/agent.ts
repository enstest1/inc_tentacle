import {
  encodeFunctionData,
  formatUnits,
  isAddress,
  parseUnits,
  type Address,
  type Hex,
} from "viem";
import { chainById, addressUrl } from "./chains";
import { tentacleAbi } from "./contracts";
import { findDeployment } from "./deployments";

export type AgentAsset = "ETH" | "USDC" | "USDCE";
export type PrepareBatchInput = {
  chainId: number;
  asset: AgentAsset;
  recipients: string[];
  amounts: string[];
  nativePerRecipient?: string;
};

const ZERO = "0x0000000000000000000000000000000000000000";

function requireAddress(value: string, label: string): Address {
  if (!isAddress(value) || value.toLowerCase() === ZERO) {
    throw new Error(`${label} is not a valid non-zero address`);
  }
  return value as Address;
}
export function prepareBatch(input: PrepareBatchInput) {
  const chain = chainById(input.chainId);
  if (!chain || ![57073, 763373, 31337].includes(input.chainId)) {
    throw new Error(`Unsupported chain ${input.chainId}`);
  }
  if (input.recipients.length < 1 || input.recipients.length > 50) {
    throw new Error("Recipient count must be between 1 and 50");
  }
  if (input.recipients.length !== input.amounts.length) {
    throw new Error("Recipients and amounts must have the same length");
  }

  const recipients = input.recipients.map((value, index) =>
    requireAddress(value, `recipient[${index}]`),
  );
  const unique = new Set(recipients.map((value) => value.toLowerCase()));
  if (unique.size !== recipients.length) throw new Error("Duplicate recipients are not allowed");

  const deployment = findDeployment(input.chainId, input.asset);
  if (!deployment || deployment.tentacle.toLowerCase() === ZERO) {
    throw new Error(`Tentacle is not deployed for ${input.asset} on ${chain.name}`);
  }
  const decimals = input.asset === "ETH" ? 18 : deployment.tokenDecimals;
  const amounts = input.amounts.map((amount, index) => {
    const parsed = parseUnits(amount, decimals);
    if (parsed <= 0n) throw new Error(`amount[${index}] must be greater than zero`);
    return parsed;
  });
  let functionName: "batchNative" | "batchToken" | "batchTokenWithGas";
  let args: readonly unknown[];
  let value = 0n;

  if (input.asset === "ETH") {
    functionName = "batchNative";
    args = [recipients, amounts] as const;
    value = amounts.reduce((sum, amount) => sum + amount, 0n);
  } else if (input.nativePerRecipient && parseUnits(input.nativePerRecipient, 18) > 0n) {
    const nativePerRecipient = parseUnits(input.nativePerRecipient, 18);
    functionName = "batchTokenWithGas";
    args = [recipients, amounts, nativePerRecipient] as const;
    value = nativePerRecipient * BigInt(recipients.length);
  } else {
    functionName = "batchToken";
    args = [recipients, amounts] as const;
  }

  const data = encodeFunctionData({
    abi: tentacleAbi,
    functionName,
    args: args as never,
  }) as Hex;
  const totalAsset = amounts.reduce((sum, amount) => sum + amount, 0n);

  return {
    chainId: input.chainId,
    chain: chain.name,
    asset: input.asset,
    contract: deployment.tentacle,
    contractExplorer: addressUrl(input.chainId, deployment.tentacle),
    functionName,
    recipients: recipients.length,
    transaction: { to: deployment.tentacle, data, value: `0x${value.toString(16)}` },    totals: {
      assetBaseUnits: totalAsset.toString(),
      assetDisplay: formatUnits(totalAsset, decimals),
      nativeValueWei: value.toString(),
    },
    approval:
      input.asset === "ETH"
        ? null
        : {
            token: deployment.token,
            spender: deployment.tentacle,
            requiredBaseUnits: totalAsset.toString(),
          },
    note: "This payload is unsigned. The caller's wallet must review and sign it.",
  };
}
