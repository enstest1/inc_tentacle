# Ink Spark Submission Readiness

Audit date: 2026-09-30

## Current verdict

**NOT READY TO SUBMIT YET.** The product is built locally, but Spark explicitly favors live, inspectable products with verifiable mainnet activity. Tentacle still has zeroed mainnet deployment records and no reviewer-verifiable traction dashboard.

## Strong application positioning

**Project name:** Tentacle

**One-line description:** Non-custodial batch-payment infrastructure on Ink for human wallets and agent-controlled wallets.

**Project description + Ink impact:** Tentacle lets an Ink wallet distribute ETH, USDC, or USDC.e to many recipients in one atomic transaction. It never custodies funds, has no admin key or upgrade path, simulates before sending, and emits a verifiable execution event for every completed batch. The same primitive can be called by human wallets, smart accounts, and agent-wallet systems, creating reusable payment rails and measurable transaction activity on Ink.

**Priority alignment:** AI / agent infrastructure; payments; developer infrastructure.

## What reviewers can inspect today

- Public source repository
- Production-oriented Next.js application
- Foundry smart contract and tests
- Threat model, audit scope, Slither triage, deployment checklist
- Simulation / payment-intent fingerprinting
- Atomic ETH and ERC-20 distribution with onchain `BatchExecuted` receipts

## Submission blockers

1. Deploy and verify Tentacle on Ink Sepolia.
2. Complete the manual Sepolia transaction matrix and record hashes.
3. Re-run Foundry locally/on CI once `forge` is available on PATH; the JavaScript gate currently passes 67/67 unit tests, 3/3 Playwright tests, typecheck, and production build.
4. Review the two remaining high npm advisories before launch: PostCSS in the Next 15 toolchain and `ws` in WalletConnect/Reown transitives. npm currently requires major Next/wagmi upgrades to eliminate them; Tentacle does not expose WalletConnect in V1.
5. Deploy the approved immutable contracts on Ink mainnet and populate `deployments/ink-mainnet.json` with real addresses, bytecode hashes, transactions, deployer, commit, timestamp, and verification URLs.
6. Publish the web app at a stable public URL with the real GitHub source link.
7. Add a public onchain activity view derived from `BatchExecuted` events: batches, recipients, unique senders, ETH distributed, USDC distributed, and explorer links.
8. Generate genuine usage. Do not fabricate or self-label test traffic as user traction.
9. Record a concise reviewer demo showing connect → recipients → simulation → send → receipt / explorer proof.
10. Submit only after all claimed usage can be cross-checked by reviewers.

## Suggested measurable milestones for a Spark request

- Mainnet V1 live and verified on Ink
- Onchain activity dashboard live
- First 25 unique sending wallets
- First 100 successful batches
- First 1,000 recipient payments
- Publish agent-wallet integration example / SDK helper
- Pilot one external wallet, automation, DAO, contributor-payments, or agent integration

These are targets, not current traction claims.

## Evidence links to fill before submission

- App: TODO
- GitHub: https://github.com/enstest1/inc_tentacle
- Mainnet contract (USDC): TODO
- Mainnet contract (USDC.e): TODO
- Explorer / verified source: TODO
- Activity dashboard: TODO
- Demo video: TODO
- Documentation: TODO
