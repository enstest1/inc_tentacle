"use client";

import { useBatch } from "@/context/BatchContext";
import { formatAmount } from "@/lib/amounts";
import { truncateAddress } from "@/lib/addresses";
import { assetSymbol } from "@/types/tentacle";
import { ApprovalStep } from "./ApprovalStep";

export function ReviewPanel() {
  const {
    reviewOpen,
    setReviewOpen,
    asset,
    mode,
    equalAmountRaw,
    validPairs,
    totalAsset,
    decimals,
    cost,
    address,
    tentacle,
    walletChainId,
    confirmed,
    setConfirmed,
    showFullAddresses,
    setShowFullAddresses,
    blocked,
    kinds,
    execute,
    nativePerRecipient,
    approvalPlan,
    batchPlan,
    simulation,
  } = useBatch();

  if (!reviewOpen) return null;

  const simReady = simulation.status === "passed";

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 p-4 md:items-center">
      <div
        role="dialog"
        aria-labelledby="review-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-ink-border bg-ink-surface p-6"
      >
        <h2 id="review-title" className="text-lg font-medium text-ink-text">
          Review batch
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Network" value={`Ink (${walletChainId})`} />
          <Row label="Asset" value={assetSymbol(asset)} />
          <Row label="Recipients" value={String(validPairs.recipients.length)} />
          {mode === "equal" ? (
            <Row label="Amount each" value={`${equalAmountRaw} ${assetSymbol(asset)}`} />
          ) : null}
          <Row
            label="Total distributed"
            value={`${formatAmount(totalAsset, decimals)} ${assetSymbol(asset)}`}
          />
          <Row label="Tentacle fee" value={`0 ${assetSymbol(asset)}`} />
          {cost ? (
            <Row
              label="Est. network cost"
              value={`${formatAmount(cost.totalFee, 18)} ETH (execution ${formatAmount(cost.l2Fee, 18)} + L1 data ${formatAmount(cost.l1Fee, 18)})`}
            />
          ) : null}
          {nativePerRecipient > 0n ? (
            <Row label="ETH gas top-up each" value={`${formatAmount(nativePerRecipient, 18)} ETH`} />
          ) : null}
          <Row label="Wallet" value={address ? truncateAddress(address) : "—"} />
          <Row
            label="Tentacle"
            value={tentacle ? `${truncateAddress(tentacle)} (matches expected deployment)` : "—"}
          />
        </dl>

        <div className="mt-4 flex gap-3 text-xs">
          <button
            type="button"
            className="text-ink-accent underline"
            onClick={() => setShowFullAddresses((v) => !v)}
          >
            {showFullAddresses ? "Hide full addresses" : "Show all full addresses"}
          </button>
        </div>

        <ol className="mt-4 space-y-2 text-sm">
          {validPairs.recipients.map((r, i) => (
            <li key={`${r}-${i}`} className="flex justify-between gap-2 font-mono text-xs">
              <span>
                {i + 1} {showFullAddresses ? r : truncateAddress(r)}
              </span>
              <span>
                {formatAmount(validPairs.amounts[i] ?? 0n, decimals)} {assetSymbol(asset)}{" "}
                <span className="text-ink-muted">{kinds[i] ?? ""}</span>
              </span>
            </li>
          ))}
        </ol>

        {batchPlan.length > 1 ? (
          <p className="mt-4 text-sm text-ink-warning" role="alert">
            ⚠ {batchPlan.length} separate transactions. Each is atomic alone; they are not atomic
            together.
          </p>
        ) : null}

        <ApprovalStep plan={approvalPlan} />

        <label className="mt-6 flex min-h-11 items-start gap-3 text-sm text-ink-text">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 h-4 w-4 accent-ink-accent"
          />
          I reviewed the recipient addresses and amounts.
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setReviewOpen(false)}
            className="min-h-11 flex-1 rounded-lg border border-ink-border text-sm text-ink-muted"
          >
            Back
          </button>
          <button
            type="button"
            disabled={blocked || !confirmed || !simReady}
            onClick={() => void execute()}
            className="min-h-11 flex-1 rounded-lg bg-ink-accent text-sm font-medium text-ink-bg disabled:opacity-40"
          >
            Confirm & send
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right text-ink-text">{value}</dd>
    </div>
  );
}
