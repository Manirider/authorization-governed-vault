const { ethers } = require("ethers");

const RPC_URL = "http://localhost:8545";
const VAULT_ADDRESS = "0xPASTE_SECURE_VAULT_ADDRESS";
const PRIVATE_KEY = "0xPASTE_PRIVATE_KEY";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  const amount = ethers.utils.parseEther("0.1");
  const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
  const chainId = (await provider.getNetwork()).chainId;

  const messageHash = ethers.utils.solidityKeccak256(
    ["address", "address", "uint256", "uint256", "bytes32"],
    [VAULT_ADDRESS, signer.address, amount, chainId, nonce]
  );

  const signature = await signer.signMessage(
    ethers.utils.arrayify(messageHash)
  );

  const vaultAbi = [
    "function withdraw(address,uint256,bytes32,bytes)",
  ];
  const vault = new ethers.Contract(VAULT_ADDRESS, vaultAbi, signer);

  console.log("🔹 First withdrawal (expected SUCCESS)");
  await (await vault.withdraw(signer.address, amount, nonce, signature)).wait();
  console.log("✅ First withdrawal success");

  console.log("\n🔁 Replay attack (expected FAILURE)");
  try {
    await (await vault.withdraw(signer.address, amount, nonce, signature)).wait();
  } catch (err) {
    console.log("❌ Replay blocked as expected");
    console.log("Reason:", err.reason || "Authorization already used");
  }
}

main().catch(console.error);
