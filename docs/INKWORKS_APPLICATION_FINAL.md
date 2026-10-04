# Inkworks Cohort 01 — Tentacle application

## Project
**Tentacle — agent-native payments on Ink.**

Tentacle is a non-custodial payment rail for AI agents, smart accounts, and human wallets. One Ink transaction can atomically pay or fund up to 50 recipients in ETH or native USDC. Agents discover Tentacle over MCP, prepare deterministic unsigned transactions, verify deployment/activity, and hand signing to their own wallet policy. Tentacle never receives a private key or takes custody.

## Why this needs Ink
Agent payments become more useful when many small payouts are cheap enough to execute routinely. Ink's low fees and fast blocks make multi-recipient contributor payouts, sub-agent funding, treasury distribution, and automated settlement practical without introducing a custodial relayer. Ink's Superchain position also gives Tentacle a credible path toward interoperable agent payment workflows.

## What is live today
- Production app: https://tentacle-production-747b.up.railway.app
- Agent onboarding: https://tentacle-production-747b.up.railway.app/agents
- Remote MCP: https://tentacle-production-747b.up.railway.app/api/mcp
- Public mainnet stats: https://tentacle-production-747b.up.railway.app/stats
- Source: https://github.com/enstest1/inc_tentacle

## Verifiable mainnet evidence
- Verified Ink mainnet contract: `0xe92f7634393ef5b6dd9fbc6d81b61e62a39e5164`
- Explorer: https://explorer.inkonchain.com/address/0xe92f7634393ef5b6dd9fbc6d81b61e62a39e5164?tab=contract
- Deployment tx: `0xf495d94900b35da1edddf96d463fad963476059284d40b701ef231eceb904c6b`
- Mainnet QA batch: `0x9bdf4f65c7f9e164ed06391947cbcc9b71dc123bf9e8da444c0269372d0b1d5b`
- Current public stats: 1 project-controlled mainnet batch, 2 recipients, 0.000003 ETH distributed.
- Ink Sepolia technical evidence: 30 QA batches / 120 recipient payments. This is test evidence, not traction.

## Technical posture
The Solidity payment primitive is immutable and has no admin key, relayer privilege, arbitrary `from`, protocol custody, fee switch, or upgrade key. Frontend, E2E, Foundry contracts, secrets scanning, and Slither are green. `TentacleBatcher.sol` reached 100% line/statement/branch/function coverage in the release audit. The contract is not represented as professionally audited.

## Why Inkworks now
Tentacle has crossed from prototype to live infrastructure. The next bottleneck is not whether it can be built; it is turning a verified payment primitive into something other Ink builders and agents actually integrate and use. Inkworks' six-week co-building format is a strong fit for that transition.

## Six-week build plan
1. Independent professional security review, remediation, and release hardening.
2. Ship one external wallet/smart-account integration and one agent integration using the MCP/API/SDK.
3. Add reviewed USDC.e support or document why native USDC remains the safer production path.
4. Harden x402 interoperability and validate an Ink-compatible paid-settlement path without weakening wallet-controlled authorization.
5. Add an Ink-native growth loop: developer examples, onboarding, and community testing with measurable mainnet usage.
6. Target at least 25 distinct mainnet senders, 100 successful batches, 1,000 recipient payments, and two external integrations, with all metrics publicly verifiable onchain.

## Builder
Christopher Tomich (@pelpa333). Solo builder currently also building on Canton, with prior crypto tooling across Ethereum, Base, Solana, Robinhood Chain, and Ink. Can commit real weekly build time throughout the six-week program.

## What we want from Inkworks
Hands-on engineering/security review, distribution to Ink builders, wallet/agent integration partners, feedback on positioning, and milestone funding for security and measurable adoption work. Tentacle is not asking Inkworks to fund a concept or routine hosting; the product is already live on Ink mainnet.

## Current application status
The official Inkworks site currently says applications are rolling/ongoing, but its official `APPLY NOW` Tally form (`https://tally.so/r/ja5NER`) returned **"This form is now closed"** when checked on 2026-10-04. This application copy is ready to submit as soon as Ink reopens the official route.
