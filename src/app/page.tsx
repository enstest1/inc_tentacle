"use client";

import { Header } from "@/components/Header";
import { Banner } from "@/components/Banner";
import { NetworkGate } from "@/components/NetworkGate";
import { AssetSelector } from "@/components/AssetSelector";
import { ModeSelector } from "@/components/ModeSelector";
import { EqualPaymentForm } from "@/components/EqualPaymentForm";
import { CustomPaymentForm } from "@/components/CustomPaymentForm";
import { RecipientList } from "@/components/RecipientList";
import { CsvImport } from "@/components/CsvImport";
import { GasTopUpControl } from "@/components/GasTopUpControl";
import { SafetyPanel } from "@/components/SafetyPanel";
import { BatchPlanPanel } from "@/components/BatchPlanPanel";
import { ReviewPanel } from "@/components/ReviewPanel";
import { TransactionProgress } from "@/components/TransactionProgress";
import { Receipt } from "@/components/Receipt";
import { useBatch } from "@/context/BatchContext";
import { formatAmount } from "@/lib/amounts";
import { isAnvilEnabled } from "@/lib/chains";
import { assetSymbol } from "@/types/tentacle";

export default function Page() {
  const {
    validPairs,
    totalAsset,
    decimals,
    asset,
    equalAmountRaw,
    mode,
    cost,
    blocked,
    setReviewOpen,
    chainOk,
  } = useBatch();

  return (
    <div className="min-h-screen">
      <div className="relative">
        <Banner />
        <div className="absolute inset-x-0 top-0">
          <Header />
        </div>
        <div className="absolute inset-x-0 bottom-0 px-4 pb-8">
          <p className="mx-auto text-center text-2xl font-medium tracking-tight text-ink-text">
            One send. Every wallet.
          </p>
          <p className="mx-auto mt-2 text-center text-sm text-ink-muted">
            Non-custodial batch payments on Ink.
          </p>
          {isAnvilEnabled() ? (
            <p className="mx-auto mt-3 text-center text-xs text-ink-warning">
              Local Anvil demo — test ETH only. Nothing here is real money.
            </p>
          ) : null}
        </div>
      </div>
      <main className="mx-auto max-w-2xl px-4 pb-10 md:px-0">

        <div className="mt-10 space-y-6 rounded-2xl border border-ink-border bg-ink-surface p-5 md:p-8">
          <NetworkGate>
            <AssetSelector />
            <ModeSelector />
            <EqualPaymentForm />
            <CustomPaymentForm />
            <RecipientList />
            <CsvImport />
            <GasTopUpControl />
            <BatchPlanPanel />

            <dl className="space-y-1 border-t border-ink-border pt-4 text-sm">
              <div className="flex justify-between text-ink-muted">
                <dt className="amount-label">Recipients</dt>
                <dd className="text-ink-text">{validPairs.recipients.length}</dd>
              </div>
              {mode === "equal" ? (
                <div className="flex justify-between text-ink-muted">
                  <dt className="amount-label">Amount each</dt>
                  <dd className="amount-display text-ink-text">
                    {equalAmountRaw} {assetSymbol(asset)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between text-ink-muted">
                <dt className="amount-label">Total</dt>
                <dd className="amount-display text-lg text-ink-text">
                  {formatAmount(totalAsset, decimals)} {assetSymbol(asset)}
                </dd>
              </div>
              <div className="flex justify-between text-ink-muted">
                <dt className="amount-label">Tentacle fee</dt>
                <dd className="text-ink-text">0 {assetSymbol(asset)}</dd>
              </div>
              <div className="flex justify-between text-ink-muted">
                <dt className="amount-label">Est. network cost</dt>
                <dd className="text-ink-text">
                  {cost ? `${formatAmount(cost.totalFee, 18)} ETH` : "—"}
                </dd>
              </div>
            </dl>

            <SafetyPanel />
            <TransactionProgress />
            <Receipt />

            <button
              type="button"
              disabled={blocked || !chainOk}
              onClick={() => setReviewOpen(true)}
              className="min-h-11 w-full rounded-lg bg-ink-accent text-sm font-medium text-ink-bg disabled:opacity-40"
            >
              Review & send
            </button>
          </NetworkGate>
        </div>

        <p className="mx-auto mt-6 text-center text-xs text-ink-muted">
          Never custodial · Simulated before send
        </p>
        <footer className="mt-10 flex justify-center gap-4 text-xs text-ink-muted">
          <a href="/stats" className="underline">
            Stats
          </a>
          <a href="/terms" className="underline">
            Terms
          </a>
          <a
            href="https://github.com/enstest1/inc_tentacle"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Source
          </a>
        </footer>
      </main>
      <ReviewPanel />
    </div>
  );
}
