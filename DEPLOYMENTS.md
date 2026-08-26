# Deployments

No production deployment has been performed from this repository.

## Ink Sepolia (chain 763373)

Pending a human-supplied `DEPLOYER_PRIVATE_KEY`. The script is `contracts/script/DeploySepolia.s.sol`. It deploys `MockUSDC` and `TentacleBatcher(MockUSDC)`, hashes **on-chain runtime bytecode**, and writes `deployments/ink-sepolia.json`.

OpenZeppelin submodule commit: recorded after `forge install`.

## Ink mainnet (chain 57073)

**MAINNET READY — NOT DEPLOYED**

`contracts/script/DeployMainnet.s.sol` refuses to run unless `MAINNET_DEPLOYMENT_CONFIRMED=YES_I_HAVE_READ_THE_CHECKLIST`. Cursor must not run it.

### Token addresses (re-check before mainnet)

| Token | Address | Source (2026-08-25) |
|---|---|---|
| Native USDC | `0x2D270e6886d130D724215A266106e6832161EAEd` | Circle USDC contract-address page |
| USDC.e (bridged) | `0xF1815bd50389c46847f0Bda824eC8da914045D14` | Spec §5; still requires on-chain symbol/decimals/proxy verification (§5.2) |

Circle testnet USDC on Ink: `0xFabab97dCE620294D2B0b0e46C68964e326300Ac` — V1 Sepolia uses MockUSDC instead so payroll tests are not blocked on faucet USDC.
