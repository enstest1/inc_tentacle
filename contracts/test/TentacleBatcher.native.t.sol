// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {BatchTest} from "./helpers/BatchTest.sol";
import {TentacleBatcher} from "../src/TentacleBatcher.sol";
import {RevertingReceiver} from "./mocks/RevertingReceiver.sol";
import {ReentrantReceiver, CrossFunctionReentrantReceiver} from "./mocks/ReentrantReceiver.sol";

/// @notice Native ETH batch success, failure, atomicity, and reentrancy cases.
contract TentacleBatcherNativeTest is BatchTest {
    function test_Constructor_RevertZeroToken() public {
        vm.expectRevert(TentacleBatcher.InvalidTokenAddress.selector);
        new TentacleBatcher(address(0));
    }

    function test_Constructor_RevertTokenNotAContract() public {
        vm.expectRevert(TentacleBatcher.TokenNotAContract.selector);
        new TentacleBatcher(makeAddr("eoa"));
    }

    function test_BatchNative_OneRecipient() public {
        (address[] memory r, uint256[] memory a) = _batch(1, 1 ether);
        vm.deal(sender, 1 ether);
        vm.prank(sender);
        batcher.batchNative{value: 1 ether}(r, a);
        assertEq(r[0].balance, 1 ether);
        assertEq(address(batcher).balance, 0);
    }

    function test_BatchNative_TenRecipients() public {
        (address[] memory r, uint256[] memory a) = _batch(10, 0.1 ether);
        vm.deal(sender, 1 ether);
        vm.prank(sender);
        batcher.batchNative{value: 1 ether}(r, a);
        for (uint256 i; i < 10; i++) {
            assertEq(r[i].balance, 0.1 ether);
        }
        assertEq(address(batcher).balance, 0);
    }

    function test_BatchNative_FiftyRecipients() public {
        (address[] memory r, uint256[] memory a) = _batch(50, 0.01 ether);
        uint256 total = 0.5 ether;
        vm.deal(sender, total);
        vm.prank(sender);
        batcher.batchNative{value: total}(r, a);
        for (uint256 i; i < 50; i++) {
            assertEq(r[i].balance, 0.01 ether);
        }
        assertEq(address(batcher).balance, 0);
    }

    function test_BatchNative_ExactDeltas() public {
        address[] memory r = new address[](3);
        uint256[] memory a = new uint256[](3);
        r[0] = makeAddr("a");
        a[0] = 0.1 ether;
        r[1] = makeAddr("b");
        a[1] = 0.2 ether;
        r[2] = makeAddr("c");
        a[2] = 0.35 ether;

        uint256 batcherBefore = address(batcher).balance;

        vm.deal(sender, 1 ether);
        vm.prank(sender);
        vm.expectEmit(true, true, false, true);
        emit TentacleBatcher.BatchExecuted(
            sender, address(0), 0.65 ether, 0, 3, _payloadHash(r, a, 0)
        );
        batcher.batchNative{value: 0.65 ether}(r, a);

        assertEq(r[0].balance, 0.1 ether);
        assertEq(r[1].balance, 0.2 ether);
        assertEq(r[2].balance, 0.35 ether);
        assertEq(address(batcher).balance, batcherBefore, "batcher retained ETH");
    }

    function test_RevertWhen_EmptyRecipients() public {
        address[] memory r = new address[](0);
        uint256[] memory a = new uint256[](0);
        vm.expectRevert(TentacleBatcher.EmptyRecipients.selector);
        batcher.batchNative{value: 0}(r, a);
    }

    function test_RevertWhen_TooManyRecipients() public {
        (address[] memory r, uint256[] memory a) = _batch(51, 1 wei);
        vm.expectRevert(abi.encodeWithSelector(TentacleBatcher.TooManyRecipients.selector, 51, 50));
        batcher.batchNative(r, a);
    }

    function test_RevertWhen_ArrayLengthMismatch() public {
        address[] memory r = new address[](3);
        uint256[] memory a = new uint256[](2);
        r[0] = address(uint160(0x1000));
        r[1] = address(uint160(0x1001));
        r[2] = address(uint160(0x1002));
        a[0] = 1;
        a[1] = 1;
        vm.expectRevert(abi.encodeWithSelector(TentacleBatcher.ArrayLengthMismatch.selector, 3, 2));
        batcher.batchNative(r, a);
    }

    function test_RevertWhen_ZeroRecipient() public {
        address[] memory r = new address[](1);
        uint256[] memory a = new uint256[](1);
        a[0] = 1 ether;
        vm.expectRevert(abi.encodeWithSelector(TentacleBatcher.ZeroRecipient.selector, 0));
        batcher.batchNative{value: 1 ether}(r, a);
    }

    function test_RevertWhen_SelfRecipient() public {
        address[] memory r = new address[](1);
        uint256[] memory a = new uint256[](1);
        r[0] = address(batcher);
        a[0] = 1 ether;
        vm.expectRevert(abi.encodeWithSelector(TentacleBatcher.SelfRecipient.selector, 0));
        batcher.batchNative{value: 1 ether}(r, a);
    }

    function test_RevertWhen_TokenRecipient() public {
        address[] memory r = new address[](1);
        uint256[] memory a = new uint256[](1);
        r[0] = address(token);
        a[0] = 1 ether;
        vm.expectRevert(abi.encodeWithSelector(TentacleBatcher.TokenRecipient.selector, 0));
        batcher.batchNative{value: 1 ether}(r, a);
    }

    function test_RevertWhen_ZeroAmount() public {
        (address[] memory r, uint256[] memory a) = _batch(1, 0);
        vm.expectRevert(abi.encodeWithSelector(TentacleBatcher.ZeroAmount.selector, 0));
        batcher.batchNative(r, a);
    }

    function test_RevertWhen_DuplicateRecipient() public {
        address[] memory r = new address[](2);
        uint256[] memory a = new uint256[](2);
        r[0] = address(uint160(0x1000));
        r[1] = address(uint160(0x1000));
        a[0] = 1 ether;
        a[1] = 1 ether;
        vm.expectRevert(
            abi.encodeWithSelector(TentacleBatcher.DuplicateRecipient.selector, 0, 1, r[0])
        );
        batcher.batchNative{value: 2 ether}(r, a);
    }

    function test_RevertWhen_ValueTooLow() public {
        (address[] memory r, uint256[] memory a) = _batch(1, 1 ether);
        vm.deal(sender, 2 ether);
        vm.prank(sender);
        vm.expectRevert(
            abi.encodeWithSelector(
                TentacleBatcher.IncorrectNativeValue.selector, 1 ether, 0.99 ether
            )
        );
        batcher.batchNative{value: 0.99 ether}(r, a);
    }

    function test_RevertWhen_ValueTooHigh() public {
        (address[] memory r, uint256[] memory a) = _batch(1, 1 ether);
        vm.deal(sender, 2 ether);
        vm.prank(sender);
        vm.expectRevert(
            abi.encodeWithSelector(
                TentacleBatcher.IncorrectNativeValue.selector, 1 ether, 1.01 ether
            )
        );
        batcher.batchNative{value: 1.01 ether}(r, a);
    }

    function test_RevertWhen_DirectSend() public {
        vm.deal(sender, 1 ether);
        vm.prank(sender);
        (bool ok, bytes memory data) = address(batcher).call{value: 1 ether}("");
        assertFalse(ok);
        assertEq(
            data, abi.encodeWithSelector(TentacleBatcher.DirectNativeTransferDisabled.selector)
        );
    }

    function test_RevertWhen_UnknownSelector() public {
        vm.deal(sender, 1 ether);
        vm.prank(sender);
        (bool ok, bytes memory data) = address(batcher).call{value: 1 ether}(hex"deadbeef");
        assertFalse(ok);
        assertEq(
            data, abi.encodeWithSelector(TentacleBatcher.DirectNativeTransferDisabled.selector)
        );
    }

    function test_BatchNative_RevertingRecipient_RevertsEverything() public {
        RevertingReceiver bad = new RevertingReceiver();
        address[] memory r = new address[](4);
        uint256[] memory a = new uint256[](4);
        r[0] = makeAddr("a");
        r[1] = makeAddr("b");
        r[2] = address(bad);
        r[3] = makeAddr("d");
        for (uint256 i; i < 4; i++) {
            a[i] = 0.1 ether;
        }

        vm.deal(sender, 1 ether);
        vm.prank(sender);
        vm.expectRevert();
        batcher.batchNative{value: 0.4 ether}(r, a);

        assertEq(r[0].balance, 0, "A must be untouched");
        assertEq(r[1].balance, 0, "B must be untouched");
        assertEq(r[3].balance, 0, "D must be untouched");
        assertEq(sender.balance, 1 ether, "sender must be untouched");
    }

    function test_Reentrancy_SameFunction_OuterCompletes() public {
        // Mock swallows the failed inner call, so the outer transfer succeeds.
        ReentrantReceiver bad = new ReentrantReceiver(address(batcher));
        address[] memory r = new address[](1);
        uint256[] memory a = new uint256[](1);
        r[0] = address(bad);
        a[0] = 1 ether;

        uint256 senderBefore = 2 ether;
        vm.deal(sender, senderBefore);
        vm.prank(sender);
        batcher.batchNative{value: 1 ether}(r, a);

        assertEq(address(bad).balance, 1 ether, "outer transfer completed");
        assertEq(address(batcher).balance, 0, "no residual ETH");
        assertEq(sender.balance, 1 ether);
    }

    function test_Reentrancy_CrossFunction_InnerFails() public {
        CrossFunctionReentrantReceiver bad =
            new CrossFunctionReentrantReceiver(address(batcher), address(token));
        address[] memory r = new address[](1);
        uint256[] memory a = new uint256[](1);
        r[0] = address(bad);
        a[0] = 1 ether;

        vm.deal(sender, 1 ether);
        vm.prank(sender);
        batcher.batchNative{value: 1 ether}(r, a);

        assertEq(address(bad).balance, 1 ether);
        assertEq(token.balanceOf(address(bad)), 0, "no stolen tokens");
        assertEq(address(batcher).balance, 0);
        assertEq(token.balanceOf(address(batcher)), 0);
    }

    function test_ForcedBalanceDoesNotCorruptAccounting() public {
        vm.deal(address(batcher), 5 ether);
        (address[] memory r, uint256[] memory a) = _batch(3, 0.1 ether);

        vm.deal(sender, 1 ether);
        vm.prank(sender);
        batcher.batchNative{value: 0.3 ether}(r, a);

        assertEq(address(batcher).balance, 5 ether, "forced ETH must be untouched");
        for (uint256 i; i < 3; i++) {
            assertEq(r[i].balance, 0.1 ether);
        }
    }
}
