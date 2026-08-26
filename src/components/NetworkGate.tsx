"use client";

import type { ReactNode } from "react";
import { useBatch } from "@/context/BatchContext";
import { isAnvilEnabled } from "@/lib/chains";

/**
 * Network gating must not prepare a transaction on the wrong chain.
 * The recipient form stays usable so CSV/paste work before connect.
 */
export function NetworkGate({ children }: { children: ReactNode }) {
  const { isConnected, chainOk, switchToInk, walletChainId } = useBatch();

  return (
    <>
      {!isConnected ? (
        <div className="rounded-xl border border-ink-border bg-ink-raised p-4 text-sm text-ink-muted">
          Connect an injected wallet (MetaMask, Kraken Wallet, or Rainbow) to send. You can still
          prepare recipients first.
          {isAnvilEnabled() ? (
            <p className="mt-2">Or use Connect test ETH for a local Anvil batch (fake ETH only).</p>
          ) : null}
        </div>
      ) : null}
      {isConnected && !chainOk ? (
        <div className="rounded-xl border border-ink-warning/40 bg-ink-raised p-4">
          <p className="text-sm text-ink-text">
            Connected to chain {walletChainId}. Tentacle only sends on Ink
            {isAnvilEnabled() ? " (or local Anvil in this build)" : ""}.
          </p>
          <button
            type="button"
            onClick={() => switchToInk()}
            className="mt-4 min-h-11 w-full rounded-lg bg-ink-accent px-4 text-sm font-medium text-ink-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-accent"
          >
            {isAnvilEnabled() ? "Switch to Anvil" : "Switch to Ink"}
          </button>
        </div>
      ) : null}
      {children}
    </>
  );
}
