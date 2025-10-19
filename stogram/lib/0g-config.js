// lib/0g-config.js

export const ZG_CONFIG = {
    // Network Configuration
    network: 'testnet', // or 'mainnet'
    
    // RPC Endpoints
    evmRpc: 'https://evmrpc-testnet.0g.ai/',
    indexerRpc: 'https://indexer-storage-testnet-turbo.0g.ai',
    
    // For mainnet, uncomment these:
    // evmRpc: 'https://evmrpc.0g.ai/',
    // indexerRpc: 'https://indexer-storage-turbo.0g.ai',
    
    // Storage Configuration
    expectedReplicas: 1,
    
    // Flow Contract Address (testnet)
    flowContract: '0xbD2C3F0E65eDF5582141C35969d66e34629cC768',
    
    // For mainnet:
    // flowContract: '0x0460aA47b41a66694c0a73f667a1b795A5ED3556',
  };
  
  // Helper to get download URL
  export function get0GDownloadUrl(rootHash) {
    return `${ZG_CONFIG.indexerRpc}/download/${rootHash}`;
  }