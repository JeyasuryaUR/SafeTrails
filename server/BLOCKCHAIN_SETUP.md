# Blockchain Integration Setup Guide

## Required Environment Variables

Add these variables to your `.env` file:

```env
# Blockchain Configuration
BLOCKCHAIN_RPC_URL="https://rpc-mumbai.maticvigil.com"
CONTRACT_ADDRESS="0xYourContractAddressHere"
WALLET_PRIVATE_KEY="your-wallet-private-key-here"
WALLET_PUBLIC_KEY="your-wallet-public-key-here"
```

## Setup Instructions

### 1. Deploy Smart Contract
1. Deploy the `SimpleDigitalIDSystem.sol` contract to your preferred blockchain network
2. Copy the deployed contract address to `CONTRACT_ADDRESS` in your `.env` file

### 2. Create Wallet
1. Create a new wallet or use an existing one
2. Fund the wallet with enough tokens to cover transaction fees
3. Add the private key to `WALLET_PRIVATE_KEY` in your `.env` file
4. Add the public key to `WALLET_PUBLIC_KEY` in your `.env` file

### 3. Network Configuration
- **Mumbai Testnet**: `https://rpc-mumbai.maticvigil.com`
- **Polygon Mainnet**: `https://polygon-rpc.com`
- **Ethereum Goerli**: `https://goerli.infura.io/v3/YOUR_PROJECT_ID`
- **Ethereum Mainnet**: `https://mainnet.infura.io/v3/YOUR_PROJECT_ID`

## How It Works

### Digital ID Generation Process

1. **User Submits KYC**: User provides Aadhaar number and date of birth
2. **Blockchain Call**: System calls `generateDigitalID()` on the smart contract
3. **Transaction**: Transaction is sent using the configured wallet
4. **Event Parsing**: System listens for `DigitalIDGenerated` event
5. **Data Retrieval**: System calls `getDigitalID()` to get complete details
6. **Database Update**: Digital ID is stored in the user record

### Smart Contract Functions Used

- `generateDigitalID(aadhaarNumber, dateOfBirth)` - Creates new digital ID
- `getDigitalID(digitalIdNumber)` - Retrieves digital ID details
- `verifyDigitalID(digitalIdNumber)` - Verifies if ID is valid
- `hasDigitalID(userAddress)` - Checks if user has digital ID

## Error Handling

The system is designed to be resilient:
- If blockchain call fails, KYC submission still succeeds
- Digital ID can be generated later by admin
- All blockchain errors are logged for debugging

## Testing

### Test the Integration

1. **Check Wallet Balance**:
   ```bash
   curl -X GET http://localhost:3000/api/admin/blockchain/balance
   ```

2. **Test Digital ID Generation**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/kyc/submit \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
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

## Troubleshooting

### Common Issues

1. **Insufficient Funds**: Ensure wallet has enough tokens for gas fees
2. **Invalid Contract Address**: Verify contract is deployed and address is correct
3. **RPC Issues**: Check if RPC URL is accessible and correct
4. **Private Key Format**: Ensure private key starts with `0x`

### Debug Commands

```bash
# Check blockchain service status
curl -X GET http://localhost:3000/api/admin/blockchain/status

# Get total digital IDs on blockchain
curl -X GET http://localhost:3000/api/admin/blockchain/total-ids
```

## Security Notes

- Never commit private keys to version control
- Use environment variables for all sensitive data
- Consider using a hardware wallet for production
- Regularly rotate private keys
- Monitor wallet balance and transaction history
