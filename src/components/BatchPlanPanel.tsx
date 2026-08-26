"use client";

import { useBatch } from "@/context/BatchContext";
import { formatAmount } from "@/lib/amounts";
import { assetSymbol } from "@/types/tentacle";

export function BatchPlanPanel() {
  const { needsSplit, batchPlan, validPairs, maxRecipients, decimals, asset } = useBatch();
  if (!needsSplit) return null;
  return (
    <section className="rounded-xl border border-ink-warning/50 bg-ink-raised p-4">
      <h2 className="text-sm font-medium text-ink-text">Batch plan</h2>
      <p className="mt-2 text-sm text-ink-muted">
        {validPairs.recipients.length} recipients exceed the {maxRecipients}-recipient limit of a
        single batch. Tentacle will create {batchPlan.length} separate transactions.
      </p>
      <ul className="mt-3 space-y-1 font-mono text-xs text-ink-text">
        {batchPlan.map((b) => (
          <li key={b.index}>
            Batch {b.index + 1} · {b.recipients.length} recipients · {formatAmount(b.total, decimals)}{" "}
            {assetSymbol(asset)}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-ink-warning" role="alert">
        ⚠ Each batch is atomic alone. The {batchPlan.length} batches are not atomic together.
      </p>
    </section>
  );
}
