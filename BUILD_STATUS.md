# Tentacle Build Status

Audit date: 2026-09-30

- [x] Smart contract, local Anvil deployment, frontend, simulation, receipts, and test suite
- [x] Public `/stats` reviewer page based exclusively on configured `BatchExecuted` logs
- [x] Repeatable local / Ink Sepolia interaction-evidence campaign (20–50 native batches)
- [x] Ink Sepolia deployment, verified source, and recorded 30-transaction test evidence
- [ ] Ink mainnet deployment, verification, and genuine mainnet activity

## Current status

**MAINNET NOT DEPLOYED — NOT READY TO CLAIM TRACTION OR SUBMIT AS A LIVE MAINNET PRODUCT.**

`deployments/ink-mainnet.json` remains a zero-address placeholder. Ink Sepolia is deployed and source-verified at `0xDc44eAa018d93f05CB66078a7AB2eEe49a80524a`; `/stats?network=sepolia` reads its onchain logs. Anvil remains a local development deployment only.

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
fresh Anvil campaign completed 30/30 local batch transactions, and a live Ink Sepolia campaign completed 30/30 mined batches with exactly 30 `BatchExecuted` logs. Testnet QA is not traction.

## Remaining human work

1. Complete the remaining manual matrix and human security / TERMS review.
2. Deploy verified contracts on Ink mainnet only after all checklist gates are signed off.
3. Populate mainnet deployment records with addresses, bytecode hashes, transactions, timestamps, and URLs.
4. Obtain genuine external mainnet usage before claiming adoption or traction.
5. Host the app at a stable public URL, then collect genuine mainnet activity that reviewers can cross-check.
6. Submit only when claims are supported by `/stats`, explorer links, and the public source repository.
## Dependency audit

`npm audit` on 2026-09-30 reports **0 critical, 2 high, 25 moderate** advisories. The two high advisories are PostCSS in the Next 15 dependency path and `ws` in the wagmi/WalletConnect dependency path; npm only offers breaking major upgrades to Next 16 and wagmi 3 for those paths. V1 does not expose WalletConnect. Reassess and remediate/accept explicitly before any mainnet launch rather than forcing unreviewed major migrations into this release candidate.

## Agent-first release candidate

The current branch now includes a real agent integration layer rather than only contract-level agent compatibility:

- remote Streamable HTTP MCP at `/api/mcp`
- local stdio MCP via `npm run mcp`
- unsigned HTTP transaction builder at `/api/agent/prepare`
- machine-readable agent manifest at `/api/agent/manifest`
- reviewer-verifiable MCP stats tool
- x402 V2-style discovery metadata at `/api/x402/discovery`, with CAIP-2 network identifiers validated by `@x402/core`
- TypeScript helper in `sdk/`
- public `/agents` onboarding page

Production x402 paid settlement is not claimed or enabled because an Ink-compatible facilitator/self-facilitator has not yet been reviewed/configured. Mainnet remains gated by the human deployment/security checklist.

Validation after these changes: TypeScript typecheck passes and 76/76 Vitest tests pass across 12 files, including new agent transaction-builder tests. Windows currently blocks specific Next-generated JavaScript filenames locally; `/agents`, the agent manifest, and x402 discovery returned HTTP 200 under local Turbopack, while clean production build validation is delegated to Linux CI.

## Release-candidate validation — 2026-10-01

GitHub Actions run `36948025019` passed on Linux for commit `356bb04`: frontend lint,
TypeScript, 76/76 Vitest tests, Next production build, Playwright E2E, Slither job,
Foundry contract tests/coverage path, and secret scanning. Gas snapshot drift and the two
known high dependency advisories remain visible review gates rather than hidden failures.

The agent-first reviewer recording is checked in at `demo/tentacle-reviewer-demo.mp4`
and can be regenerated with `scripts/record-reviewer-demo.mjs` against a public host.

Mainnet preflight (no broadcast): Ink USDC and USDC.e addresses both contain contract code
and report 6 decimals with the expected symbols. Constructor `eth_estimateGas` succeeds for
both Tentacle deployments at about 799,650 gas each. At the checked gas price this was about
0.00000080 ETH of L2 execution fee per deployment before OP-stack L1 data fees. The dedicated
deployment wallet held 0.00042 ETH. No mainnet transaction was signed or broadcast.

## MCP protocol smoke test — 2026-10-01

The remote `/api/mcp` endpoint completed a real MCP `initialize` handshake for protocol
`2025-06-18`, identifying itself as `tentacle-ink` v1.1.0 and advertising tool capabilities.
`tools/list` returned all four Tentacle tools. A real `tentacle_prepare_batch` call returned
unsigned Sepolia `batchNative` calldata/value for the verified contract, with the wallet kept as
the signing boundary.

After hardening log scans to 9,999-block chunks for public-RPC compatibility,
`tentacle_get_stats` returned 30 batches, 120 recipients, 1 unique sender, and 0.00024 ETH
distributed from the verified Ink Sepolia deployment. This remains testnet evidence only.
