const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  const privateKey = process.env.METAMASK_PRIVATE_KEY;
  console.log("Using MetaMask private key:", privateKey ? "exists" : "not set");
  
  // Create a wallet from the private key
  const wallet = new ethers.Wallet(privateKey);
  console.log("MetaMask address:", wallet.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(wallet.address);
  console.log("\nBalance:", hre.ethers.formatEther(balance), "LYXt");
  
  // Check network
  const network = await hre.ethers.provider.getNetwork();
  console.log("\nConnected to network:", {
    name: network.name,
    chainId: network.chainId,
    expectedChainId: 4201,
    isCorrectNetwork: network.chainId === 4201
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 