"use client";

import { useEffect, useMemo, useState } from "react";

const example = {
  chainId: 763373,
  asset: "ETH",
  recipients: ["0x1111111111111111111111111111111111111111"],
  amounts: ["0.000001"],
};

export default function AgentsPage() {
  const [origin, setOrigin] = useState("https://YOUR_TENTACLE_HOST");
  useEffect(() => setOrigin(window.location.origin), []);

  const cursorConfig = useMemo(
    () =>
      JSON.stringify(
        {
          mcpServers: {
            tentacle: { url: `${origin}/api/mcp` },
          },
        },
        null,
        2,
      ),
    [origin],
  );

  const curl = `curl -X POST ${origin}/api/agent/prepare \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(example)}'`;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 text-ink-text md:px-6">
      <a href="/" className="text-sm text-ink-muted underline">
        ← Tentacle
      </a>
      <div className="mt-8 rounded-2xl border border-ink-border bg-ink-surface p-6 md:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-ink-muted">Agent infrastructure on Ink</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Tentacle for agents</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-muted">
          Prepare atomic batch-payment transactions for up to 50 recipients. Tentacle never receives
          a private key: the agent&apos;s wallet or smart account reviews and signs the returned payload.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["MCP", "Remote Streamable HTTP plus local stdio server."],
            ["HTTP API", "Deterministic unsigned calldata for ETH and configured tokens."],
            ["x402", "V2 discovery metadata live; paid settlement remains explicitly gated."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-xl border border-ink-border p-4">
              <h2 className="font-medium">{title}</h2>
              <p className="mt-2 text-xs leading-5 text-ink-muted">{body}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-ink-border bg-ink-surface p-6">
        <h2 className="text-xl font-semibold">Connect an MCP client</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Point Cursor, Claude Code, VS Code, or another Streamable HTTP MCP client at this endpoint:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-ink-border bg-ink-bg p-4 text-xs">
          {`${origin}/api/mcp`}
        </pre>
        <p className="mt-4 text-xs text-ink-muted">Cursor-style configuration:</p>
        <pre className="mt-2 overflow-x-auto rounded-xl border border-ink-border bg-ink-bg p-4 text-xs">
          {cursorConfig}
        </pre>
      </section>

      <section className="mt-6 rounded-2xl border border-ink-border bg-ink-surface p-6">
        <h2 className="text-xl font-semibold">Call the agent API directly</h2>
        <p className="mt-2 text-sm text-ink-muted">
          The API returns an unsigned transaction payload. Your wallet remains the signer.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-ink-border bg-ink-bg p-4 text-xs">
          {curl}
        </pre>
      </section>

      <section className="mt-6 rounded-2xl border border-ink-border bg-ink-surface p-6">
        <h2 className="text-xl font-semibold">Agent tools</h2>
        <ul className="mt-4 space-y-3 text-sm text-ink-muted">
          <li><code className="text-ink-text">tentacle_prepare_batch</code> — build unsigned batch calldata.</li>
          <li><code className="text-ink-text">tentacle_contract_info</code> — inspect configured deployments.</li>
          <li><code className="text-ink-text">tentacle_x402_info</code> — inspect x402 interoperability status.</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <a className="underline" href="/api/agent/manifest">Agent manifest</a>
          <a className="underline" href="/api/x402/discovery">x402 discovery</a>
          <a className="underline" href="/stats?network=sepolia">Sepolia evidence</a>
          <a className="underline" href="https://github.com/enstest1/inc_tentacle" target="_blank" rel="noreferrer">Source</a>
        </div>
      </section>
    </main>
  );
}
