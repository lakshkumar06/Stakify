const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Deploy Challenge contract first
  const Challenge = await hre.ethers.getContractFactory("Challenge");
  const challenge = await Challenge.deploy();
  await challenge.waitForDeployment();
  console.log("Challenge contract deployed to:", await challenge.getAddress());

  // Deploy ChallengeFactory contract
  const ChallengeFactory = await hre.ethers.getContractFactory("ChallengeFactory");
  const factory = await ChallengeFactory.deploy();
  await factory.waitForDeployment();
  console.log("ChallengeFactory contract deployed to:", await factory.getAddress());

  // Verify contracts on block explorer
  console.log("Waiting for block confirmations...");
  await challenge.deployTransaction.wait(5); // Wait 5 blocks
  await factory.deployTransaction.wait(5);

  console.log("Verifying contracts...");
  try {
    await hre.run("verify:verify", {
      address: await challenge.getAddress(),
      constructorArguments: [],
    });
  } catch (error) {
    console.error("Error verifying Challenge contract:", error);
  }

  try {
    await hre.run("verify:verify", {
      address: await factory.getAddress(),
      constructorArguments: [],
    });
  } catch (error) {
    console.error("Error verifying ChallengeFactory contract:", error);
  }

  console.log("Deployment and verification complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 