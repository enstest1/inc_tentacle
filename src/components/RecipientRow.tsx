"use client";

import { useBatch } from "@/context/BatchContext";
import { addressErrorMessage, truncateAddress } from "@/lib/addresses";
import { amountErrorMessage, AmountError, parseAmount } from "@/lib/amounts";
import { assetSymbol, type RecipientRow } from "@/types/tentacle";

export function RecipientRowView({ index, row }: { index: number; row: RecipientRow }) {
  const { updateRow, removeRow, mode, asset, decimals, parsedRecipients, kinds } = useBatch();
  const parsed = parsedRecipients[index];
  const kind = kinds[index];

  let amountHint = "";
  if (mode === "custom" && row.amountRaw) {
    try {
      parseAmount(row.amountRaw, decimals);
    } catch (e) {
      if (e instanceof AmountError) amountHint = amountErrorMessage(e);
    }
  }

  return (
    <li className="rounded-lg border border-ink-border bg-ink-raised p-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <span className="w-8 text-xs text-ink-muted">{index + 1}</span>
        <input
          value={row.raw}
          onChange={(e) => updateRow(row.id, { raw: e.target.value })}
          placeholder="0x…"
          aria-label={`Recipient ${index + 1} address`}
          className="address min-h-11 flex-1 rounded-md border border-ink-border bg-ink-bg px-3 text-sm text-ink-text outline-none focus-visible:ring-2 focus-visible:ring-ink-accent"
        />
        {mode === "custom" ? (
          <input
            value={row.amountRaw}
            onChange={(e) => updateRow(row.id, { amountRaw: e.target.value })}
            placeholder="0.0"
            aria-label={`Recipient ${index + 1} amount in ${assetSymbol(asset)}`}
            className="min-h-11 w-full rounded-md border border-ink-border bg-ink-bg px-3 text-sm text-ink-text outline-none focus-visible:ring-2 focus-visible:ring-ink-accent md:w-36"
          />
        ) : null}
        <button
          type="button"
          onClick={() => removeRow(row.id)}
          className="min-h-11 px-3 text-xs text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-accent"
        >
          Remove
        </button>
      </div>
      <div className="mt-1 flex flex-wrap gap-3 text-xs text-ink-muted">
        {parsed?.ok ? (
          <>
            <span>✓ Valid address format · {truncateAddress(parsed.address)}</span>
            {kind ? <span>{kind.replace("_", " ")}</span> : null}
          </>
        ) : parsed && !parsed.ok && row.raw ? (
          <span className="text-ink-danger">{addressErrorMessage(parsed.reason)}</span>
        ) : null}
        {amountHint ? <span className="text-ink-danger">{amountHint}</span> : null}
        {kind === "CONTRACT" ? (
          <span className="text-ink-warning">
            This recipient is a contract. It may reject ETH.
          </span>
        ) : null}
      </div>
    </li>
  );
}

export { RecipientRowView as RecipientRow };
