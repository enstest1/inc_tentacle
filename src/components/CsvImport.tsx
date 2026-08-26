"use client";

import { useRef, useState } from "react";
import { useBatch } from "@/context/BatchContext";
import { parseCsv, assertCsvSize, CSV_MAX_BYTES } from "@/lib/csv";

export function CsvImport() {
  const { mode, decimals, maxRecipients, applyCsv } = useBatch();
  const [issues, setIssues] = useState<string[]>([]);
  const [ignored, setIgnored] = useState<string[]>([]);
  const pasteRef = useRef<HTMLTextAreaElement>(null);

  function ingest(text: string) {
    const result = parseCsv(text, { mode, decimals, maxRecipients });
    setIssues(result.issues.map((i) => (i.line ? `Line ${i.line}: ${i.message}` : i.message)));
    setIgnored(result.ignoredColumns);
    const blocking = result.issues.filter((i) => i.line !== 0);
    if (blocking.length === 0 && result.rows.length > 0) {
      applyCsv(
        result.rows.map((r) => ({
          address: r.address,
          amount: r.amount,
        })),
      );
    }
  }

  async function onFile(file: File) {
    try {
      assertCsvSize(file.size);
    } catch (e) {
      setIssues([e instanceof Error ? e.message : "File too large"]);
      return;
    }
    const text = await file.text();
    if (new TextEncoder().encode(text).length > CSV_MAX_BYTES) {
      setIssues([`CSV is over ${CSV_MAX_BYTES} bytes.`]);
      return;
    }
    ingest(text);
  }

  return (
    <div>
      <label className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-ink-border px-4 text-sm text-ink-text focus-within:ring-2 focus-within:ring-ink-accent">
        Import CSV
        <input
          type="file"
          accept=".csv,text/csv"
          data-testid="csv-input"
          className="sr-only"
          onChange={(e) => {
            const input = e.currentTarget;
            const f = input.files?.[0];
            if (!f) return;
            // Do not clear the input until the File has been read.
            void onFile(f).finally(() => {
              input.value = "";
            });
          }}
        />
      </label>
      <label className="mt-3 block text-xs text-ink-muted">
        Or paste CSV
        <textarea
          ref={pasteRef}
          data-testid="csv-text"
          aria-label="Paste CSV"
          className="mt-1 min-h-20 w-full rounded-md border border-ink-border bg-ink-bg p-2 font-mono text-xs text-ink-text"
        />
      </label>
      <button
        type="button"
        data-testid="csv-parse"
        className="mt-2 min-h-11 rounded-lg border border-ink-border px-4 text-sm text-ink-text"
        onClick={() => ingest(pasteRef.current?.value ?? "")}
      >
        Parse pasted CSV
      </button>
      {ignored.length > 0 ? (
        <p className="mt-2 text-xs text-ink-muted">Ignored columns: {ignored.join(", ")}</p>
      ) : null}
      {issues.length > 0 ? (
        <ul data-testid="csv-issues" className="mt-2 space-y-1 text-xs text-ink-danger">
          {issues.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      ) : (
        <div data-testid="csv-issues" className="sr-only" />
      )}
      <p className="sr-only">
        Equal mode needs an address column. Custom mode needs address and amount. Extra columns are ignored.
      </p>
    </div>
  );
}
