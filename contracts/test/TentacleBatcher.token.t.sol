// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {BatchTest} from "./helpers/BatchTest.sol";
import {TentacleBatcher} from "../src/TentacleBatcher.sol";
import {NoReturnToken} from "./mocks/NoReturnToken.sol";
import {FeeOnTransferToken} from "./mocks/FeeOnTransferToken.sol";
import {BlacklistToken} from "./mocks/BlacklistToken.sol";

/// @notice ERC-20 batch tests including non-standard and hostile tokens.
contract TentacleBatcherTokenTest is BatchTest {
    function test_BatchToken_TenEqual() public {
        (address[] memory r, uint256[] memory a) = _batch(10, 100e6);
        vm.startPrank(sender);
        token.approve(address(batcher), 1_000e6);
        vm.expectEmit(true, true, false, true);
        emit TentacleBatcher.BatchExecuted(
            sender, address(token), 1_000e6, 0, 10, _payloadHash(r, a, 0)
        );
        batcher.batchToken(r, a);
        vm.stopPrank();

        assertEq(token.balanceOf(sender), 1_000_000e6 - 1_000e6);
        for (uint256 i; i < 10; i++) {
            assertEq(token.balanceOf(r[i]), 100e6);
        }
        assertEq(token.balanceOf(address(batcher)), 0);
    }

    function test_BatchToken_ExactAllowanceSucceeds() public {
        (address[] memory r, uint256[] memory a) = _batch(1, 100e6);
        vm.startPrank(sender);
        token.approve(address(batcher), 100e6);
        batcher.batchToken(r, a);
        vm.stopPrank();
        assertEq(token.balanceOf(r[0]), 100e6);
    }

    function test_RevertWhen_AllowanceShortByOne() public {
        (address[] memory r, uint256[] memory a) = _batch(1, 100e6);
        vm.startPrank(sender);
        token.approve(address(batcher), 100e6 - 1);
        vm.expectRevert(
            abi.encodeWithSelector(TentacleBatcher.InsufficientAllowance.selector, 100e6, 100e6 - 1)
        );
        batcher.batchToken(r, a);
        vm.stopPrank();
    }

    function test_RevertWhen_BalanceShortByOne() public {
        address poor = makeAddr("poor");
        token.mint(poor, 99e6);
        (address[] memory r, uint256[] memory a) = _batch(1, 100e6);
        vm.startPrank(poor);
        token.approve(address(batcher), 100e6);
        vm.expectRevert(
            abi.encodeWithSelector(TentacleBatcher.InsufficientTokenBalance.selector, 100e6, 99e6)
        );
        batcher.batchToken(r, a);
        vm.stopPrank();
    }

    function test_RevertWhen_ZeroAmount_Token() public {
        (address[] memory r, uint256[] memory a) = _batch(1, 0);
        vm.expectRevert(abi.encodeWithSelector(TentacleBatcher.ZeroAmount.selector, 0));
        batcher.batchToken(r, a);
    }

    function test_RevertWhen_Duplicate_Token() public {
        address[] memory r = new address[](2);
        uint256[] memory a = new uint256[](2);
        r[0] = address(uint160(0x1000));
        r[1] = address(uint160(0x1000));
        a[0] = 1;
        a[1] = 1;
        vm.expectRevert(
            abi.encodeWithSelector(TentacleBatcher.DuplicateRecipient.selector, 0, 1, r[0])
        );
        batcher.batchToken(r, a);
    }

    function test_RevertWhen_TooMany_Token() public {
        (address[] memory r, uint256[] memory a) = _batch(51, 1);
        vm.expectRevert(abi.encodeWithSelector(TentacleBatcher.TooManyRecipients.selector, 51, 50));
        batcher.batchToken(r, a);
    }

    function test_RevertWhen_ArrayMismatch_Token() public {
        address[] memory r = new address[](2);
        uint256[] memory a = new uint256[](1);
        r[0] = address(uint160(0x1000));
        r[1] = address(uint160(0x1001));
        a[0] = 1;
        vm.expectRevert(abi.encodeWithSelector(TentacleBatcher.ArrayLengthMismatch.selector, 2, 1));
        batcher.batchToken(r, a);
    }

    function test_BatcherTokenBalanceUnchanged() public {
        assertEq(token.balanceOf(address(batcher)), 0);
        (address[] memory r, uint256[] memory a) = _batch(3, 10e6);
        vm.startPrank(sender);
        token.approve(address(batcher), 30e6);
        batcher.batchToken(r, a);
        vm.stopPrank();
        assertEq(token.balanceOf(address(batcher)), 0);
    }

    function test_NoReturnToken_SafeERC20Handles() public {
        NoReturnToken nrt = new NoReturnToken();
        TentacleBatcher nrtBatcher = new TentacleBatcher(address(nrt));
        nrt.mint(sender, 500e6);
        (address[] memory r, uint256[] memory a) = _batch(2, 100e6);
        vm.startPrank(sender);
        nrt.approve(address(nrtBatcher), 200e6);
        nrtBatcher.batchToken(r, a);
        vm.stopPrank();
        assertEq(nrt.balanceOf(r[0]), 100e6);
        assertEq(nrt.balanceOf(r[1]), 100e6);
        assertEq(nrt.balanceOf(address(nrtBatcher)), 0);
    }

    function test_FeeOnTransfer_RecipientsReceiveLess() public {
        FeeOnTransferToken fot = new FeeOnTransferToken();
        TentacleBatcher fotBatcher = new TentacleBatcher(address(fot));
        fot.mint(sender, 10_000e6);
        (address[] memory r, uint256[] memory a) = _batch(1, 100e6);
        vm.startPrank(sender);
        fot.approve(address(fotBatcher), 100e6);
        fotBatcher.batchToken(r, a);
        vm.stopPrank();
        // 1% fee: recipient gets 99e6. Documented as unsupported in KNOWN_LIMITATIONS.
        assertEq(fot.balanceOf(r[0]), 99e6);
        assertEq(fot.balanceOf(address(fotBatcher)), 0);
    }

    function test_BlacklistToken_OneBlockedRecipientRevertsWholeBatch() public {
        BlacklistToken blk = new BlacklistToken();
        TentacleBatcher blkBatcher = new TentacleBatcher(address(blk));
        blk.mint(sender, 1_000e6);

        address[] memory r = new address[](3);
        uint256[] memory a = new uint256[](3);
        r[0] = address(uint160(0x1000));
        r[1] = address(uint160(0x1001));
        r[2] = address(uint160(0x1002));
        a[0] = 100e6;
        a[1] = 100e6;
        a[2] = 100e6;
        blk.setBlocked(r[1], true);

        vm.startPrank(sender);
        blk.approve(address(blkBatcher), 300e6);
        vm.expectRevert("BLACKLISTED");
        blkBatcher.batchToken(r, a);
        vm.stopPrank();

        assertEq(blk.balanceOf(r[0]), 0, "A must be untouched");
        assertEq(blk.balanceOf(r[2]), 0, "C must be untouched");
        assertEq(blk.balanceOf(sender), 1_000e6);
    }

    /// @notice Protects §11.1: nobody can spend another user's allowance.
    function test_Invariant_NoThirdPartyCanSpendAnotherUsersAllowance() public {
        vm.prank(victim);
        token.approve(address(batcher), 1_000e6);

        address[] memory r = new address[](1);
        uint256[] memory a = new uint256[](1);
        r[0] = attacker;
        a[0] = 1_000e6;

        vm.prank(attacker);
        vm.expectRevert();
        batcher.batchToken(r, a);

        assertEq(token.balanceOf(victim), VICTIM_START, "victim funds moved");
        assertEq(token.balanceOf(attacker), 0);
    }
}
