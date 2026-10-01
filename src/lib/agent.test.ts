import { describe, expect, it } from "vitest";
import { prepareBatch } from "./agent";

const A = "0x1111111111111111111111111111111111111111";
const B = "0x2222222222222222222222222222222222222222";

describe("prepareBatch", () => {
  it("builds unsigned Ink Sepolia native calldata", () => {
    const result = prepareBatch({
      chainId: 763373,
      asset: "ETH",
      recipients: [A, B],
      amounts: ["0.000001", "0.000002"],
    });
    expect(result.contract).toBe("0xDc44eAa018d93f05CB66078a7AB2eEe49a80524a");
    expect(result.functionName).toBe("batchNative");
    expect(result.recipients).toBe(2);
    expect(result.transaction.data.startsWith("0x")).toBe(true);
    expect(BigInt(result.transaction.value)).toBe(3_000_000_000_000n);
  });

  it("rejects duplicate recipients", () => {
    expect(() =>
      prepareBatch({ chainId: 763373, asset: "ETH", recipients: [A, A], amounts: ["1", "1"] }),
    ).toThrow("Duplicate recipients");
  });

  it("refuses an undeployed mainnet route", () => {
    expect(() =>
      prepareBatch({ chainId: 57073, asset: "ETH", recipients: [A], amounts: ["0.001"] }),
    ).toThrow("not deployed");
  });
});
