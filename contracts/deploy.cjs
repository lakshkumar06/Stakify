const hre = require("hardhat");
require("dotenv").config();

async function main() {
  // Debug: Log environment variables
  console.log("Environment variables:");
  console.log("UP_ADDRESS from env:", process.env.UP_ADDRESS);
  console.log("PRIVATE_KEY from env:", process.env.PRIVATE_KEY ? "exists" : "not set");
  
  console.log("\nDeploying ChallengeFactory contract to LUKSO testnet using Universal Profile...");

  // Get the Universal Profile address from environment
  const upAddress = process.env.UP_ADDRESS;
  if (!upAddress) {
    throw new Error("Please set UP_ADDRESS in your .env file");
  }

  // Get the contract factory
  const ChallengeFactory = await hre.ethers.getContractFactory("ChallengeFactory");

  console.log(`Deploying from Universal Profile: ${upAddress}`);

  // Deploy the factory (no initial value needed for factory)
  const factory = await ChallengeFactory.deploy();

  await factory.waitForDeployment();

  const address = await factory.getAddress();
  console.log(`ChallengeFactory deployed to: ${address}`);
  console.log(`Transaction hash: ${factory.deploymentTransaction().hash}`);
  
  // Save the deployed address
  console.log("\nDeployment successful! You can now use the factory to create challenges.");
  console.log("Factory Address:", address);
  console.log("Creator (UP Address):", upAddress);

  // Optional: Create a test challenge
  console.log("\nCreating a test challenge...");
  const description = "Test Challenge";
  const initialValue = hre.ethers.parseEther("0.1"); // 0.1 LYX for initial pool
  
  const tx = await factory.createChallenge(description, { value: initialValue });
  const receipt = await tx.wait();
  
  // Get the challenge address from the event
  const event = receipt.logs.find(log => log.fragment?.name === 'ChallengeCreated');
  if (event) {
    const challengeAddress = event.args[0];
    console.log("Test Challenge created at:", challengeAddress);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 


  //battle nest immune equip beauty large push wise gift limit winter soccer