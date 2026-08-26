# Known limitations

These are intentional.

* Ink only.
* ETH plus one ERC-20 per deployment (native USDC, USDC.e) — no arbitrary tokens.
* Maximum 50 recipients per batch; larger lists are split into multiple **non-atomic** transactions.
* Atomic-only within a batch; no best-effort mode.
* **Paying the same address twice in one batch is not supported** — duplicates are rejected on-chain and must be combined.
* A contract recipient that rejects ETH will fail the whole batch.
* **A blacklisted or paused token will fail the whole batch** (Circle's FiatToken is blacklistable and pausable).
* Fee-on-transfer and rebasing tokens are unsupported (neither configured token is one). Observed with `FeeOnTransferToken`: recipients receive 99% of `amounts[i]`.
* Exact approval may require a separate approval transaction.
* Forced ETH sent via `SELFDESTRUCT` or pre-funding is permanently locked in the contract; there is deliberately no admin sweep.
* No recurring payments, scheduling, private transfers, bridging, swaps, ENS resolution, account abstraction, or gas sponsorship.
* No WalletConnect in V1 — injected wallets only.
* **Safe / smart-contract wallets are not supported in V1**: the injected-wallet flow and the receipt model both assume an EOA sender.
* Simulation reflects current chain state and cannot guarantee future execution.
* L2 confirmation is not L1 finality.
