require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    luksoTestnet: {
      url: "https://rpc.testnet.lukso.network",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 4201,
    },
  },
  etherscan: {
    apiKey: {
      luksoTestnet: "no-api-key-needed"
    },
    customChains: [
      {
        network: "luksoTestnet",
        chainId: 4201,
        urls: {
          apiURL: "https://explorer.execution.testnet.lukso.network/api",
          browserURL: "https://explorer.execution.testnet.lukso.network"
        }
      }
    ]
  }
}; 