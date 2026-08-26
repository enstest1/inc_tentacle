# Security

Tentacle is non-custodial batch-payment software. There is no admin key, no upgrade proxy, and no protocol treasury.

## Disclosure

Report vulnerabilities to the contact listed here once a human fills it in:

- Contact: **TBD — placeholder, not a live inbox**
- Please include: chain, contract address, transaction hashes, and a proof of concept that does not target users.

Do not exploit users. There is **no bug bounty** until one is explicitly announced.

## Supported version

- Contract: `TentacleBatcher.sol` (Solidity 0.8.36, EVM cancun)
- Frontend: this repository's `main` branch

## Production addresses

Not deployed to Ink mainnet. See `DEPLOYMENTS.md`.

External monitoring (Tenderly / Hypernative): **Not configured**.

## Scope

In scope: `contracts/src/TentacleBatcher.sol` and the V1 frontend's transaction-construction path.

Out of scope: third-party wallets, RPCs, Circle's token contracts, phishing of the hosted frontend's DNS, and anything listed in `docs/KNOWN_LIMITATIONS.md`.
