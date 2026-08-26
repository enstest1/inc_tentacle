import type { PublicClient } from "viem";
import { tentacleAbi } from "./contracts";
import { chainById } from "./chains";
import type { BatchIntent } from "./intent";

export function buildArgs(intent: BatchIntent): readonly unknown[] {
  if (intent.functionName === "batchTokenWithGas") {
    return [intent.recipients, intent.amounts, intent.nativePerRecipient];
  }
  return [intent.recipients, intent.amounts];
}

/**
 * Simulate the EXACT call that will be signed — same sender, contract,
 * function, args, value and chain. Never simulate one thing and send another.
 */
export async function simulateBatch(client: PublicClient, intent: BatchIntent) {
  const chain = chainById(intent.chainId);
  if (!chain) throw new Error("Unsupported chain");
  return client.simulateContract({
    account: intent.sender,
    address: intent.tentacle,
    abi: tentacleAbi,
    functionName: intent.functionName,
    args: buildArgs(intent) as never,
    value: intent.functionName === "batchToken" ? undefined : intent.value,
    chain,
  } as never);
}
