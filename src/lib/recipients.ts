import { getAddress, type Address } from "viem";
import { parseAddress } from "./addresses";

export type ParsedRecipient = {
  raw: string;
  address?: Address;
  error?: string;
};

/**
 * Splits a paste blob on newlines, commas, or semicolons and normalises each line.
 * Over-limit lists are allowed through so the batch-splitting flow can take over.
 */
export function parsePaste(text: string): ParsedRecipient[] {
  const parts = text
    .split(/[\n,;]+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return parts.map((raw) => {
    const result = parseAddress(raw);
    if (!result.ok) {
      return { raw, error: result.reason };
    }
    return { raw, address: result.address };
  });
}

/** Checksum-normalise a unique list; mixed-case duplicates collapse. */
export function uniqueChecksummed(addresses: readonly Address[]): Address[] {
  const seen = new Set<string>();
  const out: Address[] = [];
  for (const a of addresses) {
    const c = getAddress(a);
    const k = c.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out;
}

export function findDuplicateIndexes(addresses: readonly Address[]): Map<string, number[]> {
  const map = new Map<string, number[]>();
  addresses.forEach((a, i) => {
    const k = a.toLowerCase();
    const list = map.get(k) ?? [];
    list.push(i);
    map.set(k, list);
  });
  for (const [k, list] of map) {
    if (list.length < 2) map.delete(k);
  }
  return map;
}
