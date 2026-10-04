import { zeroAddress, type Address } from "viem";

export type BatchEventLike = {
  sender: Address;
  asset: Address;
  totalAssetAmount: bigint;
  totalNativeTopUp: bigint;
  recipientCount: bigint;
};

export type BatchStats = {
  batches: number;
  recipients: number;
  uniqueSenders: number;
  nativeWei: bigint;
  nativeTopUpWei: bigint;
  ethDistributedWei: bigint;
  tokenTotals: Record<string, bigint>;
};

type TokenConfiguration = {
  label: string;
  token: Address;
  tokenSymbol: string;
  tokenDecimals: number;
};

export function aggregateBatchEvents(events: readonly BatchEventLike[]): BatchStats {
  const senders = new Set<string>();
  const tokenTotals: Record<string, bigint> = {};
  let recipients = 0;
  let nativeWei = 0n;
  let nativeTopUpWei = 0n;

  for (const event of events) {
    senders.add(event.sender.toLowerCase());
    recipients += Number(event.recipientCount);
    nativeTopUpWei += event.totalNativeTopUp;
    if (event.asset.toLowerCase() === zeroAddress) {
      nativeWei += event.totalAssetAmount;
    } else {
      const key = event.asset.toLowerCase();
      tokenTotals[key] = (tokenTotals[key] ?? 0n) + event.totalAssetAmount;
    }
  }
  return {
    batches: events.length,
    recipients,
    uniqueSenders: senders.size,
    nativeWei,
    nativeTopUpWei,
    ethDistributedWei: nativeWei + nativeTopUpWei,
    tokenTotals,
  };
}

/** Includes every configured token, including truthful zero-activity totals. */
export function configuredTokenTotals(configurations: readonly TokenConfiguration[], totals: Record<string, bigint>) {
  return configurations.map((configuration) => ({
    label: configuration.label,
    symbol: configuration.tokenSymbol,
    address: configuration.token,
    decimals: configuration.tokenDecimals,
    total: totals[configuration.token.toLowerCase()] ?? 0n,
  }));
}
