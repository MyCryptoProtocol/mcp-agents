import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { NFTMarketAgent } from '../src/agents/nft-market-agent';

// Mock the parseInstruction function
jest.mock('../src/nlp/instruction-parser', () => ({
  parseInstruction: jest.fn().mockImplementation((instruction: string) => {
    if (instruction.includes('list')) {
      return Promise.resolve({
        action: 'listNFT',
        params: {
          nftMint: 'NFT123',
          price: '10',
          marketplace: 'Magic Eden'
        },
        confidence: 0.9
      });
    } else if (instruction.includes('buy')) {
      return Promise.resolve({
        action: 'buyNFT',
        params: {
          nftMint: 'NFT123',
          maxPrice: '12.5'
        },
        confidence: 0.85
      });
    } else if (instruction.includes('collection')) {
      return Promise.resolve({
        action: 'checkCollection',
        params: {
          collectionAddress: 'Collection123'
        },
        confidence: 0.95
      });
    } else if (instruction.includes('mint')) {
      return Promise.resolve({
        action: 'mintNFT',
        params: {
          metadataUri: 'https://arweave.net/metadata.json',
          name: 'Test NFT',
          symbol: 'TEST'
        },
        confidence: 0.9
      });
    } else {
      return Promise.resolve({
        action: 'unknown',
        params: {},
        confidence: 0.3
      });
    }
  })
}));

describe('NFTMarketAgent', () => {
  let agent: NFTMarketAgent;
  const mockConnection = {
    // Mock the necessary Connection methods
  } as unknown as Connection;
  
  beforeEach(() => {
    // Create a new agent instance before each test
    agent = new NFTMarketAgent({
      agentId: new PublicKey(Keypair.generate().publicKey),
      connection: mockConnection,
      supportedMarketplaces: ['Magic Eden', 'Tensor'],
      defaultRoyaltyBps: 500
    });
  });
  
  describe('Agent information', () => {
    it('should return the correct agent name', () => {
      expect(agent.getName()).toBe('Solana NFT Market Agent');
    });
    
    it('should return capabilities', () => {
      const capabilities = agent.getCapabilities();
      expect(capabilities).toContain('NFT Listing');
      expect(capabilities).toContain('NFT Buying');
      expect(capabilities.length).toBe(6);
    });
  });
  
  describe('Instruction processing', () => {
    it('should process NFT listing instructions correctly', async () => {
      const result = await agent.processInstruction('List my NFT NFT123 for 10 SOL on Magic Eden');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Listed NFT');
      expect(result.data).toHaveProperty('nftMint', 'NFT123');
      expect(result.data).toHaveProperty('price', '10');
      expect(result.data).toHaveProperty('marketplace', 'Magic Eden');
    });
    
    it('should process NFT buying instructions correctly', async () => {
      const result = await agent.processInstruction('Buy NFT NFT123 for up to 12.5 SOL');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Purchased NFT');
      expect(result.data).toHaveProperty('nftMint', 'NFT123');
      expect(result.data).toHaveProperty('pricePaid', '12.5');
    });
    
    it('should process collection check instructions correctly', async () => {
      const result = await agent.processInstruction('Check collection Collection123 floor price');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Information about collection');
      expect(result.data).toHaveProperty('collectionAddress', 'Collection123');
      expect(result.data).toHaveProperty('floorPrice');
      expect(result.data).toHaveProperty('totalVolume');
    });
    
    it('should process NFT minting instructions correctly', async () => {
      const result = await agent.processInstruction('Mint a new NFT named Test NFT with symbol TEST using metadata at https://arweave.net/metadata.json');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Minted new NFT');
      expect(result.data).toHaveProperty('name', 'Test NFT');
      expect(result.data).toHaveProperty('symbol', 'TEST');
      expect(result.data).toHaveProperty('metadataUri');
    });
    
    it('should handle unknown instructions', async () => {
      const result = await agent.processInstruction('do something completely different');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(400);
    });
  });
  
  describe('State management', () => {
    it('should return agent state with correct properties', async () => {
      const state = await agent.getState();
      
      expect(state).toHaveProperty('agentId');
      expect(state).toHaveProperty('supportedMarketplaces');
      expect(state.supportedMarketplaces).toContain('Magic Eden');
      expect(state).toHaveProperty('defaultRoyaltyBps', 500);
    });
  });
});
