import type { Hash, PublicClient, TransactionReceipt } from "viem";

export type WatchResult =
  | { kind: "confirmed"; receipt: TransactionReceipt; finalHash: Hash }
  | { kind: "cancelled"; finalHash: Hash }
  | { kind: "reverted"; receipt: TransactionReceipt; finalHash: Hash };

/**
 * Replacement-aware receipt watching. If the user speeds up or cancels in the
 * wallet, the hash changes and the UI must follow the new hash.
 */
export async function waitForReceiptWithReplacement(
  client: PublicClient,
  hash: Hash,
  onReplacedNotice?: (newHash: Hash, reason: string) => void,
): Promise<WatchResult> {
  let finalHash = hash;
  let cancelled = false;

  const receipt = await client.waitForTransactionReceipt({
    hash,
    // Anvil only mines when a tx arrives, so a 2-confirmation wait hangs locally.
    confirmations: client.chain?.id === 31337 ? 1 : 2,
    onReplaced: (replacement) => {
      finalHash = replacement.transaction.hash;
      if (replacement.reason === "cancelled") cancelled = true;
      onReplacedNotice?.(finalHash, replacement.reason);
    },
  });

  if (cancelled) return { kind: "cancelled", finalHash };
  if (receipt.status !== "success") return { kind: "reverted", receipt, finalHash };
  return { kind: "confirmed", receipt, finalHash };
}
