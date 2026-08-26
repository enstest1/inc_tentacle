import { describe, expect, it } from "vitest";
import { parsePaste, findDuplicateIndexes } from "./recipients";

describe("parsePaste", () => {
  it("splits on newlines and commas", () => {
    const text = `0x1111111111111111111111111111111111111111
0x2222222222222222222222222222222222222222,0x3333333333333333333333333333333333333333`;
    expect(parsePaste(text)).toHaveLength(3);
  });

  it("reports invalid lines", () => {
    const r = parsePaste("not-an-address");
    expect(r[0]?.error).toBe("INVALID");
  });
});

describe("findDuplicateIndexes", () => {
  it("collapses mixed-case duplicates", () => {
    const a = "0x1111111111111111111111111111111111111111" as `0x${string}`;
    const map = findDuplicateIndexes([a, a]);
    expect(map.size).toBe(1);
  });
});
