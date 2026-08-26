"use client";

import { useBatch } from "@/context/BatchContext";
import { isAnvilEnabled } from "@/lib/chains";
import type { AssetId } from "@/types/tentacle";

const OPTIONS: { id: AssetId; label: string }[] = [
  { id: "ETH", label: "ETH" },
  { id: "USDC", label: "USDC" },
  { id: "USDCE", label: "USDC.e" },
];

export function AssetSelector() {
  const { asset, setAsset } = useBatch();
  const options = isAnvilEnabled()
    ? [
        { id: "ETH" as const, label: "ETH" },
        { id: "USDC" as const, label: "USDC (mock)" },
      ]
    : OPTIONS;
  return (
    <fieldset>
      <legend className="mb-2 text-xs uppercase tracking-wider text-ink-muted">Asset</legend>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setAsset(opt.id)}
            aria-pressed={asset === opt.id}
            className={`min-h-11 flex-1 rounded-lg border px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-accent ${
              asset === opt.id
                ? "border-ink-accent bg-ink-accent/10 text-ink-text"
                : "border-ink-border bg-ink-raised text-ink-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
