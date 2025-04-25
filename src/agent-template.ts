import { Connection, PublicKey, Transaction } from '@solana/web3.js';

// Define the base Agent interface
export interface AgentContext {
  agentId: PublicKey;
  connection: Connection;
  contextId?: PublicKey;
}

// Agent base class that all specialized agents will extend
export abstract class Agent {
  protected agentId: PublicKey;
  protected connection: Connection;
  protected contextId?: PublicKey;

  constructor(context: AgentContext) {
    this.agentId = context.agentId;
    this.connection = context.connection;
    this.contextId = context.contextId;
  }

  // Abstract methods that all agents must implement
  abstract getName(): string;
  abstract getDescription(): string;
  abstract getCapabilities(): string[];
  
  // Process natural language instructions
  abstract processInstruction(instruction: string): Promise<AgentResponse>;
  
  // Execute a transaction on the Solana blockchain
  abstract executeTransaction(transaction: Transaction): Promise<string>;
  
  // Get the agent's current state
  abstract getState(): Promise<Record<string, any>>;
}

// Standard response format for all agent operations
export interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
  transactionId?: string;
  error?: {
    code: number;
    message: string;
  };
}
