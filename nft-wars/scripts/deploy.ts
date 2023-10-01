import { ethers } from "hardhat";

async function main() {
  const nftContractFactory = await ethers.getContractFactory("NFTContract");
  const nftContract = await nftContractFactory.deploy();

  await nftContract.waitForDeployment();
  console.log('NFT Contract deployed to: ', await nftContract.getAddress());

  const battleContractFactory = await ethers.getContractFactory("BattleContract");
  const battleContract = await battleContractFactory.deploy(await nftContract.getAddress());

  await battleContract.waitForDeployment();
  console.log('Battle Contract deployed to: ', await battleContract.getAddress());

  const friendContractRole = await nftContract.FRIEND_CONTRACT();
  await nftContract.grantRole(friendContractRole, await battleContract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
