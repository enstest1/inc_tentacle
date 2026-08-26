import { describe, expect, it } from "vitest";
import { tentacleAbi } from "./contracts";
import { mapNamedError, isDefaultFriendlyError, toFriendlyError } from "./errors";

describe("error mapping", () => {
  const errors = tentacleAbi.filter((x) => x.type === "error");

  it("maps every ABI error to a non-default message", () => {
    expect(errors.length).toBeGreaterThan(0);
    for (const err of errors) {
      const mapped = mapNamedError(err.name, [0n, 1n, "0x1111111111111111111111111111111111111111"], {
        addresses: [],
      });
      expect(mapped, err.name).toBeDefined();
      expect(isDefaultFriendlyError(mapped!)).toBe(false);
    }
  });

  it("falls back for unknown errors", () => {
    const r = toFriendlyError(new Error("nope"), { addresses: [] });
    expect(isDefaultFriendlyError(r)).toBe(true);
  });
});
