const { ethers } = require('ethers');
const config = require('../config');
const buildObjects = require('./getBuildObjects');

const deployAirdropContract = async (wallet, totalTransactionCount, totalETHSpent) => {
    const airdropContractFactory = new ethers.ContractFactory(buildObjects['Airdrop'].abi, buildObjects['Airdrop'].bytecode, wallet);
    
    console.log('→ Deploying Airdrop contract...');
    const airdropContract = await airdropContractFactory.deploy();
    await airdropContract.waitForDeployment();  
    const deploymentReceipt = await airdropContract.deploymentTransaction().wait(2);
    totalETHSpent += Number(ethers.formatEther(deploymentReceipt.gasPrice * deploymentReceipt.gasUsed));
    console.log(`  ✓ Airdrop contract deployed to: ${await airdropContract.getAddress()}`);
    console.log(`    └─ Airdrop contract deployment used ${ethers.formatEther(deploymentReceipt.gasPrice * deploymentReceipt.gasUsed)} ETH in gas`);
    await waitForTimeout();

    totalTransactionCount++;
    return { contract: airdropContract, totalTransactionCount, totalETHSpent };
}

const deployStakeContract = async (wallet, totalTransactionCount, totalETHSpent) => {
    const stakeContractFactory = new ethers.ContractFactory(buildObjects['Stake'].abi, buildObjects['Stake'].bytecode, wallet);
    
    console.log('→ Deploying Stake contract...');
    const stakeContract = await stakeContractFactory.deploy();
    await stakeContract.waitForDeployment();
    const deploymentReceipt = await stakeContract.deploymentTransaction().wait(2);
    totalETHSpent += Number(ethers.formatEther(deploymentReceipt.gasPrice * deploymentReceipt.gasUsed));
    console.log(`  ✓ Stake contract deployed to: ${await stakeContract.getAddress()}`);
    console.log(`    └─ Stake contract deployment used ${ethers.formatEther(deploymentReceipt.gasPrice * deploymentReceipt.gasUsed)} ETH in gas`);
    await waitForTimeout();

    totalTransactionCount++;
    return { contract: stakeContract, totalTransactionCount, totalETHSpent };
}

const deployTokenContract = async (wallet, totalTransactionCount, totalETHSpent) => {
    const tokenContractFactory = new ethers.ContractFactory(buildObjects['Token'].abi, buildObjects['Token'].bytecode, wallet);
    
    console.log('→ Deploying Token contract...');
    const tokenContract = await tokenContractFactory.deploy();
    await tokenContract.waitForDeployment();
    const deploymentReceipt = await tokenContract.deploymentTransaction().wait(2);
    totalETHSpent += Number(ethers.formatEther(deploymentReceipt.gasPrice * deploymentReceipt.gasUsed));
    console.log(`  ✓ Token contract deployed to: ${await tokenContract.getAddress()}`);
    console.log(`    └─ Token contract deployment used ${ethers.formatEther(deploymentReceipt.gasPrice * deploymentReceipt.gasUsed)} ETH in gas`);
    await waitForTimeout();

    totalTransactionCount++;
    return { contract: tokenContract, totalTransactionCount, totalETHSpent };
}

const waitForTimeout = () => new Promise(resolve => setTimeout(() => {
    if (config.timeout > 0) console.log(`  ~ Waiting for ${config.timeout / 1000} minute/s timeout...`);
    resolve();
}, config.timeout));

module.exports = {
    deployAirdropContract,
    deployStakeContract,
    deployTokenContract 
}