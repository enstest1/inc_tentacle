"use client";

import { useEffect, useState } from "react";
import { formatUnits, zeroAddress, type Address } from "viem";
import { Header } from "@/components/Header";
import { ink, inkSepolia } from "@/lib/chains";
import { makePublicClient } from "@/lib/client";
import { tentacleAbi } from "@/lib/contracts";
import { loadDeployments, type DeploymentRecord } from "@/lib/deployments";
import { aggregateBatchEvents, configuredTokenTotals, type BatchEventLike, type BatchStats } from "@/lib/stats";

const ZERO = zeroAddress.toLowerCase();
const LOG_BLOCK_SPAN = 9_999n;

type DeploymentView = { deployment: DeploymentRecord; stats?: BatchStats; events?: BatchEventLike[]; error?: string };
type ChainView = { loading: boolean; deployments: DeploymentView[] };

function configured(address: string): boolean {
  return address.length === 42 && address.toLowerCase() !== ZERO;
}

function txHash(value: string): value is `0x${string}` {
  return /^0x[0-9a-fA-F]{64}$/.test(value);
}

async function readDeployment(chainId: number, deployment: DeploymentRecord): Promise<DeploymentView> {
  if (!configured(deployment.tentacle)) return { deployment, error: "Not deployed: no contract address is configured." };
  if (!txHash(deployment.deploymentTx)) {
    return { deployment, error: "No deployment transaction is recorded, so a safe event start block is unavailable." };
  }
  try {
    const client = makePublicClient(chainId);
    const deploymentReceipt = await client.getTransactionReceipt({ hash: deployment.deploymentTx });
    const latest = await client.getBlockNumber();
    const events: BatchEventLike[] = [];
    for (let fromBlock = deploymentReceipt.blockNumber; fromBlock <= latest; fromBlock += LOG_BLOCK_SPAN + 1n) {
      const toBlock = fromBlock + LOG_BLOCK_SPAN > latest ? latest : fromBlock + LOG_BLOCK_SPAN;
      const logs = await client.getContractEvents({
        address: deployment.tentacle as Address,
        abi: tentacleAbi,
        eventName: "BatchExecuted",
        fromBlock,
        toBlock,
      });
      for (const log of logs) {
        const args = log.args;
        if (!args.sender || !args.asset || args.totalAssetAmount === undefined || args.recipientCount === undefined) continue;
        events.push({
          sender: args.sender,
          asset: args.asset,
          totalAssetAmount: args.totalAssetAmount,
          totalNativeTopUp: args.totalNativeTopUp ?? 0n,
          recipientCount: args.recipientCount,
        });
      }
    }
    return { deployment, events, stats: aggregateBatchEvents(events) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown RPC error";
    return { deployment, error: `Unable to read public RPC data: ${message}` };
  }
}

async function readChain(chainId: number): Promise<DeploymentView[]> {
  return Promise.all(loadDeployments(chainId).deployments.map((deployment) => readDeployment(chainId, deployment)));
}

function short(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function value(valueWei: bigint, decimals = 18): string {
  // Keep bigint precision: reviewer metrics must never pass through Number.
  const formatted = formatUnits(valueWei, decimals);
  const [whole, fraction] = formatted.split(".");
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction ? `${groupedWhole}.${fraction}` : groupedWhole;
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="rounded-xl border border-ink-border bg-ink-bg p-4"><dt className="text-xs uppercase tracking-wide text-ink-muted">{label}</dt><dd className="mt-2 text-xl font-medium text-ink-text">{children}</dd></div>;
}

function ChainSummary({ view, testnet }: { view: ChainView; testnet: boolean }) {
  if (view.loading) return null;
  if (view.deployments.length === 0 || view.deployments.every((entry) => !configured(entry.deployment.tentacle))) {
    return <p className="mb-4 rounded-xl border border-ink-border bg-ink-surface p-4 text-sm text-ink-warning">No configured {testnet ? "testnet" : "mainnet"} deployment. Network totals are unavailable.</p>;
  }
  const configuredEntries = view.deployments.filter((entry) => configured(entry.deployment.tentacle));
  if (configuredEntries.some((entry) => !entry.events)) {
    return <p className="mb-4 rounded-xl border border-ink-border bg-ink-surface p-4 text-sm text-ink-warning">Complete totals for configured deployments are unavailable until each live contract has a readable deployment transaction and public-RPC event range.</p>;
  }
  const stats = aggregateBatchEvents(configuredEntries.flatMap((entry) => entry.events ?? []));
  const tokens = configuredTokenTotals(configuredEntries.map((entry) => entry.deployment), stats.tokenTotals);
  return <dl className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
    <Metric label="All batches">{stats.batches.toLocaleString()}</Metric>
    <Metric label="All recipients">{stats.recipients.toLocaleString()}</Metric>
    <Metric label="All unique senders">{stats.uniqueSenders.toLocaleString()}</Metric>
    <Metric label="All ETH distributed">{value(stats.ethDistributedWei)} ETH</Metric>
    {tokens.map((token) => <Metric key={token.address} label={`All ${token.symbol} distributed`}>{value(token.total, token.decimals)}</Metric>)}
  </dl>;
}

function DeploymentCard({ view, chainId, testnet }: { view: DeploymentView; chainId: number; testnet: boolean }) {
  const { deployment, stats, error } = view;
  const explorer = chainId === ink.id ? "https://explorer.inkonchain.com" : "https://explorer-sepolia.inkonchain.com";
  const tokens = stats ? configuredTokenTotals([deployment], stats.tokenTotals) : [];
  return (
    <article className="rounded-2xl border border-ink-border bg-ink-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h3 className="text-lg font-medium text-ink-text">{deployment.label}</h3><p className="mt-1 text-xs text-ink-muted">{configured(deployment.tentacle) ? short(deployment.tentacle) : "No configured contract"}</p></div>
        {configured(deployment.tentacle) ? <div className="flex gap-3 text-xs text-ink-muted underline">
          <a href={`${explorer}/address/${deployment.tentacle}`} target="_blank" rel="noreferrer">Contract</a>
          {txHash(deployment.deploymentTx) ? <a href={`${explorer}/tx/${deployment.deploymentTx}`} target="_blank" rel="noreferrer">Deploy tx</a> : null}
          {deployment.verifiedUrl ? <a href={deployment.verifiedUrl} target="_blank" rel="noreferrer">Verification</a> : null}
        </div> : null}
      </div>
      {stats ? <dl className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Metric label="Batches">{stats.batches.toLocaleString()}</Metric>
        <Metric label="Recipients">{stats.recipients.toLocaleString()}</Metric>
        <Metric label="Unique senders">{stats.uniqueSenders.toLocaleString()}</Metric>
        <Metric label="ETH distributed">{value(stats.ethDistributedWei)} ETH</Metric>
        {tokens.map((token) => <Metric key={token.address} label={`${token.symbol} distributed`}>{value(token.total, token.decimals)}</Metric>)}
      </dl> : null}
      {error ? <p className="mt-5 text-sm text-ink-warning">{error}</p> : null}
      {stats?.batches === 0 ? <p className="mt-5 text-sm text-ink-muted">No {testnet ? "test" : "mainnet"} BatchExecuted events were found from the deployment block through the latest public RPC block.</p> : null}
    </article>
  );
}

function ChainSection({ title, note, chainId, view, testnet }: { title: string; note: string; chainId: number; view: ChainView; testnet: boolean }) {
  return <section className="mx-auto mt-8 max-w-6xl px-4 md:px-8">
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2"><div><h2 className="text-xl font-medium text-ink-text">{title}</h2><p className="mt-1 max-w-3xl text-sm text-ink-muted">{note}</p></div>{view.loading ? <span className="text-xs text-ink-muted">Reading public RPC…</span> : null}</div>
    <ChainSummary view={view} testnet={testnet} />
    <div className="grid gap-4">{view.deployments.map((entry) => <DeploymentCard key={entry.deployment.label} view={entry} chainId={chainId} testnet={testnet} />)}</div>
  </section>;
}

export default function StatsPage() {
  const [mainnet, setMainnet] = useState<ChainView>({ loading: true, deployments: [] });
  const [sepolia, setSepolia] = useState<ChainView>({ loading: false, deployments: [] });
  const [showSepolia, setShowSepolia] = useState(false);
  useEffect(() => {
    void readChain(ink.id).then((deployments) => setMainnet({ loading: false, deployments }));
    const includeSepolia = new URLSearchParams(window.location.search).get("network") === "sepolia";
    setShowSepolia(includeSepolia);
    if (includeSepolia) void readChain(inkSepolia.id).then((deployments) => setSepolia({ loading: false, deployments }));
  }, []);
  return <main className="min-h-screen pb-16">
    <Header />
    <section className="mx-auto max-w-6xl px-4 pt-10 md:px-8"><p className="text-xs uppercase tracking-[0.18em] text-ink-muted">Reviewer metrics</p><h1 className="mt-3 text-3xl font-medium tracking-tight text-ink-text md:text-5xl">Onchain batch activity</h1><p className="mt-4 max-w-3xl text-sm leading-6 text-ink-muted">Metrics are derived in this browser from BatchExecuted logs on Ink public RPCs and checked-in deployment records. Mainnet is the only activity shown as product usage. Optional Sepolia data is isolated technical evidence.</p></section>
    <ChainSection title="Ink mainnet" note="Reviewer-facing product metrics. Missing contract or deployment-transaction data is shown explicitly rather than guessed." chainId={ink.id} view={mainnet} testnet={false} />
    {showSepolia ? <ChainSection title="Ink Sepolia — testnet only" note="Technical test evidence only. This data is never included in claims about users, adoption, product usage, or traction." chainId={inkSepolia.id} view={sepolia} testnet /> : null}
  </main>;
}
