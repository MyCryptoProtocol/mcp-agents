# MCP Agents

## Overview
Repository containing agent templates and execution engines for the Machine-Centric Protocol (MCP) on Solana. This includes prebuilt AI agents, agent-to-context routing logic, and natural language parsing capabilities.

## Features
- **Agent Templates**: Foundational structures for building specialized agents
- **Prebuilt Agents**: Ready-to-use agents for DeFi, NFT markets, and more
- **Context Routing**: Intelligent routing of agent requests to appropriate contexts
- **NLP Integration**: Natural language processing for agent instructions

## Prebuilt Agents
- `solana-defi-agent`: Specialized for DeFi operations on Solana
- `nft-market-agent`: Handles NFT marketplace interactions
- And more...

## Development Setup
```bash
# Install dependencies
npm install

# Run tests
npm test
```

## Repository Structure
- `/agents` - Agent implementation templates and prebuilt agents
- `/contexts` - YAML/JSON definitions for available context services
- `/tests` - Unit and integration tests
- `/.github` - CI/CD workflows

## Links
- [Documentation](../mcp-docs)
- [Core Protocol](../mcp-core)
- [Examples](../mcp-examples)
