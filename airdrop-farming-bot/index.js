require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const config = require('./config');
const deployContracts = require('./utils/deployContracts');
const interactContracts = require('./utils/interactContracts');

const privateKeys = process.env.PRIVATE_KEYS.split(',');
const provider = new ethers.JsonRpcProvider(config.rpcUrl);

let totalETHSpent = 0;
let totalTransactionCount = 0;
let isShuttingDown = false;

const main = async () => {
    while (!isShuttingDown) {
        console.log('→ Starting airdrop farming bot');
        console.log(`→ Connecting to ${config.rpcUrl}`);
        console.log(`  ✓ Connected to ${config.rpcUrl}`);
        console.log(`→ Found ${privateKeys.length} wallet address/es in environment file`);

        totalETHSpent = 0;
        totalTransactionCount = 0;

        const runningCount = config.runForever ? Infinity : 1;

        for (let i = 0; i < runningCount; i++) {
            for (let i = 0; i < privateKeys.length; i++) {
                const wallet = new ethers.Wallet(privateKeys[i], provider);
                const balance = await provider.getBalance(wallet.address);

                console.log(`  Wallet ${i + 1}: ${wallet.address}`);
                console.log(`    └─ Wallet ${i + 1} balance: ${ethers.formatEther(balance)} ETH`);
                console.log(`    └─ Wallet ${i + 1} total transaction count: ${await wallet.getNonce()} tx`);

                let airdropContracts = [];
                let stakeContracts = [];
                let tokenContracts = [];

                for (let j = 0; j < config.deployCount; j++) {
                    const airdropContract = await deployContracts.deployAirdropContract(wallet, totalTransactionCount, totalETHSpent);
                    totalTransactionCount = airdropContract.totalTransactionCount;
                    totalETHSpent = airdropContract.totalETHSpent;
                    airdropContracts.push(airdropContract.contract);

                    const stakeContract = await deployContracts.deployStakeContract(wallet, totalTransactionCount, totalETHSpent);
                    totalTransactionCount = stakeContract.totalTransactionCount;
                    totalETHSpent = stakeContract.totalETHSpent;
                    stakeContracts.push(stakeContract.contract);

                    const tokenContract = await deployContracts.deployTokenContract(wallet, totalTransactionCount, totalETHSpent);
                    totalTransactionCount = tokenContract.totalTransactionCount;
                    totalETHSpent = tokenContract.totalETHSpent;
                    tokenContracts.push(tokenContract.contract);
                }

                for (let j = 0; j < config.interactCount; j++) {
                    for (let k = 0; k < config.deployCount; k++) {
                        const airdropContractInteractions = await interactContracts.interactAirdropContract(airdropContracts[k], totalTransactionCount, totalETHSpent);
                        totalTransactionCount = airdropContractInteractions.totalTransactionCount;
                        totalETHSpent = airdropContractInteractions.totalETHSpent;

                        const stakeContractInteractions = await interactContracts.interactStakeContract(stakeContracts[k], totalTransactionCount, totalETHSpent);
                        totalTransactionCount = stakeContractInteractions.totalTransactionCount;
                        totalETHSpent = stakeContractInteractions.totalETHSpent;

                        const tokenContractInteractions = await interactContracts.interactTokenContract(tokenContracts[k], wallet, totalTransactionCount, totalETHSpent);
                        totalTransactionCount = tokenContractInteractions.totalTransactionCount;
                        totalETHSpent = tokenContractInteractions.totalETHSpent;
                    }
                }
            }
        }

        isShuttingDown = true;
    }
}

process.on('SIGINT', async () => {
    isShuttingDown = true;

    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`);
    const ethPrice = response.data.ethereum["usd"];

    console.log('');
    console.log('→ Total ETH spent: ' + totalETHSpent + ' ETH');
    console.log('→ Total ETH spent in USD: ' + totalETHSpent * ethPrice + ' USD');
    console.log('→ Total transactions done: ' + totalTransactionCount + ' tx');
    console.log('✓ Finished airdrop farming successfully');
    process.exit(0);
});

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
})