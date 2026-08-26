import type { Address, Hash } from "viem";

export type PlannedBatch = {
  index: number;
  recipients: Address[];
  amounts: bigint[];
  total: bigint;
  status:
    | "pending"
    | "simulating"
    | "ready"
    | "signing"
    | "confirming"
    | "done"
    | "failed";
  hash?: Hash;
};

/**
 * Splits a recipient list into contract-sized batches.
 * `maxPerBatch` must be read from the deployed contract, not hardcoded.
 */
export function planBatches(
  recipients: readonly Address[],
  amounts: readonly bigint[],
  maxPerBatch: number,
): PlannedBatch[] {
  const batches: PlannedBatch[] = [];
  for (let i = 0; i < recipients.length; i += maxPerBatch) {
    const r = recipients.slice(i, i + maxPerBatch);
    const a = amounts.slice(i, i + maxPerBatch);
    batches.push({
      index: batches.length,
      recipients: [...r],
      amounts: [...a],
      total: a.reduce((s, v) => s + v, 0n),
      status: "pending",
    });
  }
  return batches;
}
