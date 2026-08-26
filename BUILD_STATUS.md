# Tentacle Build Status

- [x] Phase 0  — Repository inspection
- [x] Phase 1  — Project scaffolding
- [x] Phase 2  — Smart contract
- [x] Phase 3  — Smart-contract tests
- [x] Phase 4  — Local deployment (Anvil)
- [x] Phase 5  — Frontend shell
- [x] Phase 6  — Wallet connection
- [x] Phase 7  — Recipient/amount engine
- [x] Phase 8  — SafeSend preflight
- [x] Phase 9  — Transaction execution
- [x] Phase 10 — Receipt system
- [ ] Phase 11 — Ink Sepolia deployment
- [x] Phase 12 — Security hardening
- [x] Phase 13 — Audit preparation
- [x] Phase 14 — Production readiness review

## Last Completed
Phase 14 — Production readiness review (2026-08-25)

Software is built and locally verified. Ink Sepolia is **not** deployed: `DEPLOYER_PRIVATE_KEY` was never supplied, and this agent must not invent one. Mainnet remains human-gated.

```
MAINNET READY — NOT DEPLOYED
H. MAINNET READINESS — NOT READY
```

### A. BUILD STATUS
V1 app, contract, tests, CI, and docs are in this repo. Users can connect an injected wallet on Ink / Ink Sepolia, build equal/custom batches, import CSV, split >50, simulate, approve exactly, and send. Send stays disabled until SafeSend mandatory checks pass (including deployment hash, which is empty until a real deploy).

### B. CONTRACT
- Source: `contracts/src/TentacleBatcher.sol` (pragma 0.8.36, evm cancun, classic ReentrancyGuard)
- Runtime size: 3,295 bytes
- Sepolia: not deployed
- Anvil: Tentacle `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` / MockUSDC `0x5FbDB2315678afecb367f032d93F642f64180aa3`

### C. TESTS
- Foundry: 48 passed (unit + 512-run fuzz + 256-run invariants, 128k calls)
- Vitest: 67 passed
- Playwright: 3 passed (axe on main page, CSV line errors, connect copy)
- Manual Sepolia 1–25: not run

### D. SECURITY
- Slither: expected HIGH/MEDIUM (arbitrary-send-eth, calls-loop, reentrancy-events) triaged as ACCEPTED in `docs/SLITHER_TRIAGE.md`. Human sign-off still required before testnet release.
- Threat model written and aligned with the code
- CSP + security headers in `next.config.js` (`unsafe-eval` required by Next.js)
- No backend, no custody, no `from` parameter

### E. FRONTEND
- `npm run build` succeeded
- Axe: no serious/critical on the main page

### F. COSTS
See `docs/TEST_PLAN.md`. 50-recipient `batchNative` is 2,231,814 L2 gas on Foundry. L1 data fee needs a real OP Stack node.

### G. KNOWN LIMITATIONS
See `docs/KNOWN_LIMITATIONS.md`.

### H. MAINNET READINESS
**NOT READY** — no Sepolia verification, no 25 manual hashes, no human TERMS review, no independent audit, token proxy/admin not read on-chain.

## Open Questions
1. Next.js 15.1.7 is flagged for CVE-2025-66478. Do not ignore; a human should pin a patched 15.x and re-run `npm run build` / e2e. Not bumped mid-build to avoid a last-minute App Router break.
2. `npm audit` reports high/critical issues (largely Next/wagmi/WalletConnect transitives). CI `npm audit --audit-level=high` will fail until those are triaged or Next is patched.
3. 50-recipient L1 data fee on Ink is not yet measured. If material after Sepolia test 4, consider `batchNativeEqual` as a **human decision** — do not add it in V1 without that number.
4. OpenZeppelin is installed with `forge install --no-git` (v5.2.0) because `--root contracts` submodules failed on this machine. CI reinstalls the same tag.

## Typography (Commit Mono)

- [x] `public/fonts/CommitMono-Tentacle.woff2` (v1.143 variable, 86,768 bytes)
- [x] `docs/fonts/custom-settings.json`
- [x] `public/fonts/OFL.txt`
- [x] `--font-features` from the customizer download string (not the spec placeholder)
- [x] No `next/font/google` / no Google Fonts origins
- [x] CSP `font-src 'self'`

## Remaining for a human
- Provide `DEPLOYER_PRIVATE_KEY` (gitignored) and run Phase 11 Sepolia deploy + Blockscout verify
- Sign off Slither triage and TERMS.md
- Re-verify USDC / USDC.e on-chain (§5.2) before any mainnet script
- Never run `DeployMainnet.s.sol` without `MAINNET_DEPLOYMENT_CONFIRMED=YES_I_HAVE_READ_THE_CHECKLIST`
