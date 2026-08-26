"use client";

import { useBatch } from "@/context/BatchContext";
import { AmountError, amountErrorMessage, parseAmount } from "@/lib/amounts";

export function GasTopUpControl() {
  const { asset, gasTopUpEnabled, setGasTopUpEnabled, gasTopUpRaw, setGasTopUpRaw } = useBatch();
  if (asset === "ETH") return null;

  let hint = "";
  if (gasTopUpEnabled) {
    try {
      parseAmount(gasTopUpRaw, 18);
    } catch (e) {
      if (e instanceof AmountError) hint = amountErrorMessage(e);
    }
  }

  return (
    <div className="rounded-lg border border-ink-border bg-ink-raised p-4">
      <label className="flex min-h-11 items-center gap-3 text-sm text-ink-text">
        <input
          type="checkbox"
          checked={gasTopUpEnabled}
          onChange={(e) => setGasTopUpEnabled(e.target.checked)}
          className="h-4 w-4 accent-ink-accent"
        />
        Also send ETH gas top-up to each recipient
      </label>
      {gasTopUpEnabled ? (
        <label className="mt-3 block">
          <span className="mb-1 block text-xs text-ink-muted">ETH each</span>
          <input
            value={gasTopUpRaw}
            onChange={(e) => setGasTopUpRaw(e.target.value)}
            aria-label="ETH gas top-up per recipient"
            className="min-h-11 w-full rounded-md border border-ink-border bg-ink-bg px-3 text-sm text-ink-text outline-none focus-visible:ring-2 focus-visible:ring-ink-accent"
          />
          {hint ? <p className="mt-1 text-xs text-ink-danger">{hint}</p> : null}
        </label>
      ) : null}
    </div>
  );
}
