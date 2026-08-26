// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console2} from "forge-std/Script.sol";
import {TentacleBatcher} from "../src/TentacleBatcher.sol";
import {MockUSDC} from "../test/mocks/MockUSDC.sol";

/// @notice Ink Sepolia deploy: MockUSDC + TentacleBatcher. Writes deployments/ink-sepolia.json.
contract DeploySepolia is Script {
    function run() external {
        require(block.chainid == 763373, "WRONG_CHAIN: expected Ink Sepolia");

        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY"); // never committed, never NEXT_PUBLIC_
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);

        MockUSDC mock = new MockUSDC(); // testnet only, clearly named MOCK
        TentacleBatcher batcher = new TentacleBatcher(address(mock));

        vm.stopBroadcast();

        // Read the ACTUALLY DEPLOYED runtime code and hash it (spec §17.1).
        bytes memory runtime = address(batcher).code;
        bytes32 runtimeHash = keccak256(runtime);

        console2.log("tentacle:", address(batcher));
        console2.log("token:", address(mock));
        console2.logBytes32(runtimeHash);

        _writeDeployment(address(batcher), address(mock), runtimeHash, deployer);
    }

    function _writeDeployment(
        address tentacle,
        address token,
        bytes32 runtimeHash,
        address deployer
    ) internal {
        string memory deployments = "deployments";
        string memory row = "row";

        vm.serializeString(row, "label", "MOCK");
        vm.serializeAddress(row, "tentacle", tentacle);
        vm.serializeAddress(row, "token", token);
        vm.serializeString(row, "tokenSymbol", "MOCK");
        vm.serializeUint(row, "tokenDecimals", 6);
        vm.serializeBool(row, "tokenIsProxy", false);
        vm.serializeString(row, "tokenImplementation", "");
        vm.serializeBool(row, "tokenBlacklistable", false);
        vm.serializeBool(row, "tokenPausable", false);
        vm.serializeBool(row, "tokenSupportsPermit", false);
        vm.serializeBytes32(row, "runtimeBytecodeHash", runtimeHash);
        vm.serializeString(row, "deploymentTx", "");
        vm.serializeAddress(row, "deployer", deployer);
        vm.serializeString(row, "compiler", "0.8.36");
        vm.serializeString(row, "evmVersion", "cancun");
        vm.serializeBool(row, "optimizer", true);
        vm.serializeUint(row, "optimizerRuns", 200);
        vm.serializeBool(row, "viaIr", false);
        vm.serializeString(row, "gitCommit", vm.envOr("GIT_COMMIT", string("unknown")));
        string memory rowJson = vm.serializeString(row, "deployedAt", vm.toString(block.timestamp));

        string memory obj = "root";
        vm.serializeUint(obj, "chainId", 763373);
        string[] memory arr = new string[](1);
        arr[0] = rowJson;
        string memory finalJson = vm.serializeString(obj, "deployments", rowJson);
        // Foundry serializeString for nested objects; write the constructed JSON.
        finalJson = string.concat('{"chainId":763373,"deployments":[', rowJson, "]}");
        vm.writeJson(finalJson, "../deployments/ink-sepolia.json");
        deployments;
        arr;
        finalJson;
    }
}
