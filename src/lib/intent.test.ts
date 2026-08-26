import { describe, expect, it } from "vitest";
import { fingerprint, isSimulationValid, type BatchIntent } from "./intent";

const OTHER = "0x2222222222222222222222222222222222222222" as `0x${string}`;
const USDCE = "0xF1815bd50389c46847f0Bda824eC8da914045D14" as `0x${string}`;

const base: BatchIntent = {
  chainId: 57073,
  sender: "0x1111111111111111111111111111111111111111",
  tentacle: "0x3333333333333333333333333333333333333333",
  functionName: "batchNative",
  asset: "0x0000000000000000000000000000000000000000",
  tokenDecimals: 18,
  recipients: [
    "0x4444444444444444444444444444444444444444",
    "0x5555555555555555555555555555555555555555",
  ],
  amounts: [1n, 2n],
  value: 3n,
  nativePerRecipient: 0n,
};

const state = {
  status: "passed" as const,
  forIntent: fingerprint(base),
  request: {},
  at: Date.now(),
};

describe("intent fingerprint", () => {
  it.each([
    ["amount changed", { ...base, amounts: [base.amounts[0]! + 1n, ...base.amounts.slice(1)] }],
    ["recipient added", { ...base, recipients: [...base.recipients, OTHER] }],
    ["recipient removed", { ...base, recipients: base.recipients.slice(1) }],
    ["recipient edited", { ...base, recipients: [OTHER, ...base.recipients.slice(1)] }],
    ["recipient reordered", { ...base, recipients: [...base.recipients].reverse() }],
    ["asset changed", { ...base, asset: USDCE, functionName: "batchToken" as const }],
    ["wallet changed", { ...base, sender: OTHER }],
    ["network changed", { ...base, chainId: 763373 }],
    ["value changed", { ...base, value: base.value + 1n }],
    ["gas top-up changed", { ...base, nativePerRecipient: 1n }],
    ["decimals changed", { ...base, tokenDecimals: 6 }],
  ] as Array<[string, BatchIntent]>)("invalidates when %s", (_label, mutated) => {
    expect(isSimulationValid(state, mutated)).toBe(false);
  });

  it("stays valid when nothing changes", () => {
    expect(isSimulationValid(state, { ...base })).toBe(true);
  });
});
