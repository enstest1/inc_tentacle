"use client";

import { useBatch } from "@/context/BatchContext";

const ETH_STEPS = [
  "Preparing batch",
  "Simulation",
  "Wallet signature",
  "Submitted",
  "Confirming on Ink",
  "Complete",
];

export function TransactionProgress() {
  const { txState, txHash, asset, errorTitle, errorBody, reset } = useBatch();
  if (txState === "EDITING" || txState === "READY" || txState === "VALIDATING") return null;
  if (txState === "SUCCESS") return null;

  const tokenExtra = asset !== "ETH";
  const steps = tokenExtra ? ["Approve", "Approval confirmed", ...ETH_STEPS] : ETH_STEPS;

  return (
    <section aria-live="polite" className="rounded-xl border border-ink-border bg-ink-raised p-4">
      <h2 className="text-sm font-medium text-ink-text">Progress</h2>
      <ol className="mt-3 space-y-1 text-sm text-ink-muted">
        {steps.map((s) => (
          <li key={s}>• {s}</li>
        ))}
      </ol>
      <p className="mt-3 font-mono text-xs text-ink-text">Status: {txState}</p>
      {txHash ? <p className="mt-1 break-all font-mono text-xs text-ink-muted">{txHash}</p> : null}
      {txState === "FAILED" || txState === "CANCELLED" ? (
        <div className="mt-4">
          <p className="text-sm text-ink-text">{errorTitle}</p>
          <p className="mt-1 text-sm text-ink-muted">{errorBody}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 min-h-11 rounded-lg border border-ink-border px-4 text-sm"
          >
            Review batch
          </button>
        </div>
      ) : null}
    </section>
  );
}
