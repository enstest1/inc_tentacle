import { describe, expect, it } from "vitest";
import { parseAmount, sumAmounts, AmountError } from "./amounts";

describe("parseAmount", () => {
  it.each([
    ["0.5", 18, 500000000000000000n],
    ["1", 18, 1000000000000000000n],
    ["100.25", 6, 100250000n],
    ["0.0002", 18, 200000000000000n],
  ] as const)("parses %s with %i decimals", (input, decimals, expected) => {
    expect(parseAmount(input, decimals)).toBe(expected);
  });

  it.each([
    ["0.1234567", 6, "TOO_MANY_DECIMALS"],
    ["-1", 18, "NEGATIVE"],
    ["1e18", 18, "SCIENTIFIC"],
    ["1,000", 6, "THOUSANDS_SEPARATOR"],
    ["0,5", 18, "LOCALE_COMMA"],
    ["$100", 6, "NOT_A_NUMBER"],
    [".5", 18, "NOT_A_NUMBER"],
    ["abc", 6, "NOT_A_NUMBER"],
    ["", 6, "EMPTY"],
    ["0", 6, "ZERO"],
    ["0.00", 6, "ZERO"],
  ] as const)("rejects %s", (input, decimals, code) => {
    try {
      parseAmount(input, decimals);
      throw new Error("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(AmountError);
      expect((e as AmountError).code).toBe(code);
    }
  });

  it("sums equal ETH as bigint", () => {
    const each = parseAmount("0.5", 18);
    expect(sumAmounts(Array.from({ length: 10 }, () => each))).toBe(parseAmount("5", 18));
  });

  it("sums custom ETH as bigint", () => {
    expect(
      sumAmounts([parseAmount("0.1", 18), parseAmount("0.25", 18), parseAmount("1.5", 18)]),
    ).toBe(parseAmount("1.85", 18));
  });
});
