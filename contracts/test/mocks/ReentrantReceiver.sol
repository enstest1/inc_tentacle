// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title ReentrantReceiver
/// @notice Attempts to re-enter batchNative from receive(). Inner call must fail.
contract ReentrantReceiver {
    address public immutable batcher;
    bool private entered;

    constructor(address batcher_) {
        batcher = batcher_;
    }

    receive() external payable {
        if (entered) return;
        entered = true;
        address[] memory r = new address[](1);
        uint256[] memory a = new uint256[](1);
        r[0] = address(this);
        a[0] = 1 wei;
        // Expected to fail because of the shared nonReentrant guard.
        (bool ok,) = batcher.call{value: 1 wei}(
            abi.encodeWithSignature("batchNative(address[],uint256[])", r, a)
        );
        require(!ok, "reentrancy unexpectedly succeeded");
    }
}

/// @title CrossFunctionReentrantReceiver
/// @notice Re-enters batchToken from inside batchNative. Shared guard must reject it.
contract CrossFunctionReentrantReceiver {
    address public immutable batcher;
    IERC20 public immutable token;
    bool private entered;

    constructor(address batcher_, address token_) {
        batcher = batcher_;
        token = IERC20(token_);
    }

    receive() external payable {
        if (entered) return;
        entered = true;
        address[] memory r = new address[](1);
        uint256[] memory a = new uint256[](1);
        r[0] = address(this);
        a[0] = 1;
        (bool ok,) = batcher.call(abi.encodeWithSignature("batchToken(address[],uint256[])", r, a));
        require(!ok, "cross-function reentrancy unexpectedly succeeded");
    }
}
