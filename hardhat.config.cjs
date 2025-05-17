require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Debug: Log environment variables
console.log("Hardhat Config - Environment variables:");
console.log("METAMASK_PRIVATE_KEY from env:", process.env.METAMASK_PRIVATE_KEY ? "exists" : "not set");

// Get the MetaMask private key from environment
const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY;

if (!METAMASK_PRIVATE_KEY) {
  console.error("Error: Missing required environment variable!");
  console.error("Please set METAMASK_PRIVATE_KEY in your .env file");
  process.exit(1);
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    luksoTestnet: {
      url: "https://rpc.testnet.lukso.network",
      chainId: 4201,
      // Use MetaMask private key
      accounts: [METAMASK_PRIVATE_KEY],
      gasPrice: 500000000, // 0.5 gwei for testnet
      gas: 5000000, // Gas limit
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
}; 