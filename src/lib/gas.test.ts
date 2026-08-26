import { describe, expect, it } from "vitest";
import { applyBuffer, BUFFER_BPS } from "./gas";

describe("gas buffer", () => {
  it("includes a 20% buffer in totalFee", () => {
    const l2Fee = 100n;
    const l1Fee = 50n;
    const raw = l2Fee + l1Fee;
    const total = applyBuffer(raw);
    expect(BUFFER_BPS).toBe(2000n);
    expect(total).toBe(raw + (raw * 2000n) / 10_000n);
    expect(total).toBeGreaterThan(l2Fee);
    expect(total - raw).toBe((l2Fee + l1Fee) / 5n);
  });
});
