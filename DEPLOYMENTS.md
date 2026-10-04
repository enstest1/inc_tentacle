# Deployments

A limited Ink mainnet beta deployment has been performed and independently verifiable evidence is recorded below.

## Ink Sepolia (chain 763373)

Pending a human-supplied `DEPLOYER_PRIVATE_KEY`. The script is `contracts/script/DeploySepolia.s.sol`. It deploys `MockUSDC` and `TentacleBatcher(MockUSDC)`, hashes **on-chain runtime bytecode**, and writes `deployments/ink-sepolia.json`.

OpenZeppelin submodule commit: recorded after `forge install`.

## Ink mainnet (chain 57073)

**MAINNET BETA LIVE â€” NATIVE ETH + USDC**

USDC-backed Tentacle: `0xe92f7634393ef5b6dd9fbc6d81b61e62a39e5164`
Deploy tx: `0xf495d94900b35da1edddf96d463fad963476059284d40b701ef231eceb904c6b`
Verified source: https://explorer.inkonchain.com/address/0xe92f7634393ef5b6dd9fbc6d81b61e62a39e5164?tab=contract
USDC.e instance: **not deployed**.

`contracts/script/DeployMainnet.s.sol` remains human-gated for any additional deployment.

### Token addresses (re-check before mainnet)

| Token | Address | Source (2026-08-25) |
|---|---|---|
| Native USDC | `0x2D270e6886d130D724215A266106e6832161EAEd` | Circle USDC contract-address page |
| USDC.e (bridged) | `0xF1815bd50389c46847f0Bda824eC8da914045D14` | Spec Â§5; still requires on-chain symbol/decimals/proxy verification (Â§5.2) |

Circle testnet USDC on Ink: `0xFabab97dCE620294D2B0b0e46C68964e326300Ac` â€” V1 Sepolia uses MockUSDC instead so payroll tests are not blocked on faucet USDC.
