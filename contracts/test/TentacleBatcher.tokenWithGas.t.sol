// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {BatchTest} from "./helpers/BatchTest.sol";
import {TentacleBatcher} from "../src/TentacleBatcher.sol";
import {RevertingReceiver} from "./mocks/RevertingReceiver.sol";
import {GasGuzzlerReceiver} from "./mocks/GasGuzzlerReceiver.sol";

/// @notice Token + uniform native gas top-up. Atomic across both assets.
contract TentacleBatcherTokenWithGasTest is BatchTest {
    uint256 internal constant GAS_EACH = 0.0002 ether;
    uint256 internal constant TOKEN_EACH = 100e6;

    function test_BatchTokenWithGas_FiveRecipients() public {
        (address[] memory r, uint256[] memory a) = _batch(5, TOKEN_EACH);
        uint256 nativeTotal = GAS_EACH * 5;
        uint256 tokenTotal = TOKEN_EACH * 5;

        vm.deal(sender, nativeTotal);
        vm.startPrank(sender);
        token.approve(address(batcher), tokenTotal);
        vm.expectEmit(true, true, false, true);
        emit TentacleBatcher.BatchExecuted(
            sender, address(token), tokenTotal, nativeTotal, 5, _payloadHash(r, a, GAS_EACH)
        );
        batcher.batchTokenWithGas{value: nativeTotal}(r, a, GAS_EACH);
        vm.stopPrank();

        for (uint256 i; i < 5; i++) {
            assertEq(token.balanceOf(r[i]), TOKEN_EACH);
            assertEq(r[i].balance, GAS_EACH);
        }
        assertEq(token.balanceOf(address(batcher)), 0);
        assertEq(address(batcher).balance, 0);
    }

    function test_RevertWhen_ValueTooLow_WithGas() public {
        (address[] memory r, uint256[] memory a) = _batch(2, TOKEN_EACH);
        vm.deal(sender, 1 ether);
        vm.startPrank(sender);
        token.approve(address(batcher), TOKEN_EACH * 2);
        vm.expectRevert(
            abi.encodeWithSelector(
                TentacleBatcher.IncorrectNativeValue.selector, GAS_EACH * 2, GAS_EACH * 2 - 1
            )
        );
        batcher.batchTokenWithGas{value: GAS_EACH * 2 - 1}(r, a, GAS_EACH);
        vm.stopPrank();
    }

    function test_RevertWhen_ValueTooHigh_WithGas() public {
        (address[] memory r, uint256[] memory a) = _batch(2, TOKEN_EACH);
        vm.deal(sender, 1 ether);
        vm.startPrank(sender);
        token.approve(address(batcher), TOKEN_EACH * 2);
        vm.expectRevert(
            abi.encodeWithSelector(
                TentacleBatcher.IncorrectNativeValue.selector, GAS_EACH * 2, GAS_EACH * 2 + 1
            )
        );
        batcher.batchTokenWithGas{value: GAS_EACH * 2 + 1}(r, a, GAS_EACH);
        vm.stopPrank();
    }

    function test_RevertWhen_ZeroGasTopUp() public {
        (address[] memory r, uint256[] memory a) = _batch(1, TOKEN_EACH);
        vm.expectRevert(TentacleBatcher.ZeroGasTopUp.selector);
        batcher.batchTokenWithGas{value: 0}(r, a, 0);
    }

    function test_RevertingEthRecipient_RevertsTokenTransfersToo() public {
        RevertingReceiver bad = new RevertingReceiver();
        address[] memory r = new address[](3);
        uint256[] memory a = new uint256[](3);
        r[0] = address(uint160(0x1000));
        r[1] = address(bad);
        r[2] = address(uint160(0x1002));
        a[0] = TOKEN_EACH;
        a[1] = TOKEN_EACH;
        a[2] = TOKEN_EACH;

        uint256 nativeTotal = GAS_EACH * 3;
        vm.deal(sender, nativeTotal);
        uint256 senderTokens = token.balanceOf(sender);

        vm.startPrank(sender);
        token.approve(address(batcher), TOKEN_EACH * 3);
        vm.expectRevert();
        batcher.batchTokenWithGas{value: nativeTotal}(r, a, GAS_EACH);
        vm.stopPrank();

        assertEq(token.balanceOf(r[0]), 0, "token transfer to A must revert too");
        assertEq(token.balanceOf(r[2]), 0);
        assertEq(token.balanceOf(sender), senderTokens);
        assertEq(r[0].balance, 0);
        assertEq(r[2].balance, 0);
    }

    function test_GasGuzzlerReceiver_BatchCompletes() public {
        GasGuzzlerReceiver greedy = new GasGuzzlerReceiver();
        address[] memory r = new address[](1);
        uint256[] memory a = new uint256[](1);
        r[0] = address(greedy);
        a[0] = TOKEN_EACH;

        vm.deal(sender, GAS_EACH);
        vm.startPrank(sender);
        token.approve(address(batcher), TOKEN_EACH);
        uint256 gasStart = gasleft();
        batcher.batchTokenWithGas{value: GAS_EACH}(r, a, GAS_EACH);
        uint256 gasUsed = gasStart - gasleft();
        vm.stopPrank();

        assertEq(token.balanceOf(address(greedy)), TOKEN_EACH);
        assertEq(address(greedy).balance, GAS_EACH);
        // Observed gas is recorded so TEST_PLAN.md can cite a real number.
        emit log_named_uint("gasGuzzler_batchTokenWithGas_gasUsed", gasUsed);
        assertGt(gasUsed, 100_000, "guzzler should consume meaningful gas");
    }
}
