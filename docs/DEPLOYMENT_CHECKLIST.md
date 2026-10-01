# Deployment checklist

## Ink Sepolia

- [x] `DEPLOYER_PRIVATE_KEY` in a gitignored local `.env` (never `NEXT_PUBLIC_*`)
- [x] Ink Sepolia deployment broadcast and receipt confirmed
- [x] `deployments/ink-sepolia.json` populated with address, runtime hash, deployment tx, and timestamp
- [x] Source verified on Blockscout
- [x] Frontend reads the checked-in Ink Sepolia deployment record
- [x] Automated 30/30 Sepolia interaction campaign with 30 onchain `BatchExecuted` logs (manual matrix remains separately reviewable)

## Ink mainnet — human only

```
MAINNET READY — NOT DEPLOYED
```

Do not run `DeployMainnet.s.sol` from CI or an agent session without an explicit human instruction **and** `MAINNET_DEPLOYMENT_CONFIRMED=YES_I_HAVE_READ_THE_CHECKLIST`.

Full gate list: spec §40.3 (compiler pin, tests, fuzz, invariants, coverage, Slither triage with human sign-off, Sepolia 25/25, token re-verification, TERMS legal review, independent security review).
