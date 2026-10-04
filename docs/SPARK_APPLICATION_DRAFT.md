# Ink Spark application draft

Status: public production app and verified Ink mainnet beta are live. External-user traction is not yet claimed.

## Project name
Tentacle

## Website
https://tentacle-production-747b.up.railway.app

## Repository
https://github.com/enstest1/inc_tentacle

## Project description + Ink impact
Tentacle is agent-native batch-payment infrastructure built for Ink. A human wallet, smart account, or software agent can atomically distribute ETH or configured ERC-20 assets to as many as 50 recipients in one transaction. Tentacle is non-custodial, has no admin key, no relayer, no upgrade path, and charges no protocol fee. The caller remains the source of funds.

The product now exposes the same primitive through a wallet UI, a remote MCP server, a local stdio MCP server, an HTTP transaction-builder API, and a lightweight TypeScript SDK. Agents can discover the tool, prepare deterministic unsigned calldata, inspect deployments and onchain stats, then hand the transaction to their own wallet policy for review/signing.

This directly supports Ink's agent/payment infrastructure category: one small permissionless contract becomes a reusable settlement rail for contributor payouts, sub-agent funding, treasury distributions, automation, and other multi-recipient workflows.

## Show us what you're building
- Production UI: https://tentacle-production-747b.up.railway.app
- Agent onboarding: `/agents`
- Remote MCP endpoint: `/api/mcp`
- Agent manifest: `/api/agent/manifest`
- x402 discovery: `/api/x402/discovery`
- Reviewer metrics: `/stats`
- Verified Ink Sepolia contract: https://explorer-sepolia.inkonchain.com/address/0xDc44eAa018d93f05CB66078a7AB2eEe49a80524a
- Ink Sepolia deployment transaction: https://explorer-sepolia.inkonchain.com/tx/0x45eccf047a7529a8c64effea986d249331c7daff677463293d7c5f046ff67bc1

Current testnet evidence: 30/30 automated Ink Sepolia batch transactions mined, with exactly 30 `BatchExecuted` events. This is technical test evidence, not user traction.

## Mainnet contracts
- Verified Tentacle (native ETH + Circle USDC): https://explorer.inkonchain.com/address/0xe92f7634393ef5b6dd9fbc6d81b61e62a39e5164?tab=contract
- Deployment transaction: https://explorer.inkonchain.com/tx/0xf495d94900b35da1edddf96d463fad963476059284d40b701ef231eceb904c6b
- USDC.e deployment: pending; not claimed as live.

## Category
AI / Agent Infrastructure; Payments / Developer Infrastructure.

## Funding request
Suggested ask: **10,000 USDC**, milestone-based.

Proposed use: independent professional security review and remediation; USDC.e expansion after review; MCP/SDK and x402 interoperability hardening; Ink ecosystem integrations; developer onboarding; and community testing aimed at measurable external Ink usage. Funds are not requested for salaries, trading capital, or basic deployment costs. No grant claim depends on fabricated testnet or self-generated "traction."

