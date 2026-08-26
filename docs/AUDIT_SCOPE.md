# Audit scope

```
Contract:                  TentacleBatcher.sol
Compiler:                  0.8.36 (exact)
EVM version:               cancun (explicit)
Optimizer:                 enabled, runs 200, via_ir false
Network:                   Ink
Chain ID:                  57073
Deployments:               one per token (native USDC, USDC.e) — identical bytecode
Token addresses:           see DEPLOYMENTS.md (proxy/implementation/admin still to record on-chain)
Upgradeable:               No
Owner / admin:             None
Custody:                   None
Protocol fee:              None
Maximum recipients:        50
External dependencies:     OpenZeppelin Contracts (exact tag recorded after forge install)
Business functions:        batchNative, batchToken, batchTokenWithGas
Explicit non-goals:        no `from`/payer/relayer parameter; no arbitrary call;
                           no upgradeability; no admin sweep
```

## EVM version confirmation (2026-08-25)

Ink's Foundry tutorial does not pin `evm_version` (it shows `solc = "0.8.19"`). Ink is an OP Stack chain whose Superchain registry entry has activated through **Karst** (2026-07-08). Cancun opcodes have been live since Ecotone. Pinning `cancun` produces bytecode that remains deployable; `prague`/`osaka` defaults in recent solc would be the unsafe choice.

No function signature contains a `from` or `payer` argument.

## Foundry fs_permissions

Spec listed `{ access = "read", path = "./deployments" }`. The Foundry root is `contracts/`, and deploy scripts must **write** `../deployments/*.json` (spec §17.2). `foundry.toml` therefore uses `read-write` on `../deployments`. This is a path adjustment, not a product change.

## Frontend versions (Phase 1)

See `package-lock.json` after the first known-good `npm ci`. Pins: Next 15.1.7, React 19.0.0, wagmi 2.14.11, viem 2.23.2, TypeScript 5.7.3, OpenZeppelin Contracts **v5.2.0**.

## CSP

`script-src` includes `'unsafe-eval'` because Next.js's webpack runtime evaluates strings. Spec §34 allowed `'unsafe-inline'` for the same reason. Do not add `*`.
