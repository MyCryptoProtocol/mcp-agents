import { Connection, PublicKey, Transaction, sendAndConfirmTransaction, Keypair } from '@solana/web3.js';
import { Agent, AgentContext, AgentResponse } from '../agent-template';
import { parseInstruction } from '../nlp/instruction-parser';

// NFT-specific context interface
interface NFTAgentContext extends AgentContext {
  supportedMarketplaces: string[];
  defaultRoyaltyBps: number;
}

export class NFTMarketAgent extends Agent {
  private supportedMarketplaces: string[];
  private defaultRoyaltyBps: number;
  private wallet: Keypair | null = null;

  constructor(context: NFTAgentContext) {
    super(context);
    this.supportedMarketplaces = context.supportedMarketplaces || ['Magic Eden', 'Tensor'];
    this.defaultRoyaltyBps = context.defaultRoyaltyBps || 500; // 5% default royalty
  }

  getName(): string {
    return 'Solana NFT Market Agent';
  }

  getDescription(): string {
    return 'An agent specialized for NFT operations on Solana, including buying, selling, minting, and tracking collections.';
  }

  getCapabilities(): string[] {
    return [
      'NFT Listing',
      'NFT Buying',
      'Collection Tracking',
      'Rarity Checking',
      'Minting New NFTs',
      'Royalty Payments'
    ];
  }

  async processInstruction(instruction: string): Promise<AgentResponse> {
    try {
      const parsedInstruction = await parseInstruction(instruction);
      
      switch (parsedInstruction.action) {
        case 'listNFT':
          return this.handleListNFT(
            parsedInstruction.params.nftMint, 
            parsedInstruction.params.price,
            parsedInstruction.params.marketplace || this.supportedMarketplaces[0]
          );
          
        case 'buyNFT':
          return this.handleBuyNFT(
            parsedInstruction.params.nftMint,
            parsedInstruction.params.maxPrice
          );
          
        case 'checkCollection':
          return this.handleCollectionCheck(
            parsedInstruction.params.collectionAddress
          );
          
        case 'mintNFT':
          return this.handleMintNFT(
            parsedInstruction.params.metadataUri,
            parsedInstruction.params.name,
            parsedInstruction.params.symbol
          );
          
        default:
          return {
            success: false,
            message: `Unsupported action: ${parsedInstruction.action}`,
            error: {
              code: 400,
              message: 'The requested action is not supported by this agent'
            }
          };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to process instruction',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
  
  async executeTransaction(transaction: Transaction): Promise<string> {
    try {
      if (!this.wallet) {
        throw new Error('No wallet configured for transaction execution');
      }
      
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.wallet]
      );
      
      return signature;
    } catch (error) {
      throw new Error(`Transaction execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getState(): Promise<Record<string, any>> {
    return {
      agentId: this.agentId.toString(),
      supportedMarketplaces: this.supportedMarketplaces,
      defaultRoyaltyBps: this.defaultRoyaltyBps
    };
  }
  
  // Helper methods for specific NFT operations
  
  private async handleListNFT(
    nftMint: string, 
    price: string,
    marketplace: string
  ): Promise<AgentResponse> {
    // Implementation would integrate with NFT marketplace APIs
    return {
      success: true,
      message: `Listed NFT ${nftMint} for ${price} SOL on ${marketplace}`,
      data: {
        nftMint,
        price,
        marketplace,
        listingTime: new Date().toISOString(),
        fees: (parseFloat(price) * this.defaultRoyaltyBps / 10000).toFixed(4)
      }
    };
  }
  
  private async handleBuyNFT(
    nftMint: string,
    maxPrice: string
  ): Promise<AgentResponse> {
    // Implementation would integrate with NFT marketplace APIs
    return {
      success: true,
      message: `Purchased NFT ${nftMint} for ${maxPrice} SOL`,
      data: {
        nftMint,
        pricePaid: maxPrice,
        marketplace: this.supportedMarketplaces[0],
        purchaseTime: new Date().toISOString()
      }
    };
  }
  
  private async handleCollectionCheck(collectionAddress: string): Promise<AgentResponse> {
    // Implementation would fetch collection data from indexers or marketplaces
    return {
      success: true,
      message: `Information about collection ${collectionAddress}`,
      data: {
        collectionAddress,
        floorPrice: '10.5',
        totalVolume: '1250.75',
        items: 10000,
        owners: 3500,
        lastUpdated: new Date().toISOString()
      }
    };
  }
  
  private async handleMintNFT(
    metadataUri: string,
    name: string,
    symbol: string
  ): Promise<AgentResponse> {
    // Implementation would use Metaplex to mint an NFT
    return {
      success: true,
      message: `Minted new NFT: ${name} (${symbol})`,
      data: {
        name,
        symbol,
        metadataUri,
        mintAddress: 'Abc123...', // This would be the actual mint address
        mintTime: new Date().toISOString(),
        owner: this.agentId.toString()
      }
    };
  }
}
