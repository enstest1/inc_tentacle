// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

/// @title GasGuzzlerReceiver
/// @notice Burns gas in receive() without reverting, exercising 63/64 forwarding.
contract GasGuzzlerReceiver {
    uint256 public sink;

    receive() external payable {
        // Burn gas without reverting, to exercise the 63/64 forwarding rule.
        for (uint256 i = 0; i < 100_000; i++) {
            sink = i;
        }
    }
}
