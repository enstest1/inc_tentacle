// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {TentacleBatcher} from "../src/TentacleBatcher.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

/// @notice Stateful fuzzer actor. Never force-feeds ETH onto the batcher.
contract Handler is Test {
    TentacleBatcher public immutable batcher;
    MockUSDC public immutable token;
    uint256 public expectedSupply;

    address[] public actors;

    constructor(TentacleBatcher batcher_, MockUSDC token_) {
        batcher = batcher_;
        token = token_;
        expectedSupply = token_.totalSupply();
        for (uint256 i; i < 5; i++) {
            address actor = address(uint160(0xA11CE0 + i));
            actors.push(actor);
            vm.deal(actor, 100 ether);
        }
    }

    /// @notice Mints to an actor so later token batches can succeed.
    function mintToActor(uint256 actorIdx, uint256 amount) external {
        actorIdx = bound(actorIdx, 0, actors.length - 1);
        amount = bound(amount, 0, 10_000e6);
        token.mint(actors[actorIdx], amount);
        expectedSupply += amount;
    }

    function batchNative(uint256 actorIdx, uint8 countRaw, uint96 amountRaw) external {
        actorIdx = bound(actorIdx, 0, actors.length - 1);
        uint256 count = bound(uint256(countRaw), 1, 50);
        uint256 amount = bound(uint256(amountRaw), 1, 0.05 ether);
        address actor = actors[actorIdx];

        address[] memory r = new address[](count);
        uint256[] memory a = new uint256[](count);
        for (uint256 i; i < count; i++) {
            r[i] = address(uint160(0xB100 + i));
            a[i] = amount;
        }
        uint256 total = amount * count;
        vm.deal(actor, total);
        vm.prank(actor);
        batcher.batchNative{value: total}(r, a);
    }

    function batchToken(uint256 actorIdx, uint8 countRaw, uint96 amountRaw) external {
        actorIdx = bound(actorIdx, 0, actors.length - 1);
        uint256 count = bound(uint256(countRaw), 1, 50);
        uint256 amount = bound(uint256(amountRaw), 1, 100e6);
        address actor = actors[actorIdx];

        address[] memory r = new address[](count);
        uint256[] memory a = new uint256[](count);
        for (uint256 i; i < count; i++) {
            r[i] = address(uint160(0xC100 + i));
            a[i] = amount;
        }
        uint256 total = amount * count;
        if (token.balanceOf(actor) < total) {
            token.mint(actor, total);
            expectedSupply += total;
        }
        vm.startPrank(actor);
        token.approve(address(batcher), total);
        batcher.batchToken(r, a);
        vm.stopPrank();
    }

    function batchTokenWithGas(uint256 actorIdx, uint8 countRaw, uint96 amountRaw, uint96 gasRaw)
        external
    {
        actorIdx = bound(actorIdx, 0, actors.length - 1);
        uint256 count = bound(uint256(countRaw), 1, 20);
        uint256 amount = bound(uint256(amountRaw), 1, 50e6);
        uint256 gasEach = bound(uint256(gasRaw), 1, 0.001 ether);
        address actor = actors[actorIdx];

        address[] memory r = new address[](count);
        uint256[] memory a = new uint256[](count);
        for (uint256 i; i < count; i++) {
            r[i] = address(uint160(0xD100 + i));
            a[i] = amount;
        }
        uint256 total = amount * count;
        uint256 nativeTotal = gasEach * count;
        if (token.balanceOf(actor) < total) {
            token.mint(actor, total);
            expectedSupply += total;
        }
        vm.deal(actor, nativeTotal);
        vm.startPrank(actor);
        token.approve(address(batcher), total);
        batcher.batchTokenWithGas{value: nativeTotal}(r, a, gasEach);
        vm.stopPrank();
    }

    /// @notice Invalid calls must revert and leave balances untouched.
    function invalidEmptyNative() external {
        address[] memory r = new address[](0);
        uint256[] memory a = new uint256[](0);
        vm.expectRevert(TentacleBatcher.EmptyRecipients.selector);
        batcher.batchNative(r, a);
    }
}
