
import "@matterlabs/hardhat-zksync";

const { scrollTestnet, zkSync } = require("viem/chains")

module.exports = {
    solidity: "0.8.18",
    zksolc: {
      version: "latest",
      compilerSource: "binary",
      settings: {
        optimizer: {
          enabled: true,
        },
      },
    },
  }
  networks: {
    localnet: {
        chainId: 31415926
        url: "http://127.0.0.1:1234/rpc/v1"
        accounts: [PRIVATE_KEY],
    },
    ScrollSepoliaTestnet:{
        chainId:534351
        url:"https://scroll-sepolia.blockpi.network/v1/rpc/public"
        accounts: [PRIVATE_KEY]
    },

      zkSync : {
        chainId: 324
        url: "https://mainnet.era.zksync.io	"
        accounts:[PRIVATE_KEY]
      },
      zetachaintestnet : {
        chainId: 7001
        url: "https://zeta-chain-testnet.drpc.org	"
        accounts:[PRIVATE_KEY]
      }
    };