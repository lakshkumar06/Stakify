const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  console.log("Using private key:", privateKey);
  
  // Create a wallet from the private key
  const wallet = new ethers.Wallet(privateKey);
  console.log("Wallet address from private key:", wallet.address);
  console.log("Expected UP address:", process.env.UP_ADDRESS);
  console.log("Do they match?", wallet.address.toLowerCase() === process.env.UP_ADDRESS.toLowerCase());

  // Check balance of the wallet address
  const balance = await hre.ethers.provider.getBalance(wallet.address);
  console.log("\nBalance of wallet address:", hre.ethers.formatEther(balance), "LYXt");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 