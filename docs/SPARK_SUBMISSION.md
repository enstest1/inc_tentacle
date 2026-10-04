# Ink Spark Submission Readiness

Audit date: 2026-09-30

## Current verdict

**LIVE MAINNET BETA; SUBMISSION EVIDENCE IS VERIFIABLE, BUT EXTERNAL TRACTION IS NOT YET CLAIMED.** Tentacle has a public reviewer dashboard, repeatable test evidence, a verified Ink mainnet USDC-backed contract, and live agent interfaces. Project-controlled QA and testnet activity must not be represented as independent-user traction.

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

1. [DONE] Ink Sepolia deployment, source verification, and 30/30 automated test batches.
2. [DONE] Verified Ink mainnet USDC/ETH beta deployment with checked-in runtime hash, transaction, timestamp, and explorer URL.
3. [DONE] Public app, MCP/API/SDK agent interfaces, reviewer metrics, and demo recording.
4. Run a small project-controlled mainnet QA batch and label it as QA, not traction.
5. Complete human TERMS/legal review and independent professional security review before calling the product audited.
6. Obtain genuine external mainnet use before claiming adoption or traction.
7. Decide whether/when to deploy the separate USDC.e instance.
## Suggested measurable milestones

These are goals, not present claims:

- Mainnet V1 live and verified
- First 25 distinct mainnet sending wallets
- First 100 successful mainnet batches
- First 1,000 mainnet recipient payments
- One external wallet, automation, DAO, contributor-payments, or agent integration
- Agent-wallet integration example / SDK helper

## Evidence links to fill after deployment

- App: https://tentacle.my
- GitHub: https://github.com/enstest1/inc_tentacle
- Mainnet contract: https://explorer.inkonchain.com/address/0xe92f7634393ef5b6dd9fbc6d81b61e62a39e5164
- Mainnet verified source: https://explorer.inkonchain.com/address/0xe92f7634393ef5b6dd9fbc6d81b61e62a39e5164?tab=contract
- Mainnet deployment tx: https://explorer.inkonchain.com/tx/0xf495d94900b35da1edddf96d463fad963476059284d40b701ef231eceb904c6b
- Mainnet activity dashboard: https://tentacle.my/stats
- Ink Sepolia contract: https://explorer-sepolia.inkonchain.com/address/0xDc44eAa018d93f05CB66078a7AB2eEe49a80524a
- Testnet evidence: 30 mined Sepolia batches retained locally in gitignored `evidence/`; not traction
- Demo video: `demo/tentacle-reviewer-demo.mp4` in the public repository

## Agent-first submission evidence

This release candidate adds reviewer-usable agent infrastructure on top of the immutable payment primitive: remote Streamable HTTP MCP (`/api/mcp`), local stdio MCP (`npm run mcp`), unsigned HTTP transaction preparation (`/api/agent/prepare`), agent capability manifest, onchain stats tool, TypeScript SDK, and an `/agents` onboarding page.

The x402 surface is intentionally scoped to V2-style discovery metadata today. CAIP-2 network identifiers are validated with `@x402/core`; paid settlement is not claimed until an Ink-compatible facilitator or reviewed self-facilitator is configured. This distinction should remain explicit in any Spark submission.

Mainnet deployment is complete. Genuine external usage remains an adoption milestone, not a claim in the current application. Automated Sepolia activity remains technical evidence only.
