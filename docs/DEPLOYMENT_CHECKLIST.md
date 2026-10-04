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
MAINNET BETA LIVE — USDC/ETH DEPLOYMENT VERIFIED
```

Do not run `DeployMainnet.s.sol` from CI or an agent session without an explicit human instruction **and** `MAINNET_DEPLOYMENT_CONFIRMED=YES_I_HAVE_READ_THE_CHECKLIST`.

Completed technical evidence: compiler pin, 48/48 Foundry tests, 512-run fuzz tests, three 256-run invariants with 128,000 calls each, 100% coverage for `TentacleBatcher.sol`, green Slither CI, token re-verification, Sepolia 30/30 test campaign, mainnet deployment receipt, runtime hash, and Blockscout verification. Remaining disclosure: no independent professional audit and TERMS still require legal review.
