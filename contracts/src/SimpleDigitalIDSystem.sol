// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title SimpleDigitalIDSystem
 * @dev Direct Digital ID generation from Aadhaar number and date of birth
 * @notice This contract generates digital IDs directly from Aadhaar and DOB
 */
contract SimpleDigitalIDSystem is ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Counter for digital IDs
    Counters.Counter private _digitalIdCounter;
    
    // Enum for ID status
    enum IDStatus { Active, Suspended, Revoked }
    
    // Struct for Digital ID
    struct DigitalID {
        uint256 digitalIdNumber;
        bytes32 aadhaarHash;      // Hashed Aadhaar for privacy
        uint256 dateOfBirth;      // DOB as timestamp
        string publicKey;         // Generated public key
        IDStatus status;
        uint256 issuedTime;
        address owner;
        bool exists;
    }
    
    // Mappings
    mapping(address => uint256) public userToDigitalId;        // user address => digital ID number
    mapping(uint256 => DigitalID) public digitalIds;          // digital ID number => DigitalID
    mapping(bytes32 => bool) private usedAadhaarHashes;       // Prevent duplicate registrations
    mapping(bytes32 => uint256) public aadhaarToDigitalId;    // aadhaar hash => digital ID number
    
    // Events
    event DigitalIDGenerated(
        uint256 indexed digitalIdNumber, 
        address indexed owner, 
        bytes32 indexed aadhaarHash,
        uint256 dateOfBirth
    );
    event DigitalIDStatusUpdated(uint256 indexed digitalIdNumber, IDStatus newStatus);
    
    /**
     * @dev Generate digital ID directly from Aadhaar and DOB
     * @param _aadhaarNumber Aadhaar number (12 digits)
     * @param _dateOfBirth Date of birth as timestamp
     */
    function generateDigitalID(
        string memory _aadhaarNumber,
        uint256 _dateOfBirth
    ) external nonReentrant returns (uint256) {
        require(bytes(_aadhaarNumber).length == 12, "Invalid Aadhaar number length");
        require(_dateOfBirth < block.timestamp, "Invalid date of birth");
        require(_dateOfBirth > 0, "Date of birth cannot be zero");
        require(userToDigitalId[msg.sender] == 0, "User already has digital ID");
        
        // Create unique hash combining Aadhaar, DOB, and user address
        bytes32 aadhaarHash = keccak256(abi.encodePacked(_aadhaarNumber, _dateOfBirth, msg.sender));
        
        require(!usedAadhaarHashes[aadhaarHash], "Aadhaar with this DOB already registered");
        
        // Generate new digital ID
        _digitalIdCounter.increment();
        uint256 newDigitalId = _digitalIdCounter.current();
        
        // Generate public key based on Aadhaar and DOB
        string memory publicKey = generatePublicKey(_aadhaarNumber, _dateOfBirth, msg.sender);
        
        // Create digital ID record
        digitalIds[newDigitalId] = DigitalID({
            digitalIdNumber: newDigitalId,
            aadhaarHash: aadhaarHash,
            dateOfBirth: _dateOfBirth,
            publicKey: publicKey,
            status: IDStatus.Active,
            issuedTime: block.timestamp,
            owner: msg.sender,
            exists: true
        });
        
        // Update mappings
        userToDigitalId[msg.sender] = newDigitalId;
        usedAadhaarHashes[aadhaarHash] = true;
        aadhaarToDigitalId[aadhaarHash] = newDigitalId;
        
        emit DigitalIDGenerated(newDigitalId, msg.sender, aadhaarHash, _dateOfBirth);
        
        return newDigitalId;
    }
    
    /**
     * @dev Generate a deterministic public key from user data
     * @param _aadhaarNumber Aadhaar number
     * @param _dateOfBirth Date of birth
     * @param _owner Owner address
     * @return publicKey Generated public key string
     */
    function generatePublicKey(
        string memory _aadhaarNumber,
        uint256 _dateOfBirth,
        address _owner
    ) internal pure returns (string memory publicKey) {
        bytes32 keyHash = keccak256(abi.encodePacked(
            "DIGITAL_ID_KEY",
            _aadhaarNumber,
            _dateOfBirth,
            _owner
        ));
        
        // Convert hash to hex string (simplified public key)
        return string(abi.encodePacked("DID_", toHexString(keyHash)));
    }
    
    /**
     * @dev Convert bytes32 to hex string
     * @param _bytes32 Input bytes32
     * @return Hex string representation
     */
    function toHexString(bytes32 _bytes32) internal pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory result = new bytes(64);
        
        for (uint256 i = 0; i < 32; i++) {
            result[i * 2] = hexChars[uint8(_bytes32[i] >> 4)];
            result[i * 2 + 1] = hexChars[uint8(_bytes32[i] & 0x0f)];
        }
        
        return string(result);
    }
    
    /**
     * @dev Get digital ID information by ID number
     * @param _digitalIdNumber Digital ID number
     * @return digitalId Complete digital ID information
     */
    function getDigitalID(uint256 _digitalIdNumber) 
        external 
        view 
        returns (DigitalID memory digitalId) 
    {
        require(digitalIds[_digitalIdNumber].exists, "Digital ID does not exist");
        return digitalIds[_digitalIdNumber];
    }
    
    /**
     * @dev Get digital ID by user address
     * @param _user User address
     * @return digitalId Complete digital ID information
     */
    function getDigitalIDByUser(address _user) 
        external 
        view 
        returns (DigitalID memory digitalId) 
    {
        uint256 digitalIdNumber = userToDigitalId[_user];
        require(digitalIdNumber != 0, "User has no digital ID");
        return digitalIds[digitalIdNumber];
    }
    
    /**
     * @dev Verify if a digital ID is valid and active
     * @param _digitalIdNumber Digital ID number
     * @return isValid Whether the ID is valid and active
     */
    function verifyDigitalID(uint256 _digitalIdNumber) 
        external 
        view 
        returns (bool isValid) 
    {
        if (!digitalIds[_digitalIdNumber].exists) return false;
        return digitalIds[_digitalIdNumber].status == IDStatus.Active;
    }
    
    /**
     * @dev Verify digital ID by providing Aadhaar and DOB
     * @param _aadhaarNumber Aadhaar number
     * @param _dateOfBirth Date of birth
     * @param _owner Owner address
     * @return isValid Whether the provided data matches an active digital ID
     * @return digitalIdNumber The digital ID number if valid
     */
    function verifyWithAadhaarAndDOB(
        string memory _aadhaarNumber,
        uint256 _dateOfBirth,
        address _owner
    ) external view returns (bool isValid, uint256 digitalIdNumber) {
        bytes32 aadhaarHash = keccak256(abi.encodePacked(_aadhaarNumber, _dateOfBirth, _owner));
        
        if (!usedAadhaarHashes[aadhaarHash]) {
            return (false, 0);
        }
        
        uint256 digitalId = aadhaarToDigitalId[aadhaarHash];
        
        if (!digitalIds[digitalId].exists) {
            return (false, 0);
        }
        
        if (digitalIds[digitalId].status != IDStatus.Active) {
            return (false, 0);
        }
        
        return (true, digitalId);
    }
    
    /**
     * @dev Check if user already has a digital ID
     * @param _user User address
     * @return hasId Whether user has a digital ID
     * @return digitalIdNumber The digital ID number (0 if none)
     */
    function hasDigitalID(address _user) 
        external 
        view 
        returns (bool hasId, uint256 digitalIdNumber) 
    {
        uint256 digitalId = userToDigitalId[_user];
        return (digitalId != 0, digitalId);
    }
    
    /**
     * @dev Get total number of issued digital IDs
     * @return count Total count
     */
    function getTotalDigitalIDs() external view returns (uint256 count) {
        return _digitalIdCounter.current();
    }
    
    /**
     * @dev Get public key for a digital ID
     * @param _digitalIdNumber Digital ID number
     * @return publicKey The public key string
     */
    function getPublicKey(uint256 _digitalIdNumber) 
        external 
        view 
        returns (string memory publicKey) 
    {
        require(digitalIds[_digitalIdNumber].exists, "Digital ID does not exist");
        return digitalIds[_digitalIdNumber].publicKey;
    }
    
    /**
     * @dev Check if Aadhaar and DOB combination is already used
     * @param _aadhaarNumber Aadhaar number
     * @param _dateOfBirth Date of birth
     * @param _user User address
     * @return isUsed Whether this combination is already registered
     */
    function isAadhaarDOBUsed(
        string memory _aadhaarNumber,
        uint256 _dateOfBirth,
        address _user
    ) external view returns (bool isUsed) {
        bytes32 aadhaarHash = keccak256(abi.encodePacked(_aadhaarNumber, _dateOfBirth, _user));
        return usedAadhaarHashes[aadhaarHash];
    }
    
    /**
     * @dev Get digital ID creation timestamp
     * @param _digitalIdNumber Digital ID number
     * @return timestamp When the digital ID was created
     */
    function getDigitalIDTimestamp(uint256 _digitalIdNumber) 
        external 
        view 
        returns (uint256 timestamp) 
    {
        require(digitalIds[_digitalIdNumber].exists, "Digital ID does not exist");
        return digitalIds[_digitalIdNumber].issuedTime;
    }
}