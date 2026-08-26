/**
 * Exact-allowance planner. approve() sets an absolute value on Circle FiatToken,
 * so we set `target = required`, never an increment, never uint256.max.
 */
export type ApprovalPlan =
  | { kind: "none"; current: bigint }
  | { kind: "approve"; current: bigint; target: bigint };

export function planApproval(current: bigint, required: bigint): ApprovalPlan {
  if (current >= required) return { kind: "none", current };
  return { kind: "approve", current, target: required };
}
