# Tentacle Build Status

Audit date: 2026-09-30

- [x] Smart contract, local Anvil deployment, frontend, simulation, receipts, and test suite
- [x] Public `/stats` reviewer page based exclusively on configured `BatchExecuted` logs
- [x] Repeatable local / Ink Sepolia interaction-evidence campaign (20–50 native batches)
- [ ] Ink Sepolia deployment and recorded test evidence
- [ ] Ink mainnet deployment, verification, and genuine mainnet activity

## Current status

**MAINNET NOT DEPLOYED — NOT READY TO CLAIM TRACTION OR SUBMIT AS A LIVE MAINNET PRODUCT.**

`deployments/ink-mainnet.json` and `deployments/ink-sepolia.json` currently contain zero-address
contract placeholders. `/stats` treats that as **not deployed**; it does not show zero as a
deployment result and it does not query or synthesize activity. Anvil is a local development
deployment only.

## Reviewer metrics

`/stats` reads public Ink RPC logs for `BatchExecuted` only at non-zero Tentacle addresses from
the deployment JSON. It aggregates batches, recipients, unique senders, native ETH distributed
(including token-batch ETH top-ups), and per-configured-token totals. Explorer and verification
links are derived from the same deployment record. RPC failure is shown as unavailable, never as
no activity.

`/stats?network=sepolia` is deliberately separate and labelled **Ink Sepolia test evidence only**.
It must never be described as users, adoption, or mainnet traction.

## Evidence workflow

`npm run campaign:anvil -- --count 30` and `npm run campaign:sepolia -- --count 30` invoke
`scripts/interaction-campaign.mjs`. The script accepts only `anvil` and `sepolia`, defaults to 30,
and rejects counts outside 20–50. It sends real tiny native `batchNative` interactions, verifies
the receipt includes `BatchExecuted`, and saves an incremental JSON receipt record in gitignored
`evidence/`. It has no mainnet option.

Anvil uses an unlocked local account and needs no key. Sepolia requires the existing gitignored
`DEPLOYER_PRIVATE_KEY` to be present in the execution environment; its value is never logged or
written to the evidence file. If Anvil or its configured contract is unavailable, the script fails
with setup guidance and does not try to deploy anything.
## Security and deployment gates

- Contract source: `contracts/src/TentacleBatcher.sol` (immutable, non-custodial design preserved)
- Contract is not independently audited.
- Human sign-off is still required for TERMS, Slither triage, token validation, deployment, and verification.
- Do not run a mainnet deployment unless the documented human confirmation gate is satisfied.

## Validation

Current branch validation on 2026-09-30: 73/73 Vitest tests passed across 11 files, 3/3
Playwright tests passed, TypeScript typecheck passed, the Next.js production build passed with
`/stats`, and 48/48 Foundry tests passed including 256-run invariants with 128,000 calls each. A
fresh Anvil campaign also completed 30/30 real local batch transactions. Local QA is not traction.

## Remaining human work

1. Deploy and verify immutable Tentacle contracts on Ink Sepolia, then populate the deployment JSON.
2. Run the Sepolia campaign or manual matrix and retain its gitignored evidence locally; label it testnet.
3. Deploy verified contracts on Ink mainnet only after all checklist gates are signed off.
4. Populate mainnet deployment records with addresses, bytecode hashes, transactions, timestamps, and URLs.
5. Host the app at a stable public URL, then collect genuine mainnet activity that reviewers can cross-check.
6. Submit only when claims are supported by `/stats`, explorer links, and the public source repository.
## Dependency audit

`npm audit` on 2026-09-30 reports **0 critical, 2 high, 25 moderate** advisories. The two high advisories are PostCSS in the Next 15 dependency path and `ws` in the wagmi/WalletConnect dependency path; npm only offers breaking major upgrades to Next 16 and wagmi 3 for those paths. V1 does not expose WalletConnect. Reassess and remediate/accept explicitly before any mainnet launch rather than forcing unreviewed major migrations into this release candidate.
