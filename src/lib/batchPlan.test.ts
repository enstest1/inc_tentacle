import { describe, expect, it } from "vitest";
import { planBatches } from "./batchPlan";

const addr = (n: number) =>
  (`0x${n.toString(16).padStart(40, "0")}`) as `0x${string}`;

describe("planBatches", () => {
  it("200 → 4 batches of 50", () => {
    const recipients = Array.from({ length: 200 }, (_, i) => addr(i + 1));
    const amounts = recipients.map(() => 1n);
    const batches = planBatches(recipients, amounts, 50);
    expect(batches).toHaveLength(4);
    expect(batches.every((b) => b.recipients.length === 50)).toBe(true);
    expect(batches.reduce((s, b) => s + b.total, 0n)).toBe(200n);
  });

  it("50 → 1 batch", () => {
    const recipients = Array.from({ length: 50 }, (_, i) => addr(i + 1));
    expect(planBatches(recipients, recipients.map(() => 1n), 50)).toHaveLength(1);
  });

  it("51 → 2 batches", () => {
    const recipients = Array.from({ length: 51 }, (_, i) => addr(i + 1));
    const batches = planBatches(recipients, recipients.map(() => 2n), 50);
    expect(batches).toHaveLength(2);
    expect(batches[0]?.recipients).toHaveLength(50);
    expect(batches[1]?.recipients).toHaveLength(1);
    expect(batches[0]?.total).toBe(100n);
    expect(batches[1]?.total).toBe(2n);
  });
});
