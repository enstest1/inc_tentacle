import { describe, expect, it } from "vitest";
import { buildNativeBatch, parseCampaignArguments } from "./interaction-campaign.mjs";

describe("interaction campaign input validation", () => {
  it("uses a safe local default", () => {
    expect(parseCampaignArguments([])).toEqual({ network: "anvil", count: 30, rpcUrl: undefined });
  });

  it("accepts only the documented safe networks and count range", () => {
    expect(parseCampaignArguments(["--network", "sepolia", "--count", "20"])).toEqual({
      network: "sepolia",
      count: 20,
      rpcUrl: undefined,
    });
    expect(() => parseCampaignArguments(["--network", "mainnet"])).toThrow("anvil or sepolia");
    expect(() => parseCampaignArguments(["--count", "19"])).toThrow("between 20 and 50");
    expect(() => parseCampaignArguments(["--count", "51"])).toThrow("between 20 and 50");
    expect(() => parseCampaignArguments(["--count", "2.5"])).toThrow("whole number");
  });

  it("creates small, varied native batches without blocked recipients", () => {
    const batch = buildNativeBatch("anvil", 3, [
      "0x1111111111111111111111111111111111111111",
      "0x2222222222222222222222222222222222222222",
    ]);
    expect(batch.recipients).toHaveLength(5);
    expect(new Set(batch.recipients.map((address: string) => address.toLowerCase())).size).toBe(5);
    expect(batch.recipients.map((address: string) => address.toLowerCase())).not.toContain(
      "0x1111111111111111111111111111111111111111",
    );
    expect(batch.totalWei).toBeGreaterThan(0n);
  });
});