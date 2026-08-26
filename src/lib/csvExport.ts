const DANGEROUS = /^[=+\-@\t\r]/;

/**
 * Neutralises spreadsheet formula injection. Applied to every exported cell.
 */
export function sanitizeCsvCell(value: string): string {
  const escaped = value.replace(/"/g, '""');
  const guarded = DANGEROUS.test(escaped) ? `'${escaped}` : escaped;
  return `"${guarded}"`;
}

export function toCsv(rows: string[][]): string {
  return rows.map((r) => r.map(sanitizeCsvCell).join(",")).join("\r\n");
}
