"use client";

import { useBatch } from "@/context/BatchContext";
import { assetSymbol } from "@/types/tentacle";
import { amountErrorMessage, AmountError, parseAmount } from "@/lib/amounts";

export function EqualPaymentForm() {
  const { mode, equalAmountRaw, setEqualAmountRaw, asset, decimals } = useBatch();
  if (mode !== "equal") return null;

  let hint = "";
  try {
    parseAmount(equalAmountRaw, decimals);
  } catch (e) {
    if (e instanceof AmountError) hint = amountErrorMessage(e);
  }

  return (
    <label className="block">
      <span className="mb-2 block text-xs amount-label">Amount each</span>
      <div className="flex min-h-11 items-center rounded-lg border border-ink-border bg-ink-raised px-3">
        <input
          value={equalAmountRaw}
          onChange={(e) => setEqualAmountRaw(e.target.value)}
          inputMode="decimal"
          aria-label={`Amount each in ${assetSymbol(asset)}`}
          className="amount-display w-full bg-transparent text-lg text-ink-text outline-none"
        />
        <span className="ml-2 text-sm text-ink-muted">{assetSymbol(asset)}</span>
      </div>
      {hint ? <p className="mt-1 text-xs text-ink-danger">{hint}</p> : null}
    </label>
  );
}
