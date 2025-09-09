// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {DigitalIDSystem, DigitalIDFactory} from "../src/DigitalIDSystem.sol";

contract DeployDigitalID is Script {
    function setUp() public {}

    function run() public {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the main DigitalIDSystem contract
        DigitalIDSystem digitalIDSystem = new DigitalIDSystem();
        console.log("DigitalIDSystem deployed at:", address(digitalIDSystem));

        // Deploy the factory contract
        DigitalIDFactory factory = new DigitalIDFactory();
        console.log("DigitalIDFactory deployed at:", address(factory));

        vm.stopBroadcast();

        // Log deployment information
        console.log("=== Deployment Summary ===");
        console.log("Network: ", block.chainid);
        console.log("Deployer: ", vm.addr(deployerPrivateKey));
        console.log("DigitalIDSystem: ", address(digitalIDSystem));
        console.log("DigitalIDFactory: ", address(factory));
    }
}