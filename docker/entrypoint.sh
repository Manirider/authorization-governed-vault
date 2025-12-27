

echo "🔧 Compiling contracts..."
npx hardhat compile

echo "⛓️ Starting local Hardhat node..."
npx hardhat node &

sleep 5

echo "Deploying contracts..."
npx hardhat run scripts/deploy.js --network localhost

echo "System ready. RPC running on port 8545."

tail -f /dev/null
