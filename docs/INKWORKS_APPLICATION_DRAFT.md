# Inkworks application draft

## Project
Tentacle — agent-native batch settlement on Ink.

## What we built
Tentacle is a non-custodial atomic batch-payment primitive plus an agent-facing integration layer. The immutable Solidity contract can distribute ETH or one configured ERC-20 to as many as 50 recipients in a single transaction. There are no admin roles, protocol custody, arbitrary `from`, relayer privileges, protocol fees, or upgrade keys.

The integration layer includes a wallet UI, remote Streamable HTTP MCP, local stdio MCP, an HTTP transaction-builder API, public onchain stats, x402 V2-style discovery metadata, and a minimal TypeScript SDK. Agents receive unsigned calldata and keep signing authority in their own wallet/smart-account policy.

## Why Ink
Ink gives Tentacle a low-cost EVM settlement environment and a builder ecosystem explicitly interested in payments and agent infrastructure. Tentacle is designed to make Ink easier to use as a settlement layer for contributor payouts, agent/sub-agent funding, treasury distributions, and automation.

## Evidence today
- Verified immutable deployment on Ink Sepolia.
- 30/30 mined automated test batches and 30 `BatchExecuted` logs.
- Public-source repository and reviewer stats implementation.
- Agent MCP/API/SDK implementation ready for production deployment.

Testnet activity is presented only as technical evidence, not traction.

## What we want from Inkworks
Engineering and security guidance for mainnet launch, agent-wallet integrations, distribution to Ink-native builders, and help validating a production x402 settlement path without weakening Tentacle's non-custodial boundary.

## Six-week milestone proposal
1. Independent contract/release review and mainnet gate closure.
2. Verified Ink mainnet deployment for approved assets.
3. Public production app, MCP endpoint, SDK docs, and observability.
4. One external agent/wallet integration and genuine mainnet use.
5. Reviewed x402 paid-settlement integration or documented facilitator path.
6. Public demo and developer onboarding package.

## Links
- Repository: https://github.com/enstest1/inc_tentacle
- Verified Ink Sepolia contract: https://explorer-sepolia.inkonchain.com/address/0xDc44eAa018d93f05CB66078a7AB2eEe49a80524a
- Production URL: TODO
- Mainnet contracts: TODO
