const { scrollTestnet } = require("viem/chains")

module.exports = {
    solidity: "0.8.18",
  }
  networks: {
    localnet: {
        chainId: 31415926
        url: "http://127.0.0.1:1234/rpc/v1"
        accounts: [PRIVATE_KEY],
    }
    calibrationnet: {
        chainId: 314159
        url: "https://api.calibration.node.glif.io/rpc/v1"
        accounts: [PRIVATE_KEY],
    }
    filecoinmainnet: {
        chainId: 314
        url: "https://api.node.glif.io"
        accounts: [PRIVATE_KEY]
    }
    ScrollSepoliaTestnet:{
        chainId:534351
        url:"https://scroll-sepolia.blockpi.network/v1/rpc/public"
        accounts: [PRIVATE_KEY]
    }
        bitlayer: {
          url: "https://testnet-rpc.bitlayer.org" || "",
          accounts:
            process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      }
    };