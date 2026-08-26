import { getAddress, isAddress, type Address, type Hex } from "viem";

export type RecipientKind = "EOA" | "DELEGATED_EOA" | "CONTRACT";

export type ParseAddressResult =
  | { ok: true; address: Address }
  | { ok: false; reason: "EMPTY" | "ENS_UNSUPPORTED" | "INVALID" | "ZERO_ADDRESS" };

/**
 * Parses a pasted address. Strips whitespace and zero-width characters that
 * survive copy/paste. ENS names get their own error instead of "invalid".
 */
export function parseAddress(raw: string): ParseAddressResult {
  const s = raw.replace(/[\s\u200B-\u200D\uFEFF]/g, "");
  if (s === "") return { ok: false, reason: "EMPTY" };

  if (/\.(eth|xyz|box|id)$/i.test(s)) return { ok: false, reason: "ENS_UNSUPPORTED" };

  // Never use a regex as the sole validator — viem does checksum validation.
  if (!isAddress(s)) return { ok: false, reason: "INVALID" };

  const address = getAddress(s);
  if (address === "0x0000000000000000000000000000000000000000") {
    return { ok: false, reason: "ZERO_ADDRESS" };
  }
  return { ok: true, address };
}

/**
 * EIP-7702 aware classification.
 * A 7702-delegated EOA carries a 23-byte designator (0xef0100 || 20-byte address).
 */
export function classifyCode(code: Hex | undefined): RecipientKind {
  if (!code || code === "0x") return "EOA";
  const lower = code.toLowerCase();
  if (lower.startsWith("0xef0100") && lower.length === 48) return "DELEGATED_EOA";
  return "CONTRACT";
}

/**
 * Address-poisoning defence: flag pairs in the same batch that share both a
 * prefix and a suffix. That is exactly what a poisoned lookalike looks like.
 */
export function findLookalikePairs(
  addresses: readonly Address[],
  n = 6,
): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  const key = (a: Address) => {
    const h = a.slice(2).toLowerCase();
    return `${h.slice(0, n)}|${h.slice(-n)}`;
  };
  const seen = new Map<string, number>();
  addresses.forEach((addr, i) => {
    const k = key(addr);
    const prev = seen.get(k);
    if (prev !== undefined && addresses[prev] !== addr) pairs.push([prev, i]);
    else if (prev === undefined) seen.set(k, i);
  });
  return pairs;
}

/** Review-screen truncation: 8 hex chars each side, not 4 (spec §19.1). */
export function truncateAddress(address: string): string {
  if (address.length < 18) return address;
  return `${address.slice(0, 10)} … ${address.slice(-8)}`;
}

export function addressErrorMessage(
  reason: "EMPTY" | "ENS_UNSUPPORTED" | "INVALID" | "ZERO_ADDRESS",
): string {
  switch (reason) {
    case "EMPTY":
      return "Enter a recipient address.";
    case "ENS_UNSUPPORTED":
      return "ENS names are not supported. Paste a 0x address.";
    case "ZERO_ADDRESS":
      return "The zero address is not a valid recipient.";
    case "INVALID":
      return "This is not a valid Ethereum address.";
  }
}
