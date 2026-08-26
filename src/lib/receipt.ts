import type { Address, Hash } from "viem";
import { toCsv } from "./csvExport";
import { formatAmount } from "./amounts";

export type ReceiptRecord = {
  product: "Tentacle";
  version: "1";
  network: string;
  chainId: number;
  tentacleContract: Address;
  transactionHash: Hash;
  blockNumber: string;
  sender: Address;
  asset: string;
  assetAddress: Address;
  total: string;
  nativeTopUpPerRecipient: string;
  recipients: { address: Address; amount: string }[];
  confirmations: number;
  confirmedAt: string;
};

/**
 * JSON export. Bigints are converted to decimal strings first —
 * JSON.stringify throws on bigint.
 */
export function receiptToJson(record: ReceiptRecord): string {
  return JSON.stringify(record, null, 2);
}

export function receiptToCsv(record: ReceiptRecord): string {
  const rows: string[][] = [
    ["address", "amount"],
    ...record.recipients.map((r) => [r.address, r.amount]),
  ];
  return toCsv(rows);
}

export function buildReceipt(args: {
  chainId: number;
  network: string;
  tentacle: Address;
  hash: Hash;
  blockNumber: bigint;
  sender: Address;
  assetSymbol: string;
  assetAddress: Address;
  decimals: number;
  total: bigint;
  nativePerRecipient: bigint;
  recipients: readonly Address[];
  amounts: readonly bigint[];
}): ReceiptRecord {
  return {
    product: "Tentacle",
    version: "1",
    network: args.network,
    chainId: args.chainId,
    tentacleContract: args.tentacle,
    transactionHash: args.hash,
    blockNumber: args.blockNumber.toString(),
    sender: args.sender,
    asset: args.assetSymbol,
    assetAddress: args.assetAddress,
    total: formatAmount(args.total, args.decimals),
    nativeTopUpPerRecipient: formatAmount(args.nativePerRecipient, 18),
    recipients: args.recipients.map((address, i) => ({
      address,
      amount: formatAmount(args.amounts[i] ?? 0n, args.decimals),
    })),
    confirmations: 2,
    confirmedAt: new Date().toISOString(),
  };
}

const HISTORY_KEY = "tentacle.deviceHistory";

export type DeviceHistoryItem = {
  hash: Hash;
  chainId: number;
  status: "PENDING" | "CONFIRMED" | "FAILED" | "CANCELLED";
  timestamp: number;
};

/** Session/device history only. Never stores keys, seeds, or signatures. */
export function loadDeviceHistory(): DeviceHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as DeviceHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveDeviceHistoryItem(item: DeviceHistoryItem): void {
  if (typeof window === "undefined") return;
  const next = [item, ...loadDeviceHistory().filter((h) => h.hash !== item.hash)].slice(0, 20);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}
