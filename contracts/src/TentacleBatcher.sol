// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title TentacleBatcher
/// @notice Non-custodial atomic batch payments for native ETH and one fixed ERC-20.
/// @dev The contract holds no balances and has no privileged roles. Tokens are
///      always pulled from `msg.sender` and pushed straight to the recipient in
///      the same call. There is deliberately no `from` parameter — see §11.1 of
///      the build specification.
contract TentacleBatcher is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Hard cap on recipients per batch. Bounds gas and calldata size.
    uint256 public constant MAX_RECIPIENTS = 50;

    /// @notice The single ERC-20 this deployment supports. Immutable by design.
    IERC20 public immutable TOKEN;

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error InvalidTokenAddress();
    error TokenNotAContract();
    error EmptyRecipients();
    error TooManyRecipients(uint256 provided, uint256 maximum);
    error ArrayLengthMismatch(uint256 recipientsLength, uint256 amountsLength);
    error ZeroRecipient(uint256 index);
    error SelfRecipient(uint256 index);
    error TokenRecipient(uint256 index);
    error ZeroAmount(uint256 index);
    error DuplicateRecipient(uint256 firstIndex, uint256 secondIndex, address recipient);
    error IncorrectNativeValue(uint256 expected, uint256 actual);
    error NativeTransferFailed(uint256 index, address recipient, uint256 amount);
    error InsufficientTokenBalance(uint256 required, uint256 available);
    error InsufficientAllowance(uint256 required, uint256 available);
    error ZeroGasTopUp();
    error DirectNativeTransferDisabled();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /// @param asset            address(0) for native ETH, otherwise TOKEN.
    /// @param totalAssetAmount Sum of `amounts`.
    /// @param totalNativeTopUp Total ETH sent as gas top-up (0 unless
    ///                         batchTokenWithGas).
    /// @param payloadHash      keccak256(abi.encode(recipients, amounts,
    ///                         nativePerRecipient)). Commits to the exact intent.
    event BatchExecuted(
        address indexed sender,
        address indexed asset,
        uint256 totalAssetAmount,
        uint256 totalNativeTopUp,
        uint256 recipientCount,
        bytes32 payloadHash
    );

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address token_) {
        if (token_ == address(0)) revert InvalidTokenAddress();
        if (token_.code.length == 0) revert TokenNotAContract();
        TOKEN = IERC20(token_);
    }

    /*//////////////////////////////////////////////////////////////
                            BATCH FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Send native ETH to many recipients atomically.
    /// @dev msg.value must equal the sum of `amounts` exactly. No refunds.
    function batchNative(address[] calldata recipients, uint256[] calldata amounts)
        external
        payable
        nonReentrant
    {
        uint256 total = _validateBatch(recipients, amounts);
        if (msg.value != total) revert IncorrectNativeValue(total, msg.value);

        uint256 len = recipients.length;
        for (uint256 i = 0; i < len; i++) {
            _sendNative(i, recipients[i], amounts[i]);
        }

        emit BatchExecuted(
            msg.sender,
            address(0),
            total,
            0,
            len,
            keccak256(abi.encode(recipients, amounts, uint256(0)))
        );
    }

    /// @notice Send TOKEN to many recipients atomically, pulled from msg.sender.
    function batchToken(address[] calldata recipients, uint256[] calldata amounts)
        external
        nonReentrant
    {
        uint256 total = _validateBatch(recipients, amounts);
        _requireTokenReady(total);

        uint256 len = recipients.length;
        for (uint256 i = 0; i < len; i++) {
            TOKEN.safeTransferFrom(msg.sender, recipients[i], amounts[i]);
        }

        emit BatchExecuted(
            msg.sender,
            address(TOKEN),
            total,
            0,
            len,
            keccak256(abi.encode(recipients, amounts, uint256(0)))
        );
    }

    /// @notice Send TOKEN plus a uniform native ETH gas top-up to many recipients.
    /// @dev msg.value must equal nativePerRecipient * recipients.length exactly.
    function batchTokenWithGas(
        address[] calldata recipients,
        uint256[] calldata amounts,
        uint256 nativePerRecipient
    ) external payable nonReentrant {
        if (nativePerRecipient == 0) revert ZeroGasTopUp();

        uint256 total = _validateBatch(recipients, amounts);
        uint256 len = recipients.length;
        uint256 expectedNative = nativePerRecipient * len; // checked arithmetic
        if (msg.value != expectedNative) revert IncorrectNativeValue(expectedNative, msg.value);

        _requireTokenReady(total);

        for (uint256 i = 0; i < len; i++) {
            TOKEN.safeTransferFrom(msg.sender, recipients[i], amounts[i]);
            _sendNative(i, recipients[i], nativePerRecipient);
        }

        emit BatchExecuted(
            msg.sender,
            address(TOKEN),
            total,
            expectedNative,
            len,
            keccak256(abi.encode(recipients, amounts, nativePerRecipient))
        );
    }

    /*//////////////////////////////////////////////////////////////
                                INTERNAL
    //////////////////////////////////////////////////////////////*/

    /// @dev Validates shape and contents of a batch and returns the checked sum.
    ///      O(n^2) duplicate detection is acceptable at MAX_RECIPIENTS = 50.
    ///      No `unchecked` blocks: clarity and safety over micro-optimisation.
    function _validateBatch(address[] calldata recipients, uint256[] calldata amounts)
        internal
        view
        returns (uint256 total)
    {
        uint256 len = recipients.length;
        if (len == 0) revert EmptyRecipients();
        if (len > MAX_RECIPIENTS) revert TooManyRecipients(len, MAX_RECIPIENTS);
        if (len != amounts.length) revert ArrayLengthMismatch(len, amounts.length);

        for (uint256 i = 0; i < len; i++) {
            address recipient = recipients[i];
            if (recipient == address(0)) revert ZeroRecipient(i);
            if (recipient == address(this)) revert SelfRecipient(i);
            if (recipient == address(TOKEN)) revert TokenRecipient(i);
            if (amounts[i] == 0) revert ZeroAmount(i);

            for (uint256 j = 0; j < i; j++) {
                if (recipients[j] == recipient) revert DuplicateRecipient(j, i, recipient);
            }

            total += amounts[i]; // checked
        }
    }

    /// @dev Reverts with a precise error rather than letting the token revert
    ///      opaquely. Costs two extra external view calls; worth it for UX.
    function _requireTokenReady(uint256 total) private view {
        uint256 balance = TOKEN.balanceOf(msg.sender);
        if (balance < total) revert InsufficientTokenBalance(total, balance);

        uint256 allowed = TOKEN.allowance(msg.sender, address(this));
        if (allowed < total) revert InsufficientAllowance(total, allowed);
    }

    /// @dev Forwards all remaining gas deliberately: capping the stipend would
    ///      break legitimate smart-contract wallets. A hostile recipient can
    ///      therefore grief the batch, which is already the all-or-nothing
    ///      failure mode. Documented in docs/THREAT_MODEL.md.
    function _sendNative(uint256 index, address recipient, uint256 amount) private {
        (bool ok,) = payable(recipient).call{value: amount}("");
        if (!ok) revert NativeTransferFailed(index, recipient, amount);
    }

    /*//////////////////////////////////////////////////////////////
                            NO DEPOSITS
    //////////////////////////////////////////////////////////////*/

    receive() external payable {
        revert DirectNativeTransferDisabled();
    }

    fallback() external payable {
        revert DirectNativeTransferDisabled();
    }
}
