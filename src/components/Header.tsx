"use client";

import { WalletButton } from "./WalletButton";
import { useBatch } from "@/context/BatchContext";
import { anvil, ink, inkSepolia } from "@/lib/chains";

export function Header() {
  const { isConnected, walletChainId } = useBatch();
  const network = !isConnected
    ? "Ink"
    : walletChainId === ink.id
      ? "Ink"
      : walletChainId === inkSepolia.id
        ? "Ink Sepolia"
        : walletChainId === anvil.id
          ? "Anvil"
          : "Wrong network";
  return (
    <header className="flex items-center justify-between bg-gradient-to-b from-ink-bg/80 to-transparent px-4 py-4 md:px-8">
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-semibold tracking-[0.2em] text-ink-text">TENTACLE</span>
        <span className="hidden text-xs text-ink-muted sm:inline">Non-custodial batch payments</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-ink-border px-3 py-1 text-xs text-ink-muted">
          {network}
        </span>
        <WalletButton />
      </div>
      <span className="sr-only">Tentacle</span>
    </header>
  );
}
