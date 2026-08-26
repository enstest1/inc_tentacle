# Slither triage

Run:

```bash
slither . --config-file slither.config.json
```

from `contracts/` after `forge build`.

| ID | Detector | Location | Status | Justification |
|----|----------|----------|--------|---------------|
| 1 | arbitrary-send-eth | batchNative / _sendNative | ACCEPTED | Sending to caller-specified recipients is the contract's purpose. msg.value is bound to sum(amounts); no contract funds are at risk. |
| 2 | calls-loop | batchNative, batchToken, batchTokenWithGas | ACCEPTED | Transfers happen in a loop. That is the product. Capped by MAX_RECIPIENTS = 50. |
| 3 | reentrancy-events | BatchExecuted after external calls | ACCEPTED | Shared nonReentrant guard; event is informational. No state to corrupt after the calls. |
| 4 | timestamp / similar | n/a | PENDING | Fill remaining HIGH/MEDIUM after the first Slither run. Human sign-off required before testnet release. |

Do not add `// slither-disable-next-line` comments to make the report green.
