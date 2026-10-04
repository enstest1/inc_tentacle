# Ink Spark application — submission copy

Prepared and submitted: 2026-10-01

## Project Name
Tentacle

## Project Website
https://tentacle-production-747b.up.railway.app

> Current canonical domain (added 2026-10-04): https://tentacle.my. The Railway URL above is intentionally retained because it is the URL supplied in the 2026-10-01 Spark submission and remains live for reviewer continuity.

## Project Twitter
Leave blank unless a dedicated Tentacle account is created before submission.

## Project Description + Ink Impact
Tentacle is non-custodial, agent-native batch-payment infrastructure built specifically for Ink. One wallet-controlled transaction can atomically distribute ETH or configured stablecoins to as many as 50 recipients. The contract has no admin key, custody account, relayer, upgrade path, arbitrary `from`, or protocol fee; the caller remains the source of funds and signing authority.

Tentacle turns that primitive into reusable Ink infrastructure through a public wallet UI, remote MCP server, HTTP transaction-builder API, TypeScript SDK, machine-readable manifest, x402-style discovery metadata, and onchain reviewer dashboard. Human wallets, smart accounts, or software agents can discover Tentacle, prepare deterministic unsigned calldata, verify deployments and activity, then hand execution to their own wallet policy.

Ink is the right home because Spark explicitly prioritizes robust, verifiable agent transaction infrastructure and payment rails. Tentacle is designed to create repeatable Ink activity through contributor payouts, sub-agent funding, treasury distributions, automated settlements, and other multi-recipient workflows while preserving user-controlled signing and non-custodial design.
## Show Us What You're Building
https://tentacle-production-747b.up.railway.app/agents

Additional evidence for the application text:
- Source: https://github.com/enstest1/inc_tentacle
- Mainnet stats: https://tentacle-production-747b.up.railway.app/stats
- Remote MCP: https://tentacle-production-747b.up.railway.app/api/mcp
- Verified mainnet contract: https://explorer.inkonchain.com/address/0xe92f7634393ef5b6dd9fbc6d81b61e62a39e5164?tab=contract
- Mainnet deploy tx: https://explorer.inkonchain.com/tx/0xf495d94900b35da1edddf96d463fad963476059284d40b701ef231eceb904c6b
- Mainnet QA batch: https://explorer.inkonchain.com/tx/0x9bdf4f65c7f9e164ed06391947cbcc9b71dc123bf9e8da444c0269372d0b1d5b
- Sepolia test evidence: https://tentacle-production-747b.up.railway.app/stats?network=sepolia

## Mainnet Contracts Deployed
Verified Ink mainnet beta contract for native ETH + Circle USDC:
0xe92f7634393ef5b6dd9fbc6d81b61e62a39e5164
https://explorer.inkonchain.com/address/0xe92f7634393ef5b6dd9fbc6d81b61e62a39e5164?tab=contract

USDC.e instance is not deployed and is not claimed as live.

## Project Category
Select: AI / agent infrastructure; Payments; Infra; Protocol tooling

## Ink Priority Areas
Select: AI / agents; Payments; Developer tooling
## Proof of Traction or Demand
Tentacle is live on Ink mainnet with a source-verified contract, public app, public MCP/API/SDK interfaces, and reviewer-verifiable onchain metrics. The Ink Sepolia deployment completed 30 automated QA batches covering 120 recipient payments; this is disclosed as technical test evidence, not user traction.

The mainnet deployment is a new beta, so we do not claim external users, revenue, TVL, or independent adoption yet. A project-controlled mainnet QA batch is already mined and publicly verifiable: 1 successful batch, 2 recipients, and 0.000003 ETH distributed. It is explicitly labelled QA, not external traction. The grant would help convert strong technical proof into measurable ecosystem usage through security review, ecosystem integrations, community testers, and agent/developer distribution.

Proposed measurable next milestones: 25 distinct mainnet sending wallets, 100 successful mainnet batches, 1,000 recipient payments, and at least two external wallet/agent/treasury integrations.

## Builder Info
Submitted directly through the Spark form using builder-supplied contact details. Personal contact fields are intentionally not stored in this public repository.

## Requested Grant Amount
10,000 USDC

## What Would You Use the Funds For?
Use the grant as a focused 30–60 day acceleration budget: independent professional security review and remediation; reviewed USDC.e expansion; MCP/SDK and x402 interoperability hardening; Ink-native wallet, agent, treasury, or protocol integrations; developer onboarding and documentation; and community testing aimed at measurable external mainnet usage. The request is not for salaries, trading capital, routine hosting, or basic deployment costs.
## Funding Fit Acknowledgement
Check the required acknowledgement. Tentacle is already live and the request is for security, integration, and measurable growth work.

## Other Support Requested
Select: Feedback on product; Exposure/Amplification from INK; Ecosystem connections; Community testers

## Anything Else We Should Know?
Tentacle is intentionally small and composable: one immutable payment primitive plus open agent interfaces. We want other Ink builders to be able to use it without surrendering keys or funds to a hosted service. The public MCP endpoint can already prepare unsigned mainnet transactions and report onchain deployment/activity data. Paid x402 settlement is not claimed today; only discovery/interoperability metadata is live until a reviewed Ink-compatible facilitator path is configured.

The contract is not represented as professionally audited. The repository exposes the threat model, tests, static-analysis workflow, deployment records, runtime bytecode hash, and known limitations so reviewers can verify the current security posture directly.

## How Did You Hear About Spark?
Select: From Ink's website
