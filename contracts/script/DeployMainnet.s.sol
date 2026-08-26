// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console2} from "forge-std/Script.sol";
import {TentacleBatcher} from "../src/TentacleBatcher.sol";

/// @notice Ink mainnet deploy. Human confirmation env var is mandatory.
/// @dev Cursor must stop before running this. Never invoked by CI.
contract DeployMainnet is Script {
    function run() external {
        require(block.chainid == 57073, "WRONG_CHAIN: expected Ink mainnet");
        require(
            keccak256(bytes(vm.envString("MAINNET_DEPLOYMENT_CONFIRMED")))
                == keccak256(bytes("YES_I_HAVE_READ_THE_CHECKLIST")),
            "MAINNET_DEPLOYMENT_CONFIRMED not set - human approval required"
        );

        address token = vm.envAddress("MAINNET_TOKEN_ADDRESS");
        require(token != address(0), "TOKEN_NOT_SET");
        require(token.code.length > 0, "TOKEN_NOT_A_CONTRACT");

        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);
        TentacleBatcher batcher = new TentacleBatcher(token);
        vm.stopBroadcast();

        bytes memory runtime = address(batcher).code;
        bytes32 runtimeHash = keccak256(runtime);

        console2.log("tentacle:", address(batcher));
        console2.log("token:", token);
        console2.logBytes32(runtimeHash);
        console2.log("deployer:", deployer);
        console2.log("MAINNET READY - record runtimeBytecodeHash from chain, not artifact.");
    }
}
