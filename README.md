# Tentacle

**One send. Every wallet.**

Tentacle is non-custodial batch-payment infrastructure built for Ink. A user or wallet-controlled
agent can distribute ETH, USDC, or USDC.e to many recipients in one atomic transaction without
depositing funds into Tentacle custody.

## What V1 does

- Native ETH and Ink USDC / USDC.e (one immutable contract deployment per token)
- Equal or custom payouts, optional ETH gas top-up with token payouts
- Paste addresses or import a restricted CSV
- Simulation before send, invalidated when the payment intent changes
- Atomic batches of up to 50 recipients; larger lists split with an explicit non-atomicity warning
- Emits `BatchExecuted` for verifiable onchain execution and receipts

Tentacle has no admin key, custody account, relayer, `from` parameter, fees, or upgrade path.
Any wallet or smart-account system that can authorize an Ink transaction can call it directly.
See `docs/AGENT_INTEGRATION.md` and `docs/KNOWN_LIMITATIONS.md`.

## Live app

- App: https://tentacle-production-747b.up.railway.app
- Agent onboarding: https://tentacle-production-747b.up.railway.app/agents
- Remote MCP: https://tentacle-production-747b.up.railway.app/api/mcp
- Agent manifest: https://tentacle-production-747b.up.railway.app/api/agent/manifest
- x402 discovery: https://tentacle-production-747b.up.railway.app/api/x402/discovery
- Mainnet reviewer stats: https://tentacle-production-747b.up.railway.app/stats
- Sepolia test evidence: https://tentacle-production-747b.up.railway.app/stats?network=sepolia

## Develop

```bash
npm ci
npm run dev
npm test
npm run typecheck
npm run build
npm run test:e2e
```

Contracts (Foundry):

```bash
cd contracts
forge build
forge test -vvv
```
## Reviewer-facing onchain stats

`/stats` is a public reviewer page. It reads only `BatchExecuted` logs through
the public Ink RPCs for non-zero addresses recorded in `deployments/ink-mainnet.json`.

It shows batch count, recipient count, unique senders, ETH distributed (native payouts plus token
gas top-ups), configured-token totals, and explorer/deployment links. It never uses a database or
off-chain counter. A public RPC failure is shown as unavailable, not zero activity. The primary
Ink mainnet USDC-backed Tentacle deployment is recorded and verified; USDC.e remains explicitly pending.

Ink Sepolia is shown in a separate **test evidence** section. It is explicitly not mainnet
activity, users, or traction.

## Interaction campaign evidence

The campaign makes 20–50 real `batchNative` calls (default 30) against only Anvil or Ink Sepolia.
It varies recipient counts and uses very small native test amounts. It records transaction hashes,
receipt status, block numbers, and recipients in `evidence/interaction-campaign-*.json`; that
directory is gitignored. It never has a mainnet option.

Anvil uses an unlocked local node account, so no key is read by the campaign. Start Anvil and use
the existing local deployment before running it:

```bash
anvil
cd contracts
forge script script/DeployLocal.s.sol:DeployLocal --rpc-url http://127.0.0.1:8545 --broadcast
cd ..
npm run campaign:anvil -- --count 30
```
If Foundry is unavailable, the campaign does not attempt deployment: it can use an already-running
Anvil deployment matching `deployments/anvil.json`, otherwise it fails with an actionable message.

For Ink Sepolia, a human must first deploy and record a real non-zero address in
`deployments/ink-sepolia.json`. Run from a secret-aware shell where the existing gitignored
`DEPLOYER_PRIVATE_KEY` is available as an environment variable:

```bash
npm run campaign:sepolia -- --count 30
```

Sepolia evidence is test evidence only. Do not describe automated testnet transactions as users,
adoption, or mainnet traction.

## Security and deployment status

The contracts are **not independently audited**. A limited Ink mainnet beta is live for native ETH and
Circle USDC through the verified immutable USDC-backed Tentacle contract. USDC.e remains undeployed and
is shown as pending rather than implied as available.

| Network | Chain ID | Explorer |
|---|---:|---|
| Ink | 57073 | https://explorer.inkonchain.com |
| Ink Sepolia | 763373 | https://explorer-sepolia.inkonchain.com |

## Spark submission status

Tentacle is now a **live, verified Ink mainnet beta** for ETH and native USDC, with public agent interfaces
and reviewer metrics. It still must not claim independent-user traction until external wallets use it.
See `docs/SPARK_SUBMISSION.md` for the evidence and remaining adoption milestones.

## Source

Repository: https://github.com/enstest1/inc_tentacle

## Agent-first interfaces

Tentacle can now be used directly by agents as well as through the wallet UI.

- `/agents` — copy-paste MCP/API onboarding for agent builders.
- `/api/mcp` — remote Streamable HTTP MCP endpoint.
- `npm run mcp` — local stdio MCP server.
- `/api/agent/prepare` — unsigned transaction builder for ETH, USDC, and USDC.e batches.
- `/api/agent/manifest` — machine-readable capability manifest.
- `/api/x402/discovery` — x402 V2-style discovery metadata using CAIP-2 network identifiers.
- `sdk/tentacle-client.ts` — small fetch-based TypeScript client.

MCP tools: `tentacle_prepare_batch`, `tentacle_contract_info`, `tentacle_get_stats`, and `tentacle_x402_info`.

The machine interfaces never receive a private key. They prepare deterministic unsigned transactions for a caller-controlled wallet or smart account to review and sign. x402 discovery interoperability is live; paid x402 settlement is intentionally disabled until an Ink-compatible facilitator or reviewed self-facilitator is configured.
