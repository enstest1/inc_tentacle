// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {TentacleBatcher} from "../../src/TentacleBatcher.sol";
import {MockUSDC} from "../mocks/MockUSDC.sol";

/// @title BatchTest
/// @notice Shared actors and helpers for TentacleBatcher tests.
abstract contract BatchTest is Test {
    TentacleBatcher internal batcher;
    MockUSDC internal token;
    address internal sender;
    address internal victim;
    address internal attacker;

    uint256 internal constant VICTIM_START = 10_000e6;

    function setUp() public virtual {
        token = new MockUSDC();
        batcher = new TentacleBatcher(address(token));
        sender = makeAddr("sender");
        victim = makeAddr("victim");
        attacker = makeAddr("attacker");
        token.mint(sender, 1_000_000e6);
        token.mint(victim, VICTIM_START);
    }

    /// @dev Builds `count` unique EOAs each receiving `amount`.
    function _batch(uint256 count, uint256 amount)
        internal
        returns (address[] memory recipients, uint256[] memory amounts)
    {
        recipients = new address[](count);
        amounts = new uint256[](count);
        for (uint256 i; i < count; i++) {
            recipients[i] = address(uint160(0x1000 + i));
            amounts[i] = amount;
        }
    }

    function _payloadHash(address[] memory recipients, uint256[] memory amounts, uint256 gasTopUp)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(recipients, amounts, gasTopUp));
    }
}
