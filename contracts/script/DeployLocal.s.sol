// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console2} from "forge-std/Script.sol";
import {TentacleBatcher} from "../src/TentacleBatcher.sol";
import {MockUSDC} from "../test/mocks/MockUSDC.sol";

/// @notice Anvil-only helper for Phase 4. Not a production deployment path.
contract DeployLocal is Script {
    function run() external {
        uint256 pk = vm.envOr(
            "DEPLOYER_PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );

        vm.startBroadcast(pk);
        MockUSDC mock = new MockUSDC();
        TentacleBatcher batcher = new TentacleBatcher(address(mock));
        mock.mint(vm.addr(pk), 1_000_000e6);
        vm.stopBroadcast();

        bytes32 runtimeHash = keccak256(address(batcher).code);
        console2.log("tentacle:", address(batcher));
        console2.log("token:", address(mock));
        console2.logBytes32(runtimeHash);
    }
}
