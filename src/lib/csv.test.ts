import { describe, expect, it } from "vitest";
import { parseCsv, CSV_MAX_BYTES } from "./csv";

const A = "0x1111111111111111111111111111111111111111";
const B = "0x2222222222222222222222222222222222222222";

describe("parseCsv", () => {
  it("parses equal mode", () => {
    const r = parseCsv(`address\n${A}\n${B}`, { mode: "equal", decimals: 18, maxRecipients: 50 });
    expect(r.rows).toHaveLength(2);
    expect(r.issues).toHaveLength(0);
  });

  it("parses custom mode", () => {
    const r = parseCsv(`address,amount\n${A},0.5\n${B},0.25`, {
      mode: "custom",
      decimals: 18,
      maxRecipients: 50,
    });
    expect(r.rows).toHaveLength(2);
    expect(r.rows[0]?.amount).toBe(500000000000000000n);
  });

  it("strips BOM and CRLF and trailing blank", () => {
    const r = parseCsv(`\uFEFFaddress\r\n${A}\r\n`, {
      mode: "equal",
      decimals: 18,
      maxRecipients: 50,
    });
    expect(r.rows).toHaveLength(1);
  });

  it("requires address header", () => {
    const r = parseCsv("foo\nbar", { mode: "equal", decimals: 18, maxRecipients: 50 });
    expect(r.issues[0]?.message).toMatch(/address/);
  });

  it("ignores extra columns", () => {
    const r = parseCsv(`address,name,employee_id\n${A},Ada,1`, {
      mode: "equal",
      decimals: 18,
      maxRecipients: 50,
    });
    expect(r.ignoredColumns).toEqual(["name", "employee_id"]);
    expect(r.rows).toHaveLength(1);
  });

  it("reports malformed address with line number", () => {
    const r = parseCsv(`address\nBADADDRESS`, { mode: "equal", decimals: 18, maxRecipients: 50 });
    expect(r.issues[0]?.line).toBe(2);
  });

  it("reports malformed amount", () => {
    const r = parseCsv(`address,amount\n${A},abc`, {
      mode: "custom",
      decimals: 18,
      maxRecipients: 50,
    });
    expect(r.issues[0]?.message).toMatch(/NOT_A_NUMBER/);
  });

  it("reports duplicate rows", () => {
    const r = parseCsv(`address\n${A}\n${A}`, { mode: "equal", decimals: 18, maxRecipients: 50 });
    expect(r.issues[0]?.message).toMatch(/Duplicate/);
  });

  it("notes over-limit lists without dropping rows", () => {
    const lines = ["address", ...Array.from({ length: 51 }, (_, i) =>
      `0x${(i + 1).toString(16).padStart(40, "0")}`,
    )];
    const r = parseCsv(lines.join("\n"), { mode: "equal", decimals: 18, maxRecipients: 50 });
    expect(r.rows.length).toBe(51);
    expect(r.issues.some((i) => i.message.includes("split"))).toBe(true);
  });

  it("exposes the 100KB cap constant", () => {
    expect(CSV_MAX_BYTES).toBe(100 * 1024);
  });
});
