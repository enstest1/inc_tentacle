// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {StdInvariant, Test} from "forge-std/Test.sol";
import {TentacleBatcher} from "../src/TentacleBatcher.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";
import {Handler} from "./Handler.sol";

/// @notice Stateful invariants: Tentacle never accumulates ETH or tokens.
contract TentacleInvariant is StdInvariant, Test {
    TentacleBatcher batcher;
    MockUSDC token;
    Handler handler;

    function setUp() public {
        token = new MockUSDC();
        batcher = new TentacleBatcher(address(token));
        handler = new Handler(batcher, token);
        targetContract(address(handler));
    }

    /// The contract must never accumulate ETH.
    function invariant_NoNativeBalance() public view {
        assertEq(address(batcher).balance, 0);
    }

    /// The contract must never accumulate tokens.
    function invariant_NoTokenBalance() public view {
        assertEq(token.balanceOf(address(batcher)), 0);
    }

    /// Total token supply is conserved: nothing is minted or burned by Tentacle.
    function invariant_TokenSupplyConserved() public view {
        assertEq(token.totalSupply(), handler.expectedSupply());
    }
}
