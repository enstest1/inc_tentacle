# Threat model

| # | Threat | Mitigations |
|---|---|---|
| 1 | Compromised frontend swaps recipient addresses | Full-address review; checksummed display; simulation; deployment-hash integrity check; restrictive CSP; reproducible release process |
| 2 | Address poisoning / lookalike paste | 8-char prefix and suffix display; full-address review; `findLookalikePairs`; duplicate detection; never auto-fill from history |
| 3 | Malicious recipient contract reverts or re-enters | Atomicity; shared `nonReentrant`; pre-transaction simulation |
| 4 | Unlimited approval exposure | Exact allowance by default; revoke helper; contract has no `from` parameter |
| 5 | Wrong chain | Chain-id gate; post-switch re-read; per-chain deployment map; intent includes chainId |
| 6 | RPC manipulation or outage | Fallback transport; chain verification; bytecode verification; the wallet remains the signing authority |
| 7 | Giant batch gas exhaustion | `MAX_RECIPIENTS = 50`; explicit batch splitting with non-atomicity warning |
| 8 | Incorrect decimal calculation | Strings → `parseUnits` → bigint; runtime decimals verification; no floats anywhere |
| 9 | Admin / key compromise | There is no contract admin key |
| 10 | Custodial theft | Tentacle operates no custodial wallet |
| 11 | Widened interface turns allowances into a drainable position | No `from`/`payer`/`relayer` parameter, ever. Enforced by tests. |
| 12 | Token blacklist or pause breaks a whole payroll | Simulation catches it pre-signature; error names the recipient; documented limitation |
| 13 | Gas griefing by a hostile recipient | Accepted: failure mode is already all-or-nothing; unbounded forwarding preserved for smart-account compatibility; tested with `GasGuzzlerReceiver` |
| 14 | Under-priced transaction from ignoring L1 data fee | `estimateL1Fee` included in every preflight, plus 20% buffer |
| 15 | Stale simulation signed after an edit | Intent fingerprint; 60-second staleness; mandatory re-simulation immediately before signing |
| 16 | Replaced/sped-up transaction leaves UI desynced | `onReplaced` handling; UI follows the replacement hash |
| 17 | Sequencer downtime / reorg of the unsafe head | 2-confirmation wait; L2 finality wording; documented availability risk. Ink uses a single sequencer; downtime is an availability risk, not a custody risk. |
