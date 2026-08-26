import { parseUnits, formatUnits } from "viem";

export type AmountErrorCode =
  | "EMPTY"
  | "LOCALE_COMMA"
  | "THOUSANDS_SEPARATOR"
  | "NOT_A_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "ZERO"
  | "NEGATIVE"
  | "SCIENTIFIC";

export class AmountError extends Error {
  constructor(
    readonly code: AmountErrorCode,
    readonly detail?: string,
  ) {
    super(code);
    this.name = "AmountError";
  }
}

// Deliberately strict: digits, optional single dot, digits. Nothing else.
const STRICT_DECIMAL = /^\d+(\.\d+)?$/;

/**
 * Parses a user-entered amount string into a bigint in the token's base units.
 * NEVER use parseFloat / Number for financial values.
 */
export function parseAmount(raw: string, decimals: number): bigint {
  const s = raw.trim();

  if (s === "") throw new AmountError("EMPTY");
  if (s.startsWith("-")) throw new AmountError("NEGATIVE");
  if (/[eE]/.test(s)) throw new AmountError("SCIENTIFIC");

  // Locale handling: many users type "0,5". Reject explicitly with dedicated
  // copy rather than a generic "invalid amount".
  if (s.includes(",")) {
    const looksLikeThousands = /^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s);
    throw new AmountError(looksLikeThousands ? "THOUSANDS_SEPARATOR" : "LOCALE_COMMA");
  }

  if (!STRICT_DECIMAL.test(s)) throw new AmountError("NOT_A_NUMBER");

  const frac = s.includes(".") ? s.split(".")[1] : "";
  if (frac.length > decimals) {
    throw new AmountError("TOO_MANY_DECIMALS", `max ${decimals} decimal places`);
  }

  const value = parseUnits(s, decimals);
  if (value === 0n) throw new AmountError("ZERO");
  return value;
}

export function sumAmounts(values: readonly bigint[]): bigint {
  return values.reduce((acc, v) => acc + v, 0n);
}

export function formatAmount(value: bigint, decimals: number): string {
  return formatUnits(value, decimals);
}

/** Human-facing copy for amount parser failures. */
export function amountErrorMessage(err: AmountError): string {
  switch (err.code) {
    case "EMPTY":
      return "Enter an amount.";
    case "LOCALE_COMMA":
      return 'Use a dot for decimals (for example 0.5), not a comma.';
    case "THOUSANDS_SEPARATOR":
      return "Do not use thousands separators. Enter 1000 not 1,000.";
    case "NOT_A_NUMBER":
      return "Enter a number with an optional decimal point, and a leading zero for fractions.";
    case "TOO_MANY_DECIMALS":
      return err.detail ?? "Too many decimal places.";
    case "ZERO":
      return "Amount must be greater than zero.";
    case "NEGATIVE":
      return "Negative amounts are not allowed.";
    case "SCIENTIFIC":
      return "Scientific notation is not allowed.";
  }
}
