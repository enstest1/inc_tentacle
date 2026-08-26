"use client";

import { useBatch } from "@/context/BatchContext";

export function CustomPaymentForm() {
  const { mode } = useBatch();
  if (mode !== "custom") return null;
  return (
    <p className="text-xs text-ink-muted">
      Enter an amount on each recipient row. Totals are summed as integers — never floats.
    </p>
  );
}
