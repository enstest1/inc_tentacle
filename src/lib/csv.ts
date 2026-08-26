import { parseAddress } from "./addresses";
import { parseAmount, AmountError } from "./amounts";
import type { Address } from "viem";

export const CSV_MAX_BYTES = 100 * 1024; // 100 KB

export type CsvRow = { address: Address; amount?: bigint };
export type CsvIssue = { line: number; message: string };

export type CsvResult = {
  rows: CsvRow[];
  issues: CsvIssue[];
  ignoredColumns: string[];
};

/**
 * Restricted CSV parser. Extra columns are ignored (payroll exports carry names).
 * Every bad row is reported with a line number — nothing is silently skipped.
 */
export function parseCsv(
  text: string,
  opts: { mode: "equal" | "custom"; decimals: number; maxRecipients: number },
): CsvResult {
  const issues: CsvIssue[] = [];
  const rows: CsvRow[] = [];

  const clean = text
    .replace(/^\uFEFF/, "") // strip UTF-8 BOM
    .replace(/\r\n?/g, "\n"); // normalise line endings

  const lines = clean.split("\n");
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();

  if (lines.length === 0) {
    return { rows, issues: [{ line: 1, message: "File is empty" }], ignoredColumns: [] };
  }

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const addressIdx = header.indexOf("address");
  const amountIdx = header.indexOf("amount");

  if (addressIdx === -1) {
    return {
      rows,
      issues: [{ line: 1, message: 'Missing required "address" column' }],
      ignoredColumns: [],
    };
  }
  if (opts.mode === "custom" && amountIdx === -1) {
    return {
      rows,
      issues: [{ line: 1, message: 'Custom mode requires an "amount" column' }],
      ignoredColumns: [],
    };
  }

  const ignoredColumns = header.filter((h, i) => i !== addressIdx && i !== amountIdx && h !== "");

  const seen = new Map<string, number>();

  for (let i = 1; i < lines.length; i++) {
    const lineNo = i + 1;
    const raw = lines[i];
    if (raw.trim() === "") {
      issues.push({ line: lineNo, message: "Blank row" });
      continue;
    }

    const cells = raw.split(",");
    const addrResult = parseAddress(cells[addressIdx] ?? "");
    if (!addrResult.ok) {
      issues.push({
        line: lineNo,
        message: csvAddressMessage(addrResult.reason, cells[addressIdx]),
      });
      continue;
    }

    const dupLine = seen.get(addrResult.address.toLowerCase());
    if (dupLine !== undefined) {
      issues.push({
        line: lineNo,
        message: `Duplicate of line ${dupLine}: ${addrResult.address}`,
      });
      continue;
    }
    seen.set(addrResult.address.toLowerCase(), lineNo);

    let amount: bigint | undefined;
    if (opts.mode === "custom") {
      try {
        amount = parseAmount(cells[amountIdx] ?? "", opts.decimals);
      } catch (e) {
        const code = e instanceof AmountError ? e.code : "NOT_A_NUMBER";
        issues.push({
          line: lineNo,
          message: `Invalid amount "${cells[amountIdx] ?? ""}" (${code})`,
        });
        continue;
      }
    }

    rows.push({ address: addrResult.address, amount });
  }

  if (rows.length > opts.maxRecipients) {
    issues.push({
      line: 0,
      message: `${rows.length} valid recipients exceeds the ${opts.maxRecipients} per-batch limit. Tentacle can split this into multiple batches.`,
    });
  }

  return { rows, issues, ignoredColumns };
}

function csvAddressMessage(reason: string, raw?: string): string {
  switch (reason) {
    case "ENS_UNSUPPORTED":
      return `ENS names are not supported: "${raw}"`;
    case "ZERO_ADDRESS":
      return "Zero address is not a valid recipient";
    case "EMPTY":
      return "Missing address";
    default:
      return `Invalid Ethereum address: "${raw}"`;
  }
}

/** Size gate — checked before reading file contents into the parser. */
export function assertCsvSize(bytes: number): void {
  if (bytes > CSV_MAX_BYTES) {
    throw new Error(`CSV is ${bytes} bytes; maximum is ${CSV_MAX_BYTES} bytes.`);
  }
}
