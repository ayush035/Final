// lib/chains.js

export const zetachaintestnet = {
    id: 7001,
    name: 'Zetachain Testnet',
    network: 'zetachain-testnet',
    nativeCurrency: {
      name: 'ZETA',
      symbol: 'Zeta',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://zeta-chain-testnet.drpc.org	'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Custom Explorer',
        url: 'https://custom-explorer.com',
      },
    },
  };
  