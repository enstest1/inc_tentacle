"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { truncateAddress } from "@/lib/addresses";
import { isAnvilEnabled } from "@/lib/chains";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const injected = connectors.find((c) => c.id === "injected") ?? connectors[0];
  const anvil = connectors.find((c) => c.id === "mock");

  if (isConnected && address) {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        className="min-h-11 rounded-full border border-ink-border bg-ink-raised px-4 font-mono text-xs text-ink-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-accent"
      >
        {truncateAddress(address)}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {isAnvilEnabled() && anvil ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => connect({ connector: anvil })}
          className="min-h-11 rounded-full bg-ink-accent px-4 text-sm font-medium text-ink-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-accent"
        >
          {isPending ? "Connecting…" : "Connect test ETH"}
        </button>
      ) : null}
      <button
        type="button"
        disabled={!injected || isPending}
        onClick={() => injected && connect({ connector: injected })}
        className="min-h-11 rounded-full border border-ink-border bg-ink-raised px-4 text-sm font-medium text-ink-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-accent"
      >
        {isPending ? "Connecting…" : "Connect wallet"}
      </button>
    </div>
  );
}
