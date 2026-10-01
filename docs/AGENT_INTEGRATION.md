# Agent Integration

Tentacle's V1 contract is a permissionless payment primitive. It does not run an AI agent and it does not custody an agent's funds. Instead, an agent wallet or smart-account system can call Tentacle when its own authorization policy allows a payout.

## Integration model

```text
Agent / automation
      |
      | decides recipients + amounts
      v
Wallet / smart account policy
      |
      | signs or authorizes Ink transaction
      v
TentacleBatcher
      |
      +--> recipient 1
      +--> recipient 2
      +--> recipient N
```

The caller remains the source of funds. For ERC-20 batches, `TentacleBatcher` pulls only from `msg.sender`; there is deliberately no arbitrary `from` parameter.

## Safety boundary

V1 does **not** enforce delegated-agent permissions such as daily spend limits, recipient allowlists, expiry, or recurring payment schedules. Those controls belong in the calling smart account or automation layer until a separately reviewed policy module is shipped.

This boundary is intentional: Tentacle stays small, non-upgradeable, and non-custodial rather than pretending to provide agent authorization it does not actually enforce.

## Verifiable execution

Every successful batch emits `BatchExecuted(sender, asset, totalAssetAmount, totalNativeTopUp, recipientCount, payloadHash)`. An indexer, agent, or dashboard can use these events to prove activity and reconcile an intended batch with its onchain execution.

`payloadHash` commits to the exact ordered recipient list, amounts, and native gas top-up value used by the contract.

## Recommended agent-side policy

Before calling Tentacle, an integrating wallet should independently enforce controls such as:

- maximum value per transaction and per day
- maximum recipient count
- approved assets
- recipient allowlists or risk checks
- simulation before signing
- expiry / replay protection for offchain intents
- human approval above a configured threshold

A future Tentacle policy module may standardize these controls, but it should be treated as a separate security surface and audited independently.

## Agent interfaces shipped in this release

Tentacle now exposes the payment primitive through three machine-facing surfaces:

- Remote MCP: `/api/mcp` using Streamable HTTP.
- Local MCP: `npm run mcp` using stdio.
- HTTP transaction builder: `POST /api/agent/prepare`.
- Minimal TypeScript client: `sdk/tentacle-client.ts`.

The MCP server currently exposes `tentacle_prepare_batch`, `tentacle_contract_info`, `tentacle_get_stats`, and `tentacle_x402_info`.

`tentacle_prepare_batch` returns unsigned transaction calldata only. It never accepts a private key and never signs or broadcasts on behalf of the caller. A wallet or smart account remains the authorization and signing boundary.

## x402 interoperability

`GET /api/x402/discovery` publishes x402 V2-style discovery metadata and validates CAIP-2 network identifiers with `@x402/core`. The discovery entry advertises the MCP tool and its input schema so agent systems can discover how to prepare a Tentacle batch.

Production x402 paid settlement is **not enabled yet**. Tentacle will not advertise a fake `402 Payment Required` flow until an Ink-compatible facilitator or a reviewed self-facilitator is configured for the desired Ink network and asset. This keeps the current claim precise: x402 discovery interoperability is live; paid x402 settlement remains a separate reviewed milestone.
