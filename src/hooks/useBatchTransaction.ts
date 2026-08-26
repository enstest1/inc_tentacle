import { erc20Abi } from "@/lib/contracts";
import { waitForReceiptWithReplacement } from "@/lib/txWatch";
import type { ApprovalPlan } from "@/hooks/useAllowance";
import type { Address, Hash, PublicClient, WalletClient } from "viem";

export async function runApproval(
  walletClient: WalletClient,
  publicClient: PublicClient,
  token: Address,
  tentacle: Address,
  sender: Address,
  plan: Extract<ApprovalPlan, { kind: "approve" }>,
  onReplaced?: (hash: Hash, reason: string) => void,
): Promise<Hash> {
  const hash = await walletClient.writeContract({
    account: sender,
    address: token,
    abi: erc20Abi,
    functionName: "approve",
    args: [tentacle, plan.target],
    chain: walletClient.chain,
  });

  const receipt = await waitForReceiptWithReplacement(publicClient, hash, onReplaced);
  if (receipt.kind !== "confirmed") throw new Error("APPROVAL_REVERTED");

  const confirmed = await publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [sender, tentacle],
  });
  if (confirmed < plan.target) throw new Error("APPROVAL_NOT_APPLIED");
  return receipt.finalHash;
}
