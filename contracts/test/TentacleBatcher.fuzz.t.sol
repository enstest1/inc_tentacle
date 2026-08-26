// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {BatchTest} from "./helpers/BatchTest.sol";
import {TentacleBatcher} from "../src/TentacleBatcher.sol";

/// @notice Fuzz coverage for sum invariants, duplicates, and mismatches.
contract TentacleBatcherFuzzTest is BatchTest {
    function testFuzz_BatchNative_SumInvariant(uint8 rawCount, uint96 rawAmount) public {
        uint256 count = bound(uint256(rawCount), 1, 50);
        uint256 amount = bound(uint256(rawAmount), 1, 1 ether);

        address[] memory r = new address[](count);
        uint256[] memory a = new uint256[](count);
        for (uint256 i; i < count; i++) {
            r[i] = address(uint160(0x1000 + i)); // guaranteed unique, non-zero
            a[i] = amount;
        }
        uint256 total = amount * count;

        vm.deal(sender, total);
        vm.prank(sender);
        batcher.batchNative{value: total}(r, a);

        uint256 received;
        for (uint256 i; i < count; i++) {
            received += r[i].balance;
        }
        assertEq(received, total);
        assertEq(address(batcher).balance, 0);
    }

    function testFuzz_DuplicateAlwaysRejected(uint8 rawCount, uint8 dupIndex) public {
        uint256 count = bound(uint256(rawCount), 2, 50);
        uint256 dup = bound(uint256(dupIndex), 1, count - 1);

        address[] memory r = new address[](count);
        uint256[] memory a = new uint256[](count);
        for (uint256 i; i < count; i++) {
            r[i] = address(uint160(0x2000 + i));
            a[i] = 1 wei;
        }
        r[dup] = r[0];

        vm.deal(sender, count);
        vm.prank(sender);
        vm.expectRevert(
            abi.encodeWithSelector(TentacleBatcher.DuplicateRecipient.selector, 0, dup, r[0])
        );
        batcher.batchNative{value: count}(r, a);
    }

    function testFuzz_ArrayLengthMismatchAlwaysRejected(uint8 recRaw, uint8 amtRaw) public {
        uint256 rec = bound(uint256(recRaw), 1, 50);
        uint256 amt = bound(uint256(amtRaw), 1, 50);
        vm.assume(rec != amt);

        address[] memory r = new address[](rec);
        uint256[] memory a = new uint256[](amt);
        for (uint256 i; i < rec; i++) {
            r[i] = address(uint160(0x3000 + i));
        }
        for (uint256 i; i < amt; i++) {
            a[i] = 1 wei;
        }

        vm.expectRevert(
            abi.encodeWithSelector(TentacleBatcher.ArrayLengthMismatch.selector, rec, amt)
        );
        batcher.batchNative(r, a);
    }

    function testFuzz_TokenSenderDecreaseEqualsRecipientIncrease(uint8 rawCount, uint96 rawAmount)
        public
    {
        uint256 count = bound(uint256(rawCount), 1, 50);
        uint256 amount = bound(uint256(rawAmount), 1, 1_000e6);

        address[] memory r = new address[](count);
        uint256[] memory a = new uint256[](count);
        for (uint256 i; i < count; i++) {
            r[i] = address(uint160(0x4000 + i));
            a[i] = amount;
        }
        uint256 total = amount * count;
        if (token.balanceOf(sender) < total) {
            token.mint(sender, total);
        }

        uint256 senderBefore = token.balanceOf(sender);
        vm.startPrank(sender);
        token.approve(address(batcher), total);
        batcher.batchToken(r, a);
        vm.stopPrank();

        uint256 received;
        for (uint256 i; i < count; i++) {
            received += token.balanceOf(r[i]);
        }
        assertEq(received, total);
        assertEq(senderBefore - token.balanceOf(sender), total);
        assertEq(token.balanceOf(address(batcher)), 0);
    }
}
