# Ink Spark Submission Readiness

Audit date: 2026-09-30

## Current verdict

**NOT READY TO SUBMIT AS A LIVE MAINNET PRODUCT.** Tentacle has the implementation, a public
reviewer dashboard, and a repeatable test-evidence workflow, but no configured Ink mainnet
deployment, hosted app URL, verified mainnet contract, or genuine mainnet activity. Testnet and
local activity must not be represented as traction.

## Product positioning

**Project name:** Tentacle

**One-line description:** Non-custodial batch-payment infrastructure on Ink for human wallets and
agent-controlled wallets.

**Ink impact:** Tentacle lets an Ink wallet distribute ETH, USDC, or USDC.e to many recipients in
one atomic transaction. It has no custody, admin key, relayer, or upgrade path; it simulates before
sending and emits a verifiable execution event for every completed batch. The same primitive can
be used by human wallets, smart accounts, and agent-wallet systems.

**Priority alignment:** AI / agent infrastructure; payments; developer infrastructure.

## What reviewers can inspect now

- Public source: https://github.com/enstest1/inc_tentacle
- Foundry contract, tests, threat model, audit scope, Slither triage, and deployment checklist
- A production-oriented Next.js application with simulation and receipt flow
- `/stats`, which derives metrics only from configured onchain `BatchExecuted` logs
- `scripts/interaction-campaign.mjs`, which creates real local/Sepolia evidence without a mainnet path
## Honest metrics and evidence

Mainnet `/stats` reports batch count, recipients, unique senders, ETH distributed, configured-token
totals, and contract/explorer links. It reads public Ink RPCs and deployment JSON only. If there is
no non-zero configured contract, it says **not deployed**. If the RPC is unavailable, it says so
instead of presenting zero metrics.

`/stats?network=sepolia` is a separately labelled Ink Sepolia test-evidence view. It is excluded
from the default mainnet view and must never be called customer usage, adoption, or traction.

The campaign accepts 20–50 interactions (30 default), uses tiny native test ETH values and varied
recipient counts, waits for successful receipts with `BatchExecuted`, and records hashes and
receipts in gitignored `evidence/interaction-campaign-*.json`. It cannot target mainnet. It uses
an unlocked Anvil account locally and needs `DEPLOYER_PRIVATE_KEY` only at Sepolia runtime; no key
value is logged or stored in evidence.

## Submission blockers

1. Ink Sepolia deployment and source verification are complete; 30/30 automated test batches are mined and retained as testnet evidence.
2. Complete the manual test matrix and human security / TERMS review.
3. Deploy approved immutable contracts on Ink mainnet only after the checklist is satisfied.
4. Gather genuine external mainnet usage before claiming adoption or traction.
5. Record real addresses, runtime hashes, transactions, timestamps, and verification URLs in
   `deployments/ink-mainnet.json`.
6. Publish the app at a stable public URL with the correct GitHub source link.
7. Obtain genuine mainnet use from independently inspectable wallets. Do not fabricate it and do
   not call automated testnet traffic traction.
8. Record a concise reviewer demo: connect → recipients → simulation → send → receipt/explorer proof.
## Suggested measurable milestones

These are goals, not present claims:

- Mainnet V1 live and verified
- First 25 distinct mainnet sending wallets
- First 100 successful mainnet batches
- First 1,000 mainnet recipient payments
- One external wallet, automation, DAO, contributor-payments, or agent integration
- Agent-wallet integration example / SDK helper

## Evidence links to fill after deployment

- App: TODO (no stable hosted URL recorded)
- GitHub: https://github.com/enstest1/inc_tentacle
- Mainnet contracts: TODO (not deployed)
- Mainnet explorer / verified source: TODO (not deployed)
- Mainnet activity dashboard: `/stats` after real deployment records are populated
- Ink Sepolia contract: https://explorer-sepolia.inkonchain.com/address/0xDc44eAa018d93f05CB66078a7AB2eEe49a80524a
- Testnet evidence: 30 mined Sepolia batches retained locally in gitignored `evidence/`; not traction
- Demo video: TODO

## Agent-first submission evidence

This release candidate adds reviewer-usable agent infrastructure on top of the immutable payment primitive: remote Streamable HTTP MCP (`/api/mcp`), local stdio MCP (`npm run mcp`), unsigned HTTP transaction preparation (`/api/agent/prepare`), agent capability manifest, onchain stats tool, TypeScript SDK, and an `/agents` onboarding page.

The x402 surface is intentionally scoped to V2-style discovery metadata today. CAIP-2 network identifiers are validated with `@x402/core`; paid settlement is not claimed until an Ink-compatible facilitator or reviewed self-facilitator is configured. This distinction should remain explicit in any Spark submission.

Mainnet deployment and genuine external usage remain submission gates. Automated Sepolia activity is technical evidence only.
