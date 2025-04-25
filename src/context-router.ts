import { Connection, PublicKey } from '@solana/web3.js';
import { Agent } from './agent-template';
import * as yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Context definition interface
 * Represents a service or data source that an agent can interact with
 */
export interface ContextDefinition {
  id: string;
  name: string;
  description: string;
  type: ContextType;
  capabilities: string[];
  endpoint?: string;
  pubkey?: string;
  authRequired: boolean;
  schema?: Record<string, any>;
}

/**
 * Types of contexts that can be registered
 */
export enum ContextType {
  DEX = 'dex',
  NFT_MARKETPLACE = 'nft_marketplace',
  ORACLE = 'oracle',
  GOVERNANCE = 'governance',
  SOCIAL = 'social',
  IDENTITY = 'identity',
  STORAGE = 'storage'
}

/**
 * Context router class that handles agent-to-context interactions
 * and manages context discovery and routing
 */
export class ContextRouter {
  private contexts: Map<string, ContextDefinition>;
  private connection: Connection;
  
  constructor(connection: Connection) {
    this.contexts = new Map<string, ContextDefinition>();
    this.connection = connection;
  }
  
  /**
   * Load context definitions from YAML/JSON files
   * @param contextDir Directory containing context definition files
   */
  async loadContexts(contextDir: string): Promise<void> {
    try {
      const files = fs.readdirSync(contextDir);
      
      for (const file of files) {
        if (file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json')) {
          const filePath = path.join(contextDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          let contextDef: ContextDefinition;
          
          if (file.endsWith('.json')) {
            contextDef = JSON.parse(content);
          } else {
            contextDef = yaml.parse(content);
          }
          
          this.registerContext(contextDef);
        }
      }
      
      console.log(`Loaded ${this.contexts.size} context definitions`);
    } catch (error) {
      console.error('Failed to load context definitions:', error);
      throw error;
    }
  }
  
  /**
   * Register a context definition
   * @param context Context definition to register
   */
  registerContext(context: ContextDefinition): void {
    if (this.contexts.has(context.id)) {
      console.warn(`Context with ID ${context.id} already registered, overwriting`);
    }
    
    this.contexts.set(context.id, context);
  }
  
  /**
   * Find contexts that match the requested capabilities
   * @param capabilities Array of capability strings to match
   * @returns Array of matching context definitions
   */
  findContextsByCapabilities(capabilities: string[]): ContextDefinition[] {
    const matches: ContextDefinition[] = [];
    
    for (const context of this.contexts.values()) {
      const hasAllCapabilities = capabilities.every(cap => 
        context.capabilities.some(contextCap => 
          contextCap.toLowerCase() === cap.toLowerCase()
        )
      );
      
      if (hasAllCapabilities) {
        matches.push(context);
      }
    }
    
    return matches;
  }
  
  /**
   * Find contexts of a specific type
   * @param type Context type to filter by
   * @returns Array of matching context definitions
   */
  findContextsByType(type: ContextType): ContextDefinition[] {
    return Array.from(this.contexts.values())
      .filter(context => context.type === type);
  }
  
  /**
   * Check if an agent has permission to access a specific context
   * @param agent Agent requesting access
   * @param contextId ID of the context to check permissions for
   * @returns Promise resolving to boolean indicating permission status
   */
  async checkPermission(agent: Agent, contextId: string): Promise<boolean> {
    const context = this.contexts.get(contextId);
    if (!context) {
      return false;
    }
    
    // In a real implementation, this would check on-chain permissions
    // using the registry program
    
    // For now, we'll simulate this check
    const agentState = await agent.getState();
    const agentId = new PublicKey(agentState.agentId);
    
    // TODO: Implement actual permission checking using the registry program
    return true;
  }
  
  /**
   * Route an agent request to the appropriate context
   * @param agent Agent making the request
   * @param contextId ID of the context to route to
   * @param request Request data to send to the context
   * @returns Promise resolving to the context response
   */
  async routeRequest(
    agent: Agent, 
    contextId: string, 
    request: Record<string, any>
  ): Promise<Record<string, any>> {
    // Check permissions first
    const hasPermission = await this.checkPermission(agent, contextId);
    if (!hasPermission) {
      throw new Error(`Agent ${agent.getName()} does not have permission to access context ${contextId}`);
    }
    
    const context = this.contexts.get(contextId);
    if (!context) {
      throw new Error(`Context ${contextId} not found`);
    }
    
    // In a real implementation, this would forward the request to the
    // actual context service endpoint and return the response
    
    // For now, we'll return a simulated response
    return {
      contextId,
      timestamp: new Date().toISOString(),
      status: 'success',
      data: {
        message: `Processed request to ${context.name}`,
        requestSummary: request
      }
    };
  }
}
