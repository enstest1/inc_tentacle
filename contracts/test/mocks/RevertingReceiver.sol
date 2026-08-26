// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

/// @title RevertingReceiver
/// @notice Rejects all native ETH — used to prove atomic rollback.
contract RevertingReceiver {
    error Nope();

    receive() external payable {
        revert Nope();
    }
}
