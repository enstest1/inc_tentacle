"use client";

import { useBatch } from "@/context/BatchContext";
import { RecipientRowView } from "./RecipientRow";

export function RecipientList() {
  const { rows, addRow, applyPaste } = useBatch();
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-wider text-ink-muted">Recipients</h2>
        <span className="text-xs text-ink-muted">{rows.length}</span>
      </div>
      <ul className="space-y-2">
        {rows.map((row, i) => (
          <RecipientRowView key={row.id} index={i} row={row} />
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addRow}
          className="min-h-11 rounded-lg border border-ink-border px-4 text-sm text-ink-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-accent"
        >
          + Add recipient
        </button>
        <label className="min-h-11 cursor-pointer rounded-lg border border-ink-border px-4 text-sm leading-[44px] text-ink-text">
          Paste list
          <textarea
            className="sr-only"
            aria-label="Paste recipient list"
            onChange={(e) => {
              if (e.target.value.trim()) applyPaste(e.target.value);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </section>
  );
}
