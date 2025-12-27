const { ethers } = require("ethers");

const RPC_URL = "http://localhost:8545";
const VAULT_ADDRESS = "SECURE_VAULT_ADDRESS";
const PRIVATE_KEY = 0x59c6995e998f97a5a0044966f094538c5f5b6d2b0c1f7c9b6c1d1e2a4b3c2d1e;

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);



  console.log("Signer:", signer.address);


  console.log("\n🔹 Depositing 1 ETH...");
  const depositTx = await signer.sendTransaction({
    to: VAULT_ADDRESS,
    value: ethers.utils.parseEther("1"),
  });
  await depositTx.wait();
  console.log("Deposit successful");


  const amount = ethers.utils.parseEther("0.2");
  const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
  const chainId = (await provider.getNetwork()).chainId;

  const messageHash = ethers.utils.solidityKeccak256(
    ["address", "address", "uint256", "uint256", "bytes32"],
    [VAULT_ADDRESS, signer.address, amount, chainId, nonce]
  );

  const signature = await signer.signMessage(
    ethers.utils.arrayify(messageHash)
  );

  console.log(" Authorization signed");


  const vaultAbi = [
    "function withdraw(address,uint256,bytes32,bytes)",
  ];
  const vault = new ethers.Contract(VAULT_ADDRESS, vaultAbi, signer);

  console.log("\n🔹 Withdrawing 0.2 ETH...");
  const withdrawTx = await vault.withdraw(
    signer.address,
    amount,
    nonce,
    signature
  );
  await withdrawTx.wait();

  console.log("Withdrawal successful");
}

main().catch(console.error);
