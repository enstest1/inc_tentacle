"use client";

import { useBatch } from "@/context/BatchContext";

function StatusIcon({ status }: { status: "pass" | "fail" | "warn" | "pending" }) {
  const map = {
    pass: { icon: "✓", label: "Passed" },
    fail: { icon: "✕", label: "Failed" },
    warn: { icon: "⚠", label: "Warning" },
    pending: { icon: "•", label: "Pending" },
  };
  const { icon, label } = map[status];
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true">{icon}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function SafetyPanel() {
  const { preflight, blocked } = useBatch();
  return (
    <section aria-live="polite" aria-label="SafeSend check" className="rounded-xl border border-ink-border bg-ink-raised p-4">
      <h2 className="mb-3 text-xs uppercase tracking-wider text-ink-muted">SafeSend check</h2>
      <ul className="space-y-2 text-sm">
        {preflight.map((row) => (
          <li
            key={row.id}
            className={
              row.status === "fail"
                ? "text-ink-danger"
                : row.status === "warn"
                  ? "text-ink-warning"
                  : row.status === "pass"
                    ? "text-ink-success"
                    : "text-ink-muted"
            }
          >
            <StatusIcon status={row.status} /> {row.label}
            {row.detail ? <p className="pl-6 text-xs text-ink-muted">{row.detail}</p> : null}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs font-medium text-ink-text">
        {blocked ? "Send disabled until every required check passes." : "Ready to send"}
      </p>
    </section>
  );
}
