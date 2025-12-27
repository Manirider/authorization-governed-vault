const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log(" Deployment Started");
  console.log("Network Chain ID:", network.chainId);
  console.log("Deployer Address:", deployer.address);
  

  const AuthorizationManager = await hre.ethers.getContractFactory(
    "AuthorizationManager"
  );
  const authManager = await AuthorizationManager.deploy(deployer.address);
  await authManager.deployed();

  console.log(" AuthorizationManager:", authManager.address);

  const SecureVault = await hre.ethers.getContractFactory("SecureVault");
  const vault = await SecureVault.deploy(authManager.address);
  await vault.deployed();

  console.log("SecureVault:", vault.address);

  
  console.log(" Deployment Complete");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
