# Reviewer demo — 60 to 90 seconds

Do not record this as a "mainnet traction" demo until the mainnet deployment and genuine external activity exist.

## Shot list
1. **0–10s — Home**: show “One send. Every wallet.” and the “For Agents” card. Say: “Tentacle is non-custodial batch settlement on Ink for humans and agent-controlled wallets.”
2. **10–25s — Agents**: open `/agents`. Show remote MCP URL, the transaction-builder API, and tools `tentacle_prepare_batch`, `tentacle_contract_info`, `tentacle_get_stats`, `tentacle_x402_info`.
3. **25–40s — Agent request**: ask the MCP tool to prepare a small multi-recipient batch. Show that the response is unsigned calldata and requires the caller wallet to sign.
4. **40–58s — Wallet flow**: connect a wallet, enter the same recipients, simulate, review, and send on the approved network.
5. **58–72s — Explorer proof**: open the transaction and verified contract on Ink's explorer. Point out `BatchExecuted`.
6. **72–90s — Stats**: open `/stats`. Show batches, recipients, unique senders, and distributed value derived from public RPC logs.

## Reviewer message
“Agents do not hand Tentacle keys. MCP/API prepare deterministic unsigned transactions; the wallet policy remains the authorization boundary. The immutable contract settles all recipients atomically and emits one verifiable event.”

## Current recorded testnet demo

A 57-second technical reviewer recording is checked in at `demo/tentacle-reviewer-demo.mp4`.
It shows the live agent onboarding page, machine-readable manifest, x402 discovery metadata,
Ink Sepolia stats, and the source-verified Sepolia contract. It is explicitly testnet evidence,
not a claim of mainnet usage or external traction.

Regenerate it against any deployed Tentacle URL with:

```bash
TENTACLE_DEMO_URL=https://your-host.example node scripts/record-reviewer-demo.mjs
```

After mainnet launch, replace or supplement this with the wallet-signing flow in the shot list above.
