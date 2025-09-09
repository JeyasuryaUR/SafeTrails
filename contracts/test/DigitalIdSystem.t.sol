// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {DigitalIDSystem} from "../src/DigitalIDSystem.sol";

contract DigitalIDSystemTest is Test {
    DigitalIDSystem public digitalIDSystem;
    
    address public owner = address(1);
    address public verifier = address(2);
    address public user = address(3);
    
    function setUp() public {
        vm.startPrank(owner);
        digitalIDSystem = new DigitalIDSystem();
        
        // Grant verifier role
        digitalIDSystem.grantRole(digitalIDSystem.KYC_VERIFIER_ROLE(), verifier);
        digitalIDSystem.grantRole(digitalIDSystem.ID_ISSUER_ROLE(), verifier);
        vm.stopPrank();
    }
    
    function testKYCSubmission() public {
        vm.prank(user);
        digitalIDSystem.submitKYC(
            "123456789012",
            "John Doe",
            1000000000, // timestamp
            "Male",
            "9876543210",
            "john@example.com"
        );
        
        // Check if KYC was submitted
        bytes32 aadhaarHash = keccak256(abi.encodePacked("123456789012", user));
        (DigitalIDSystem.KYCStatus status,,) = digitalIDSystem.getKYCStatus(aadhaarHash);
        assertEq(uint(status), uint(DigitalIDSystem.KYCStatus.Pending));
    }
    
    function testKYCVerificationAndIDIssuance() public {
        // Submit KYC
        vm.prank(user);
        digitalIDSystem.submitKYC(
            "123456789012",
            "John Doe",
            1000000000,
            "Male",
            "9876543210",
            "john@example.com"
        );
        
        bytes32 aadhaarHash = keccak256(abi.encodePacked("123456789012", user));
        
        // Verify KYC
        vm.prank(verifier);
        digitalIDSystem.verifyKYC(aadhaarHash, true, "");
        
        // Issue Digital ID
        vm.prank(verifier);
        digitalIDSystem.issueDigitalID(
            aadhaarHash,
            "public_key_string",
            user
        );
        
        // Check if digital ID was issued
        uint256 digitalId = digitalIDSystem.userToDigitalId(user);
        assertEq(digitalId, 1);
        
        // Verify digital ID
        assertTrue(digitalIDSystem.verifyDigitalID(digitalId));
    }
}