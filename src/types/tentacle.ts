import type { Address } from "viem";

export type AssetId = "ETH" | "USDC" | "USDCE";
export type DistributionMode = "equal" | "custom";

export type TxState =
  | "EDITING"
  | "VALIDATING"
  | "NEEDS_APPROVAL"
  | "APPROVING"
  | "APPROVAL_PENDING"
  | "SIMULATING"
  | "READY"
  | "AWAITING_SIGNATURE"
  | "TRANSACTION_PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

export type RecipientRow = {
  id: string;
  raw: string;
  address?: Address;
  amountRaw: string;
};

export type ApprovalPlan =
  | { kind: "none"; current: bigint }
  | { kind: "approve"; current: bigint; target: bigint };

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

export function assetDecimals(asset: AssetId): number {
  return asset === "ETH" ? 18 : 6;
}

export function assetSymbol(asset: AssetId): string {
  if (asset === "ETH") return "ETH";
  if (asset === "USDC") return "USDC";
  return "USDC.e";
}
