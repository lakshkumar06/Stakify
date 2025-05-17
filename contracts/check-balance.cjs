const hre = require("hardhat");

async function main() {
  // Get the UP address from environment
  const upAddress = process.env.UP_ADDRESS;
  console.log("Checking balance for UP address:", upAddress);
  
  // Get balance directly using the provider
  const balance = await hre.ethers.provider.getBalance(upAddress);
  
  console.log("Balance in wei:", balance.toString());
  console.log("Balance in LYXt:", hre.ethers.formatEther(balance));

  // Also check which account we're using for transactions
  const [signer] = await hre.ethers.getSigners();
  const signerAddress = await signer.getAddress();
  console.log("\nTransaction signer address:", signerAddress);
  console.log("Is signer same as UP address?", signerAddress.toLowerCase() === upAddress.toLowerCase());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 