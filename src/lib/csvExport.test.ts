import { describe, expect, it } from "vitest";
import { sanitizeCsvCell, toCsv } from "./csvExport";

describe("sanitizeCsvCell", () => {
  it.each(["=1+1", "+123", "-123", "@cmd", "\tformula", "\rformula"])(
    "neutralises %j",
    (value) => {
      expect(sanitizeCsvCell(value).startsWith("\"'")).toBe(true);
    },
  );

  it("escapes quotes", () => {
    expect(sanitizeCsvCell('say "hi"')).toBe('"say ""hi"""');
  });
});

describe("toCsv", () => {
  it("joins with CRLF", () => {
    expect(toCsv([["a"], ["b"]])).toBe('"a"\r\n"b"');
  });
});
