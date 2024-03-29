const { ethers } = require('ethers');
const config = require('../config');

const interactAirdropContract = async (airdropContract, totalTransactionCount, totalETHSpent) => {
    console.log("→ Claiming airdrop...");
    const claimTx = await airdropContract.claim();
    const claimTxReceipt = await claimTx.wait();
    totalETHSpent += Number(ethers.formatEther(claimTxReceipt.gasPrice * claimTxReceipt.gasUsed));
    totalTransactionCount++;
    console.log("  ✓ Claimed airdrop and used " + ethers.formatEther(claimTxReceipt.gasPrice * claimTxReceipt.gasUsed) + " ETH in gas");
    await waitForTimeout();

    console.log("→ Resetting airdrop...");
    const resetTx = await airdropContract.reset();
    const resetTxReceipt = await resetTx.wait();
    totalETHSpent += Number(ethers.formatEther(resetTxReceipt.gasPrice * resetTxReceipt.gasUsed));
    totalTransactionCount++;
    console.log("  ✓ Resetted airdrop and used " + ethers.formatEther(resetTxReceipt.gasPrice * resetTxReceipt.gasUsed) + " ETH in gas");
    await waitForTimeout();

    return { totalTransactionCount, totalETHSpent };
}
const interactStakeContract = async (stakeContract, totalTransactionCount, totalETHSpent) => {
    console.log("→ Staking 1 ETH...");
    const stakeTx = await stakeContract.stake(ethers.parseEther('1'));
    const stakeTxReceipt = await stakeTx.wait();
    totalETHSpent += Number(ethers.formatEther(stakeTxReceipt.gasPrice * stakeTxReceipt.gasUsed));
    totalTransactionCount++;
    console.log("  ✓ Staked 1 ETH and used " + ethers.formatEther(stakeTxReceipt.gasPrice * stakeTxReceipt.gasUsed) + " ETH in gas");
    await waitForTimeout();

    console.log("→ Unstaking all ETH...");
    const unstakeTx = await stakeContract.unstake();
    const unstakeTxReceipt = await unstakeTx.wait();
    totalETHSpent += Number(ethers.formatEther(unstakeTxReceipt.gasPrice * unstakeTxReceipt.gasUsed));
    totalTransactionCount++;
    console.log("  ✓ Unstaked all ETH and used " + ethers.formatEther(unstakeTxReceipt.gasPrice * unstakeTxReceipt.gasUsed) + " ETH in gas");
    await waitForTimeout();

    console.log("→ Staking 1 ETH...");
    const stakeTx2 = await stakeContract.stake(ethers.parseEther('1'));
    const stakeTxReceipt2 = await stakeTx2.wait();
    totalETHSpent += Number(ethers.formatEther(stakeTxReceipt2.gasPrice * stakeTxReceipt2.gasUsed));
    totalTransactionCount++;
    console.log("  ✓ Staked 1 ETH and used " + ethers.formatEther(stakeTxReceipt2.gasPrice * stakeTxReceipt2.gasUsed) + " ETH in gas");
    await waitForTimeout();

    console.log("→ Unstaking all ETH without rewards...");
    const unstakeWithoutRewardsTx = await stakeContract.unstakeWithoutRewards();
    const unstakeWithoutRewardsTxReceipt = await unstakeWithoutRewardsTx.wait();
    totalETHSpent += Number(ethers.formatEther(unstakeWithoutRewardsTxReceipt.gasPrice * unstakeWithoutRewardsTxReceipt.gasUsed));
    totalTransactionCount++;
    console.log("  ✓ Unstaked all ETH without rewards and used " + ethers.formatEther(unstakeWithoutRewardsTxReceipt.gasPrice * unstakeWithoutRewardsTxReceipt.gasUsed) + " ETH in gas");
    await waitForTimeout();

    console.log("→ Staking 1 ETH...");
    const stakeTx3 = await stakeContract.stake(ethers.parseEther('1'));
    const stakeTxReceipt3 = await stakeTx3.wait();
    totalETHSpent += Number(ethers.formatEther(stakeTxReceipt3.gasPrice * stakeTxReceipt3.gasUsed));
    totalTransactionCount++;
    console.log("  ✓ Staked 1 ETH and used " + ethers.formatEther(stakeTxReceipt3.gasPrice * stakeTxReceipt3.gasUsed) + " ETH in gas");
    await waitForTimeout();

    console.log("→ Resetting stake...");
    const resetStakeTx = await stakeContract.resetStake();
    const resetStakeTxReceipt = await resetStakeTx.wait();
    totalETHSpent += Number(ethers.formatEther(resetStakeTxReceipt.gasPrice * resetStakeTxReceipt.gasUsed));
    totalTransactionCount++;
    console.log("  ✓ Resetted stake and used " + ethers.formatEther(resetStakeTxReceipt.gasPrice * resetStakeTxReceipt.gasUsed) + " ETH in gas");
    await waitForTimeout();

    return { totalTransactionCount, totalETHSpent };
}

const interactTokenContract = async (tokenContract, wallet, totalTransactionCount, totalETHSpent) => {
    console.log("→ Minting 3 Tokens...");
    const mintTx = await tokenContract.mint(wallet.address, ethers.parseEther('2'));
    const mintTxReceipt = await mintTx.wait();
    totalETHSpent += Number(ethers.formatEther(mintTxReceipt.gasPrice * mintTxReceipt.gasUsed));
    totalTransactionCount++;
    console.log("  ✓ Minted 3 Tokens and used " + ethers.formatEther(mintTxReceipt.gasPrice * mintTxReceipt.gasUsed) + " ETH in gas");
    await waitForTimeout();

    console.log("→ Burning 1 Token...");
    const burnTx = await tokenContract.burn(ethers.parseEther('1'));
    const burnTxReceipt = await burnTx.wait();
    totalETHSpent += Number(ethers.formatEther(burnTxReceipt.gasPrice * burnTxReceipt.gasUsed));
    totalTransactionCount++;
    console.log("  ✓ Burned 1 Token and used " + ethers.formatEther(burnTxReceipt.gasPrice * burnTxReceipt.gasUsed) + " ETH in gas");
    await waitForTimeout();

    console.log("→ Transfering 1 Token...");
    const transferTx = await tokenContract.transfer(await tokenContract.getAddress(), ethers.parseEther('1'));
    const transferTxReceipt = await transferTx.wait();
    totalETHSpent += Number(ethers.formatEther(transferTxReceipt.gasPrice * transferTxReceipt.gasUsed));
    totalTransactionCount++;
    console.log("  ✓ Transfered 1 Token and used " + ethers.formatEther(transferTxReceipt.gasPrice * transferTxReceipt.gasUsed) + " ETH in gas");
    await waitForTimeout();

    console.log("→ Transfering 1 Token...");
    const transferTx2 = await tokenContract.transfer(await tokenContract.getAddress(), ethers.parseEther('1'));
    const transferTx2Receipt = await transferTx2.wait();
    totalETHSpent += Number(ethers.formatEther(transferTx2Receipt.gasPrice * transferTx2Receipt.gasUsed));
    totalTransactionCount++;
    console.log("  ✓ Transfered 1 Token and used " + ethers.formatEther(transferTx2Receipt.gasPrice * transferTx2Receipt.gasUsed) + " ETH in gas");
    await waitForTimeout();

    return { totalTransactionCount, totalETHSpent };
}

const waitForTimeout = () => new Promise(resolve => setTimeout(() => {
    if (config.timeout > 0) console.log(`  ~ Waiting for ${config.timeout / 1000} minute/s timeout...`);
    resolve();
}, config.timeout + 10));

module.exports = {
    interactAirdropContract,
    interactStakeContract,
    interactTokenContract 
}