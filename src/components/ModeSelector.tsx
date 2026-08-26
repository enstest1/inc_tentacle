"use client";

import { useBatch } from "@/context/BatchContext";

export function ModeSelector() {
  const { mode, setMode } = useBatch();
  return (
    <fieldset>
      <legend className="mb-2 text-xs uppercase tracking-wider text-ink-muted">Distribution</legend>
      <div className="flex gap-2">
        {(["equal", "custom"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            data-testid={`mode-${m}`}
            className={`min-h-11 flex-1 rounded-lg border px-3 text-sm capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-accent ${
              mode === m
                ? "border-ink-accent bg-ink-accent/10 text-ink-text"
                : "border-ink-border bg-ink-raised text-ink-muted"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
