import { describe, expect, it } from "vitest";
import {
  parseAddress,
  classifyCode,
  findLookalikePairs,
} from "./addresses";

describe("parseAddress", () => {
  const valid = "0x1111111111111111111111111111111111111111";

  it("accepts a checksummed address", () => {
    const r = parseAddress(valid);
    expect(r.ok).toBe(true);
  });

  it("strips whitespace and zero-width characters", () => {
    const r = parseAddress(` \u200B${valid}\uFEFF `);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.address.toLowerCase()).toBe(valid.toLowerCase());
  });

  it("rejects empty", () => {
    expect(parseAddress("").ok).toBe(false);
  });

  it("rejects ENS-looking input", () => {
    const r = parseAddress("alice.eth");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("ENS_UNSUPPORTED");
  });

  it("rejects zero address", () => {
    const r = parseAddress("0x0000000000000000000000000000000000000000");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("ZERO_ADDRESS");
  });

  it("rejects invalid", () => {
    const r = parseAddress("not-an-address");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("INVALID");
  });
});

describe("classifyCode", () => {
  it("empty is EOA", () => {
    expect(classifyCode("0x")).toBe("EOA");
    expect(classifyCode(undefined)).toBe("EOA");
  });

  it("7702 designator is Delegated EOA", () => {
    const dest = "0x1111111111111111111111111111111111111111".slice(2);
    const code = `0xef0100${dest}` as `0x${string}`;
    expect(code.length).toBe(48);
    expect(classifyCode(code)).toBe("DELEGATED_EOA");
  });

  it("other code is CONTRACT", () => {
    expect(classifyCode("0x60806040")).toBe("CONTRACT");
  });
});

describe("findLookalikePairs", () => {
  it("flags prefix+suffix collisions", () => {
    const a = "0x1234560000000000000000000000000000654321" as `0x${string}`;
    const b = "0x123456ffffffffffffffffffffffffffffff654321" as `0x${string}`;
    const pairs = findLookalikePairs([a, b], 6);
    expect(pairs).toEqual([[0, 1]]);
  });

  it("does not flag identical addresses as lookalikes", () => {
    const a = "0x1111111111111111111111111111111111111111" as `0x${string}`;
    expect(findLookalikePairs([a, a])).toEqual([]);
  });
});
