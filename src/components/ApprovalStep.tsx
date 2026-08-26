"use client";

import type { ApprovalPlan } from "@/hooks/useAllowance";
import { useBatch } from "@/context/BatchContext";
import { formatAmount } from "@/lib/amounts";
import { assetSymbol } from "@/types/tentacle";

export function ApprovalStep({ plan }: { plan: ApprovalPlan }) {
  const { asset, decimals, tentacle, token } = useBatch();
  if (asset === "ETH") return null;

  if (plan.kind === "none") {
    return (
      <p className="mt-4 text-sm text-ink-muted">
        Existing Tentacle allowance: {formatAmount(plan.current, decimals)} {assetSymbol(asset)}. This
        batch needs no new approval.
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-ink-border p-3 text-sm text-ink-text">
      <p>Step 1 of 2 — Approve {formatAmount(plan.target, decimals)} {assetSymbol(asset)}</p>
      <p className="mt-1 text-xs text-ink-muted">
        Approval is for exactly the batch total, never unlimited. Tentacle can only pull from the
        wallet that signs.
      </p>
      <RevokeHint tentacle={tentacle} token={token} />
    </div>
  );
}

function RevokeHint({
  tentacle,
  token,
}: {
  tentacle: `0x${string}` | undefined;
  token: `0x${string}`;
}) {
  const { allowance, address, walletChainId } = useBatch();
  // Revoke is approve(tentacle, 0). Exposed as copy; execution uses the same wallet flow.
  if (allowance === 0n || !tentacle || !address) return null;
  return (
    <p className="mt-2 text-xs text-ink-muted">
      Chain {walletChainId} token {token}. To revoke later, approve Tentacle for 0.
    </p>
  );
}
