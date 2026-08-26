# Architecture

Tentacle is a single-page Next.js app that talks directly to a tiny, non-upgradeable `TentacleBatcher` on Ink. There is no backend and no database.

```
USER WALLET  --signs-->  TentacleBatcher  --pushes-->  recipients
```

## Chains

`src/lib/chains.ts` defines Ink (57073) and Ink Sepolia (763373). viem 2.23.2 does not export these chains, so they are defined locally. Fallback RPCs are the public Gelato and QuickNode endpoints from [Ink network docs](https://docs.inkonchain.com/general/network-information).

RPC choice (spec §16.2): **public Ink RPCs**. Paid provider keys are not used because `NEXT_PUBLIC_*` values are visible to every visitor.

## Typography

Tentacle is set entirely in **Commit Mono** v1.143 (SIL OFL 1.1), self-hosted via `next/font/local`.

- File: `public/fonts/CommitMono-Tentacle.woff2` (official variable cut `CommitMonoV143-VF.woff2` from [commitmono.com](https://commitmono.com/) 07 Customize → Download custom for design)
- License: `public/fonts/OFL.txt`
- Reproducible settings: [`docs/fonts/custom-settings.json`](../fonts/custom-settings.json)

The variable `.woff2` does not bake customizer choices. Alternates are applied with:

```
font-feature-settings: "ss03" 1, "ss04" 1, "ss05" 1, "cv10" 1, "ss01" 0, "liga" 0, "calt" 0;
```

Copied from the design-download feature string on the customizer with:

| Choice | Setting | Why |
|---|---|---|
| Weight | 400 | Recommended for dark `#0B0B0E` |
| Ligatures `ss01` | OFF | Must not rewrite `!=` in amounts |
| Zero `cv07` | DEF (slashed) | Hex / amounts |
| `l` `cv10` | ALT (serif tail) | Disambiguate `1` / `I` / `l` |
| `a` `cv01`, `g` `cv02` | DEF (double-storey) | EIP-55 case contrast |
| `ss03` `ss04` `ss05` | ON | Live customizer defaults |

Prose is capped at `60ch` / `line-height: 1.6`. No Google Fonts, no `next/font/google`. CSP `font-src 'self'`.

## Tokens

The contract takes one immutable ERC-20. The same bytecode is deployed twice on mainnet (USDC and USDC.e). The frontend allowlists those deployments and routes by selected asset. ETH uses `batchNative` on the primary deployment.

## Allowances

Token batches approve **exactly** the grand total of all planned batches, absolutely (not as an increment). Leftover allowance cannot be spent by a third party because there is no `from` parameter.

## OP Stack fees

`src/lib/gas.ts` adds L1 data fee via `estimateL1Fee` (GasPriceOracle `0x420…000F` fallback) plus a 20% buffer.

## Integrity

`runtimeBytecodeHash` is keccak256 of `eth_getCode` at deploy time, per deployment. Compiler artifacts are never hashed for this check.
