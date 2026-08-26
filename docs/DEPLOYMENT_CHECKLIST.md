# Deployment checklist

## Ink Sepolia

- [ ] `DEPLOYER_PRIVATE_KEY` in a gitignored local `.env` (never `NEXT_PUBLIC_*`)
- [ ] `forge script script/DeploySepolia.s.sol --rpc-url $INK_SEPOLIA_RPC --broadcast`
- [ ] `deployments/ink-sepolia.json` written by the script (runtime hash from chain)
- [ ] Source verified on Blockscout
- [ ] Frontend env pointed at the new addresses
- [ ] Manual tests 1–25 with hashes in `docs/TEST_PLAN.md`

## Ink mainnet — human only

```
MAINNET READY — NOT DEPLOYED
```

Do not run `DeployMainnet.s.sol` from CI or an agent session without an explicit human instruction **and** `MAINNET_DEPLOYMENT_CONFIRMED=YES_I_HAVE_READ_THE_CHECKLIST`.

Full gate list: spec §40.3 (compiler pin, tests, fuzz, invariants, coverage, Slither triage with human sign-off, Sepolia 25/25, token re-verification, TERMS legal review, independent security review).
