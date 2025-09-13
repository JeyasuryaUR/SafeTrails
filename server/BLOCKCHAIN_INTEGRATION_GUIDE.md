# SafeTrails Blockchain Integration Guide

## 🚀 Overview

This guide explains how the blockchain digital ID generation is integrated into the SafeTrails KYC verification process. The system automatically generates unique digital IDs on the blockchain when users complete their KYC verification.

## 🔧 Technical Implementation

### 1. Smart Contract Integration

**Contract**: `SimpleDigitalIDSystem.sol`
**Network**: Configurable (Mumbai, Polygon, Ethereum, etc.)
**Functions Used**:
- `generateDigitalID(aadhaarNumber, dateOfBirth)` - Creates new digital ID
- `getDigitalID(digitalIdNumber)` - Retrieves digital ID details
- `verifyDigitalID(digitalIdNumber)` - Verifies ID validity

### 2. Blockchain Service

**File**: `src/services/blockchain.ts`
**Features**:
- Ethers.js integration
- Transaction management
- Event parsing
- Error handling
- Wallet management

### 3. KYC Integration

**Endpoint**: `POST /api/auth/kyc/submit`
**Process**:
1. User submits KYC details
2. System validates Aadhaar number
3. Blockchain service generates digital ID
4. Digital ID stored in user record
5. Safety score updated

## 📋 Setup Requirements

### Environment Variables

Add these to your `.env` file:

```env
# Blockchain Configuration
BLOCKCHAIN_RPC_URL="https://rpc-mumbai.maticvigil.com"
CONTRACT_ADDRESS="0xYourContractAddressHere"
WALLET_PRIVATE_KEY="your-wallet-private-key-here"
WALLET_PUBLIC_KEY="your-wallet-public-key-here"
```

### Prerequisites

1. **Deployed Smart Contract**: Contract must be deployed and address available
2. **Funded Wallet**: Wallet must have sufficient tokens for gas fees
3. **Network Access**: RPC URL must be accessible
4. **Private Key**: Secure private key for transaction signing

## 🔄 Digital ID Generation Flow

### Step 1: User KYC Submission

```bash
curl -X POST http://localhost:3000/api/auth/kyc/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "aadhaarNumber": "123456789012",
    "fullName": "John Doe",
    "dateOfBirth": "1990-01-01",
    "address": "123 Main St",
    "phoneNumber": "+1234567890",
    "email": "john@example.com",
    "documentImage": "doc.jpg",
    "selfieImage": "selfie.jpg"
  }'
```

### Step 2: Blockchain Processing

1. **Validation**: Aadhaar number format and uniqueness checked
2. **Timestamp Conversion**: Date of birth converted to Unix timestamp
3. **Smart Contract Call**: `generateDigitalID()` function called
4. **Transaction Mining**: Wait for transaction confirmation
5. **Event Parsing**: Extract digital ID number from `DigitalIDGenerated` event
6. **Data Retrieval**: Call `getDigitalID()` to get complete details

### Step 3: Database Update

```json
{
  "message": "KYC details submitted successfully",
  "user": {
    "id": "clw123abc456",
    "aadhaarNumber": "123456789012",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "digitalId": "DID_abc123def456...",
    "safetyScore": 75.0,
    "updatedAt": "2025-01-13T10:30:00.000Z"
  },
  "blockchain": {
    "digitalIdGenerated": true,
    "digitalIdNumber": "1",
    "publicKey": "DID_abc123def456..."
  }
}
```

## 🛠️ Admin Management

### Blockchain Status Check

```bash
curl -X GET http://localhost:3000/api/admin/blockchain/status \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response**:
```json
{
  "status": "Connected",
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "balance": "0.5 ETH",
  "totalDigitalIds": 15,
  "contractAddress": "0xYourContractAddressHere",
  "rpcUrl": "https://rpc-mumbai.maticvigil.com"
}
```

### Manual Digital ID Generation

```bash
curl -X POST http://localhost:3000/api/admin/blockchain/generate-digital-id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "userId": "clw123abc456",
    "aadhaarNumber": "123456789012",
    "dateOfBirth": "1990-01-01"
  }'
```

### Digital ID Verification

```bash
curl -X GET http://localhost:3000/api/admin/blockchain/verify/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## 🔍 Error Handling

### Common Error Scenarios

1. **Insufficient Gas**: Wallet doesn't have enough tokens
2. **Invalid Contract**: Wrong contract address or ABI
3. **Network Issues**: RPC endpoint unreachable
4. **Duplicate Aadhaar**: Aadhaar already registered
5. **Invalid Data**: Malformed Aadhaar or DOB

### Error Response Format

```json
{
  "message": "KYC details submitted successfully",
  "user": {
    "digitalId": null,
    "safetyScore": 0.0
  },
  "blockchain": {
    "digitalIdGenerated": false,
    "digitalIdNumber": null,
    "publicKey": null,
    "error": "Insufficient funds for gas"
  }
}
```

## 🧪 Testing

### Test Digital ID Generation

1. **Setup Test Environment**:
   ```bash
   # Add test environment variables
   export BLOCKCHAIN_RPC_URL="https://rpc-mumbai.maticvigil.com"
   export CONTRACT_ADDRESS="0xYourTestContractAddress"
   export WALLET_PRIVATE_KEY="your-test-private-key"
   ```

2. **Test KYC Submission**:
   ```bash
   # Register user
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}'
   
   # Login and get token
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   
   # Submit KYC with blockchain integration
   curl -X POST http://localhost:3000/api/auth/kyc/submit \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "aadhaarNumber": "123456789012",
       "fullName": "Test User",
       "dateOfBirth": "1990-01-01",
       "address": "Test Address",
       "phoneNumber": "+1234567890",
       "email": "test@example.com",
       "documentImage": "test.jpg",
       "selfieImage": "selfie.jpg"
     }'
   ```

### Verify Blockchain Integration

```bash
# Check blockchain status
curl -X GET http://localhost:3000/api/admin/blockchain/status

# Check total digital IDs
curl -X GET http://localhost:3000/api/admin/blockchain/total-ids

# Verify specific digital ID
curl -X GET http://localhost:3000/api/admin/blockchain/verify/1
```

## 🔒 Security Considerations

### Private Key Management

- **Never commit private keys to version control**
- **Use environment variables for all sensitive data**
- **Consider using hardware wallets for production**
- **Regularly rotate private keys**
- **Monitor wallet balance and transaction history**

### Smart Contract Security

- **Verify contract on blockchain explorer**
- **Use audited contracts when possible**
- **Test thoroughly on testnets before mainnet**
- **Monitor contract events and transactions**

## 📊 Monitoring

### Key Metrics to Monitor

1. **Transaction Success Rate**: Percentage of successful digital ID generations
2. **Gas Usage**: Average gas consumption per transaction
3. **Wallet Balance**: Ensure sufficient funds for transactions
4. **Error Rates**: Track and analyze blockchain errors
5. **Digital ID Count**: Total digital IDs generated

### Logging

All blockchain operations are logged with:
- Transaction hashes
- Digital ID numbers
- Error messages
- Timestamps
- User IDs

## 🚀 Production Deployment

### Checklist

- [ ] Smart contract deployed and verified
- [ ] Environment variables configured
- [ ] Wallet funded with sufficient tokens
- [ ] RPC endpoint tested and accessible
- [ ] Error handling tested
- [ ] Monitoring setup
- [ ] Backup wallet configured
- [ ] Security audit completed

### Recommended Networks

- **Development**: Mumbai Testnet
- **Staging**: Polygon Testnet
- **Production**: Polygon Mainnet or Ethereum Mainnet

## 📞 Support

For issues with blockchain integration:

1. Check server logs for detailed error messages
2. Verify environment variables are correct
3. Test RPC endpoint connectivity
4. Check wallet balance
5. Verify contract address and ABI

## 🎯 Next Steps

1. **Deploy Smart Contract**: Deploy to your preferred network
2. **Configure Environment**: Set up all required environment variables
3. **Test Integration**: Run through the testing procedures
4. **Monitor Operations**: Set up monitoring and alerting
5. **Scale as Needed**: Adjust gas limits and batch processing as required

---

**Your SafeTrails blockchain integration is now ready! 🎉**
