# Test plan

## Contract

Run from `contracts/`:

```bash
forge test -vvv
FOUNDRY_PROFILE=deep forge test
forge coverage --report summary
forge snapshot --check
```

Coverage target: 100% function, 100% statement, >95% branch. `via_ir` is false so coverage matches the deploy build (spec §6.4).

Gas and calldata for the 50-recipient case are recorded after Phase 4 local Anvil runs (see below).

## Frontend unit

```bash
npm run test
```

Covers amounts, addresses (including 7702), recipients, csv, csvExport, batchPlan, intent invalidation, errors ABI mapping, gas buffer.

## E2E

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

Minimum: accessibility scan on the main page; CSV line-level errors; connect copy without a wallet.

## Manual Ink Sepolia (25 cases)

Not yet run. Record hashes here when Phase 11 executes:

| # | Test | Hash |
|---|---|---|
| 1–25 | pending human Sepolia deploy | |

## Phase 4 local measurements

Filled after Anvil batches:

| Function | Recipients | L2 gas (Anvil / Foundry) | Calldata bytes (formula) | Notes |
|---|---|---|---|---|
| batchNative | 1 | 61,172 | ~200 | unit test |
| batchNative | 10 | 402,915 | ~780 | unit test |
| batchNative | 50 | 2,231,814 | ~3,332 | unit test; L1 data fee not measurable on Anvil |
| batchToken | 10 | 352,874 | ~780 | unit test |
| batchTokenWithGas | 1 (GasGuzzler) | 15,254,586 | n/a | documents griefing cost |

Anvil local deploy (2026-08-25): Tentacle `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`, MockUSDC `0x5FbDB2315678afecb367f032d93F642f64180aa3`, runtime hash `0x0aac4a0e138277cbd57234bb6343e4557093f71ff263b3104eac0bf7b28843ea`.

If the 50-recipient equal-batch **Ink L1 fee** is material, open `BUILD_STATUS.md → Open Questions` for `batchNativeEqual` — do not add it unilaterally. Number not yet measured on Ink (needs Sepolia).
