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
