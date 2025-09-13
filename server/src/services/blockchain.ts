import { ethers } from 'ethers';
import abi from '../constants/abi.json';

export interface DigitalID {
  digitalIdNumber: string;
  aadhaarHash: string;
  dateOfBirth: string;
  publicKey: string;
  status: number; // 0: Active, 1: Suspended, 2: Revoked
  issuedTime: string;
  owner: string;
  exists: boolean;
}

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    // Initialize provider (using Polygon Mumbai testnet as example)
    this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || 'https://rpc-mumbai.maticvigil.com');
    
    // Initialize wallet with private key
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, this.provider);
    
    // Initialize contract
    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS!,
      abi,
      this.wallet
    );
  }

  /**
   * Generate a digital ID for a user
   * @param aadhaarNumber - 12-digit Aadhaar number
   * @param dateOfBirth - Date of birth as timestamp
   * @returns Promise<DigitalID>
   */
  async generateDigitalID(aadhaarNumber: string, dateOfBirth: number): Promise<DigitalID> {
    try {
      console.log('Generating digital ID for Aadhaar:', aadhaarNumber);
      
      // Call the generateDigitalID function
      const tx = await this.contract.generateDigitalID(aadhaarNumber, dateOfBirth);
      console.log('Transaction hash:', tx.hash);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);
      
      // Get the digital ID number from the event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'DigitalIDGenerated';
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error('DigitalIDGenerated event not found in transaction receipt');
      }

      const parsedEvent = this.contract.interface.parseLog(event);
      const digitalIdNumber = parsedEvent?.args.digitalIdNumber.toString();
      
      console.log('Digital ID generated:', digitalIdNumber);
      
      // Get the complete digital ID details
      const digitalID = await this.getDigitalID(digitalIdNumber);
      
      return digitalID;
    } catch (error) {
      console.error('Error generating digital ID:', error);
      throw new Error(`Failed to generate digital ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get digital ID details by ID number
   * @param digitalIdNumber - Digital ID number
   * @returns Promise<DigitalID>
   */
  async getDigitalID(digitalIdNumber: string): Promise<DigitalID> {
    try {
      const digitalID = await this.contract.getDigitalID(digitalIdNumber);
      
      return {
        digitalIdNumber: digitalID.digitalIdNumber.toString(),
        aadhaarHash: digitalID.aadhaarHash,
        dateOfBirth: digitalID.dateOfBirth.toString(),
        publicKey: digitalID.publicKey,
        status: digitalID.status,
        issuedTime: digitalID.issuedTime.toString(),
        owner: digitalID.owner,
        exists: digitalID.exists
      };
    } catch (error) {
      console.error('Error getting digital ID:', error);
      throw new Error(`Failed to get digital ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get digital ID by user address
   * @param userAddress - User's wallet address
   * @returns Promise<DigitalID>
   */
  async getDigitalIDByUser(userAddress: string): Promise<DigitalID> {
    try {
      const digitalID = await this.contract.getDigitalIDByUser(userAddress);
      
      return {
        digitalIdNumber: digitalID.digitalIdNumber.toString(),
        aadhaarHash: digitalID.aadhaarHash,
        dateOfBirth: digitalID.dateOfBirth.toString(),
        publicKey: digitalID.publicKey,
        status: digitalID.status,
        issuedTime: digitalID.issuedTime.toString(),
        owner: digitalID.owner,
        exists: digitalID.exists
      };
    } catch (error) {
      console.error('Error getting digital ID by user:', error);
      throw new Error(`Failed to get digital ID by user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify if a digital ID is valid and active
   * @param digitalIdNumber - Digital ID number
   * @returns Promise<boolean>
   */
  async verifyDigitalID(digitalIdNumber: string): Promise<boolean> {
    try {
      return await this.contract.verifyDigitalID(digitalIdNumber);
    } catch (error) {
      console.error('Error verifying digital ID:', error);
      return false;
    }
  }

  /**
   * Check if user already has a digital ID
   * @param userAddress - User's wallet address
   * @returns Promise<{hasId: boolean, digitalIdNumber: string}>
   */
  async hasDigitalID(userAddress: string): Promise<{hasId: boolean, digitalIdNumber: string}> {
    try {
      const result = await this.contract.hasDigitalID(userAddress);
      return {
        hasId: result.hasId,
        digitalIdNumber: result.digitalIdNumber.toString()
      };
    } catch (error) {
      console.error('Error checking if user has digital ID:', error);
      return { hasId: false, digitalIdNumber: '0' };
    }
  }

  /**
   * Get total number of issued digital IDs
   * @returns Promise<number>
   */
  async getTotalDigitalIDs(): Promise<number> {
    try {
      const total = await this.contract.getTotalDigitalIDs();
      return parseInt(total.toString());
    } catch (error) {
      console.error('Error getting total digital IDs:', error);
      return 0;
    }
  }

  /**
   * Check if Aadhaar and DOB combination is already used
   * @param aadhaarNumber - Aadhaar number
   * @param dateOfBirth - Date of birth as timestamp
   * @param userAddress - User's wallet address
   * @returns Promise<boolean>
   */
  async isAadhaarDOBUsed(aadhaarNumber: string, dateOfBirth: number, userAddress: string): Promise<boolean> {
    try {
      return await this.contract.isAadhaarDOBUsed(aadhaarNumber, dateOfBirth, userAddress);
    } catch (error) {
      console.error('Error checking if Aadhaar DOB is used:', error);
      return false;
    }
  }

  /**
   * Get wallet address
   * @returns string
   */
  getWalletAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get wallet balance
   * @returns Promise<string>
   */
  async getWalletBalance(): Promise<string> {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return '0';
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
