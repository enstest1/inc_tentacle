# Tentacle

**One send. Every wallet.**

Tentacle is non-custodial batch-payment infrastructure built for Ink. A user or wallet-controlled agent can distribute ETH, USDC, or USDC.e to many recipients in a single atomic transaction without depositing funds into Tentacle custody.

## Why Ink

Ink is Tentacle's primary home: low-cost EVM execution makes multi-recipient payouts practical, while the contract's event trail gives builders a verifiable record of who sent what, to how many recipients, and with which payload commitment.

Tentacle is designed as a payment primitive that can be used directly by people today and integrated by agent wallets or automation systems without adding a trusted relayer.

## What V1 does

- Native ETH and Ink USDC / USDC.e (two deployments of the same contract)
- Equal or custom payouts
- Optional ETH gas top-up with token payouts
- Paste addresses or import a restricted CSV
- Simulation before send, invalidated if the payment intent changes
- Atomic batches of up to 50 recipients; larger lists split with an explicit non-atomicity warning
- Emits `BatchExecuted` for verifiable onchain activity and receipts

## Agent compatibility

Tentacle has no admin key, custody account, relayer, or `from` parameter. Any wallet or smart-account system that can authorize an Ink transaction can call the batch contract directly. See `docs/AGENT_INTEGRATION.md` for the intended integration model and safety boundaries.

## What V1 does not do

V1 does not implement autonomous policy enforcement, delegated spending keys, recurring schedules, custody, accounts, backend services, fees, upgrades, or arbitrary-token routing. Agent-side spending policies must currently be enforced by the calling wallet or automation system. See `docs/KNOWN_LIMITATIONS.md`.

## Develop

```bash
npm ci
npm run dev
```

Contracts:

```bash
cd contracts
forge install foundry-rs/forge-std --no-git --shallow
forge install OpenZeppelin/openzeppelin-contracts@v5.2.0 --no-git --shallow
forge build
forge test -vvv
```

## Security

See `SECURITY.md`. The contracts are **not independently audited**. Mainnet deployment is intentionally blocked until the deployment checklist and verification steps are completed.

## Networks

| Network | Chain ID | Explorer |
|---|---:|---|
| Ink | 57073 | https://explorer.inkonchain.com |
| Ink Sepolia | 763373 | https://explorer-sepolia.inkonchain.com |

## Submission status

Tentacle is feature-complete locally, but **not yet Spark-submission ready** because the mainnet deployment and verifiable usage proof are still missing. See `docs/SPARK_SUBMISSION.md` for the exact remaining gate.

## Source

Repository: https://github.com/enstest1/inc_tentacle
