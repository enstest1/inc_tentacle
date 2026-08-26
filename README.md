# Tentacle

**One send. Every wallet.**

Non-custodial batch payments on [Ink](https://inkonchain.com). Connect one wallet, enter multiple recipients, and send ETH or USDC to all of them in a single atomic transaction. Tentacle never holds the funds.

## What V1 does

- Native ETH and Ink USDC / USDC.e (two deployments of the same contract)
- Equal or custom payouts
- Optional ETH gas top-up with token payouts
- Paste addresses or import a restricted CSV
- Simulation before send, with invalidation if anything changes
- Atomic batches of up to 50 recipients; larger lists split with an explicit non-atomicity warning

## What V1 does not do

No custody, accounts, backend, fees, upgrades, admin keys, relayers, WalletConnect, ENS, or arbitrary tokens. See `docs/KNOWN_LIMITATIONS.md`.

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

See `SECURITY.md`. This software is **not audited**. Do not send mainnet funds until an independent review is complete and a human has run the deployment checklist.

### Dependencies (fonts)

Commit Mono v1.143 is SIL Open Font License 1.1 (`public/fonts/OFL.txt`). Free for commercial use, including the Tentacle wordmark. No attribution is required unless a derivative font is produced.

## Networks

| Network | Chain ID | Explorer |
|---|---|---|
| Ink | 57073 | https://explorer.inkonchain.com |
| Ink Sepolia | 763373 | https://explorer-sepolia.inkonchain.com |
