"use client";

import { useBatch } from "@/context/BatchContext";
import { receiptToCsv, receiptToJson } from "@/lib/receipt";
import { txUrl } from "@/lib/chains";
import { truncateAddress } from "@/lib/addresses";

export function Receipt() {
  const { txState, receipts, reset, showFullAddresses, setShowFullAddresses } = useBatch();
  if (txState !== "SUCCESS" || receipts.length === 0) return null;
  const primary = receipts[0];

  function download(name: string, body: string, type: string) {
    const blob = new Blob([body], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-xl border border-ink-border bg-ink-raised p-6">
      <p className="text-ink-success">✓ SENT</p>
      <h2 className="mt-2 text-lg text-ink-text">Tentacle receipt</h2>
      <dl className="mt-4 space-y-1 text-sm text-ink-muted">
        <p>Status CONFIRMED (2 confirmations)</p>
        <p>
          Network {primary.network} ({primary.chainId})
        </p>
        <p>Asset {primary.asset}</p>
        <p>Sender {truncateAddress(primary.sender)}</p>
        <p>Recipients {primary.recipients.length}</p>
        <p>Total {primary.total} {primary.asset}</p>
        <p>Block {primary.blockNumber}</p>
        <p className="break-all font-mono text-xs tx-hash">Transaction {primary.transactionHash}</p>
        <p>Confirmed {new Date(primary.confirmedAt).toLocaleString()}</p>
      </dl>
      <p className="mt-4 text-xs text-ink-muted">
        Confirmed on Ink at block {primary.blockNumber}. Ink is an L2 — final settlement follows
        Ethereum L1.
      </p>
      <button
        type="button"
        className="mt-3 text-xs text-ink-accent underline"
        onClick={() => setShowFullAddresses((v) => !v)}
      >
        {showFullAddresses ? "Hide full addresses" : "Show full addresses"}
      </button>
      <ol className="mt-3 space-y-1 font-mono text-xs text-ink-text">
        {receipts.flatMap((rec) =>
          rec.recipients.map((r, i) => (
            <li key={`${rec.transactionHash}-${r.address}-${i}`}>
              {showFullAddresses ? r.address : truncateAddress(r.address)} · {r.amount} {rec.asset}
            </li>
          )),
        )}
      </ol>
      {receipts.length > 1
        ? receipts.map((r, i) => (
            <p key={r.transactionHash} className="mt-2 font-mono text-xs">
              Batch {i + 1} {r.transactionHash} CONFIRMED
            </p>
          ))
        : null}
      <div className="mt-6 flex flex-wrap gap-2">
        {txUrl(primary.chainId, primary.transactionHash) ? (
          <a
            className="min-h-11 rounded-lg border border-ink-border px-4 leading-[44px] text-sm"
            href={txUrl(primary.chainId, primary.transactionHash)}
            target="_blank"
            rel="noreferrer"
          >
            View on explorer
          </a>
        ) : (
          <span className="min-h-11 rounded-lg border border-ink-border px-4 leading-[44px] text-sm text-ink-muted">
            Local Anvil — no explorer
          </span>
        )}
        <button
          type="button"
          className="min-h-11 rounded-lg border border-ink-border px-4 text-sm"
          onClick={() => download("tentacle-receipt.json", receiptToJson(primary), "application/json")}
        >
          Download JSON
        </button>
        <button
          type="button"
          className="min-h-11 rounded-lg border border-ink-border px-4 text-sm"
          onClick={() => download("tentacle-receipt.csv", receiptToCsv(primary), "text/csv")}
        >
          Download CSV
        </button>
        <button
          type="button"
          className="min-h-11 rounded-lg bg-ink-accent px-4 text-sm text-ink-bg"
          onClick={reset}
        >
          New batch
        </button>
      </div>
      <p className="mt-4 text-xs text-ink-muted">Saved on this device.</p>
    </section>
  );
}
