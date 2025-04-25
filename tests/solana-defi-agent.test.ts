import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { SolanaDeFiAgent } from '../src/agents/solana-defi-agent';

// Mock the parseInstruction function
jest.mock('../src/nlp/instruction-parser', () => ({
  parseInstruction: jest.fn().mockImplementation((instruction: string) => {
    if (instruction.includes('swap')) {
      return Promise.resolve({
        action: 'swap',
        params: {
          sourceToken: 'SOL',
          targetToken: 'USDC',
          amount: '1.0',
          slippageBps: 50
        },
        confidence: 0.9
      });
    } else if (instruction.includes('add liquidity')) {
      return Promise.resolve({
        action: 'addLiquidity',
        params: {
          poolId: 'test-pool',
          tokenA: 'SOL',
          amountA: '1.0',
          tokenB: 'USDC',
          amountB: '10.0'
        },
        confidence: 0.85
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

describe('SolanaDeFiAgent', () => {
  let agent: SolanaDeFiAgent;
  const mockConnection = {
    // Mock the necessary Connection methods
  } as unknown as Connection;
  
  beforeEach(() => {
    // Create a new agent instance before each test
    agent = new SolanaDeFiAgent({
      agentId: new PublicKey(Keypair.generate().publicKey),
      connection: mockConnection,
      supportedDexes: ['Jupiter', 'Raydium'],
      defaultSlippageBps: 50
    });
  });
  
  describe('Agent information', () => {
    it('should return the correct agent name', () => {
      expect(agent.getName()).toBe('Solana DeFi Agent');
    });
    
    it('should return capabilities', () => {
      const capabilities = agent.getCapabilities();
      expect(capabilities).toContain('Token Swaps');
      expect(capabilities).toContain('Liquidity Provision');
      expect(capabilities.length).toBe(5);
    });
  });
  
  describe('Instruction processing', () => {
    it('should process swap instructions correctly', async () => {
      const result = await agent.processInstruction('Swap 1 SOL to USDC');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('swap');
      expect(result.data).toHaveProperty('sourceToken', 'SOL');
      expect(result.data).toHaveProperty('targetToken', 'USDC');
    });
    
    it('should process liquidity addition instructions correctly', async () => {
      const result = await agent.processInstruction('add liquidity to SOL/USDC pool with 1 SOL and 10 USDC');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Added liquidity');
      expect(result.data).toHaveProperty('tokenA', 'SOL');
      expect(result.data).toHaveProperty('tokenB', 'USDC');
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
      expect(state).toHaveProperty('supportedDexes');
      expect(state.supportedDexes).toContain('Jupiter');
      expect(state).toHaveProperty('defaultSlippageBps', 50);
    });
  });
});
