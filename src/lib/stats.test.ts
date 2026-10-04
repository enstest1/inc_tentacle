import { describe, expect, it } from "vitest";
import { zeroAddress, type Address } from "viem";
import { aggregateBatchEvents, configuredTokenTotals, type BatchEventLike } from "./stats";

const A = "0x1111111111111111111111111111111111111111" as Address;
const B = "0x2222222222222222222222222222222222222222" as Address;
const TOKEN = "0x3333333333333333333333333333333333333333" as Address;

const events: BatchEventLike[] = [
  { sender: A, asset: zeroAddress, totalAssetAmount: 10n, totalNativeTopUp: 0n, recipientCount: 2n },
  { sender: A, asset: TOKEN, totalAssetAmount: 20n, totalNativeTopUp: 3n, recipientCount: 3n },
  { sender: B, asset: TOKEN, totalAssetAmount: 5n, totalNativeTopUp: 0n, recipientCount: 1n },
];

describe("aggregateBatchEvents", () => {
  it("aggregates reviewer-facing onchain metrics", () => {
    const stats = aggregateBatchEvents(events);
    expect(stats.batches).toBe(3);
    expect(stats.recipients).toBe(6);
    expect(stats.uniqueSenders).toBe(2);
    expect(stats.nativeWei).toBe(10n);
    expect(stats.nativeTopUpWei).toBe(3n);
    expect(stats.ethDistributedWei).toBe(13n);
    expect(stats.tokenTotals[TOKEN.toLowerCase()]).toBe(25n);
  });

  it("returns zeros for no activity", () => {
    expect(aggregateBatchEvents([])).toEqual({
      batches: 0,
      recipients: 0,
      uniqueSenders: 0,
      nativeWei: 0n,
      nativeTopUpWei: 0n,
      ethDistributedWei: 0n,
      tokenTotals: {},
    });
  });

  it("lists configured tokens with truthful zero totals", () => {
    const totals = configuredTokenTotals(
      [
        { label: "USDC", token: TOKEN, tokenSymbol: "USDC", tokenDecimals: 6 },
        { label: "USDC.e", token: B, tokenSymbol: "USDC.e", tokenDecimals: 6 },
      ] as never,
      { [TOKEN.toLowerCase()]: 25n },
    );
    expect(totals).toEqual([
      { label: "USDC", symbol: "USDC", address: TOKEN, decimals: 6, total: 25n },
      { label: "USDC.e", symbol: "USDC.e", address: B, decimals: 6, total: 0n },
    ]);
  });
});
