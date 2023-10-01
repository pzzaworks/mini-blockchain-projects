import { expect } from "chai";
import { ethers} from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Contracts", () => {
  async function deployNFTContractFixture() {
    const [owner, ...otherAccounts] = await ethers.getSigners();

    const nftContractFactory = await ethers.getContractFactory("NFTContract");
    const nftContract = await nftContractFactory.deploy();
    await nftContract.waitForDeployment();

    const nftContractAddress = await nftContract.getAddress();

    return { nftContract, nftContractAddress, owner, otherAccounts };
  }

  async function deployNFTContractAndBattleContractFixture() {
    const { nftContract, nftContractAddress, owner, otherAccounts } = await loadFixture(deployNFTContractFixture);

    const battleContractFactory = await ethers.getContractFactory("BattleContract");
    const battleContract = await battleContractFactory.deploy(nftContractAddress);
    await battleContract.waitForDeployment();

    const battleContractAddress = await battleContract.getAddress();

    const friendContractRole = await nftContract.FRIEND_CONTRACT();
    await nftContract.grantRole(friendContractRole, battleContractAddress);

    return { nftContract, battleContract, battleContractAddress, owner, otherAccounts };
  }
  
  describe("NFT Contract", () => {
    it("Should mint an NFT", async () => {
      const { nftContract, owner } = await loadFixture(deployNFTContractFixture);
      
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintValue = ethers.parseEther(mintPrice.toString());

      await nftContract.mint({ value: mintValue });
      
      expect(Number(await nftContract.balanceOf(owner.address, 0))).to.be.equal(1);
      expect(Number(await nftContract.totalSupply())).to.be.equal(1);
    });
    
    it("Should not allow minting an NFT that would exceed the maximum supply", async () => {
      const { nftContract } = await loadFixture(deployNFTContractFixture);

      const maxSupply = Number(await nftContract.MAX_SUPPLY());
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintBatchValue = ethers.parseEther((mintPrice * maxSupply).toString());

      await nftContract.mintBatch(maxSupply, { value: mintBatchValue });      
      
      const mintValue = ethers.parseEther(mintPrice.toString());

      await expect(nftContract.mint({ value: mintValue })).to.be.rejectedWith("Maximum token supply exceeded");
    });

    it("Should not allow minting an NFT with insufficient funds", async () => {
      const { nftContract } = await loadFixture(deployNFTContractFixture);
      
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintValue = Number(ethers.parseEther((mintPrice - 0.001).toString()));

      expect(nftContract.mint({ value: mintValue })).to.be.rejectedWith("Insufficient funds");
    });

    it("Should emit NFT Minted event with right data when mint an NFT", async () => {
      const { nftContract, owner } = await loadFixture(deployNFTContractFixture);
      
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintValue = ethers.parseEther(mintPrice.toString());

      await nftContract.mint({ value: mintValue });

      const events = await nftContract.queryFilter(nftContract.filters.NFTMinted());
      expect(events.length).to.be.greaterThan(0);
      const latestEvent = events[events.length - 1];
      
      expect(Number(latestEvent.args.tokenId)).to.equal(0);
      expect(latestEvent.args.minter).to.equal(owner.address);
    });

    it("Should mint a batch of 100 NFTs", async () => {
      const { nftContract, owner } = await loadFixture(deployNFTContractFixture);
      
      const mintAmount = 100;
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintBatchValue = ethers.parseEther((mintPrice * mintAmount).toString());

      await nftContract.mintBatch(mintAmount, { value: mintBatchValue });
      
      for(let i = 0; i < mintAmount; i++) {
        expect(Number(await nftContract.balanceOf(owner.address, i))).to.be.equal(1);
      }

      expect(Number(await nftContract.totalSupply())).to.be.equal(100);
    });

    it("Should not allow minting of zero amount", async () => {
      const { nftContract } = await loadFixture(deployNFTContractFixture);

      const mintAmount = 0;
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintBatchValue = ethers.parseEther((mintPrice * mintAmount).toString());

      await expect(nftContract.mintBatch(mintAmount, { value: mintBatchValue })).to.be.rejectedWith("Mint amount must be greater than zero");
    });

    it("Should not allow minting a batch of NFTs that would exceed the maximum supply", async () => {
      const { nftContract } = await loadFixture(deployNFTContractFixture);

      const maxSupply = Number(await nftContract.MAX_SUPPLY()) + 1;
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintBatchValue = ethers.parseEther((mintPrice * maxSupply).toString());

      await expect(nftContract.mintBatch(maxSupply, { value: mintBatchValue })).to.be.rejectedWith("Maximum token supply exceeded");
    });

    it("Should not allow minting a batch of NFTs with insufficient funds", async () => {
      const { nftContract } = await loadFixture(deployNFTContractFixture);
      
      const mintAmount = 100;
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintBatchValue = ethers.parseEther(((mintPrice * mintAmount)- 0.001).toString());

      expect(nftContract.mintBatch(mintAmount, { value: mintBatchValue })).to.be.rejectedWith("Insufficient funds");
    });

    it("Should emit NFT Batch Minted event with right data when mint a batch of 100 NFTs", async () => {
      const { nftContract, owner } = await loadFixture(deployNFTContractFixture);
      
      const mintAmount = 100;
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintBatchValue = ethers.parseEther((mintPrice * mintAmount).toString());

      await nftContract.mintBatch(mintAmount, { value: mintBatchValue });
      
      const events = await nftContract.queryFilter(nftContract.filters.NFTBatchMinted());
      expect(events.length).to.be.greaterThan(0);
      const latestEvent = events[events.length - 1];
      
      expect(Number(latestEvent.args.firstTokenId)).to.equal(0);
      expect(Number(latestEvent.args.lastTokenId)).to.equal(99);
      expect(latestEvent.args.minter).to.equal(owner.address);
      
      for(let i = 0; i < mintAmount; i++) {
        expect(Number(await nftContract.balanceOf(owner.address, i))).to.be.equal(1);
      }

      expect(Number(await nftContract.totalSupply())).to.be.equal(100);
    });

    it("Should burn an NFT", async () => {
      const { nftContract, owner } = await loadFixture(deployNFTContractFixture);
      
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintValue = ethers.parseEther(mintPrice.toString());

      await nftContract.mint({ value: mintValue });
      
      await nftContract.burn(owner.address, 0);

      expect(Number(await nftContract.balanceOf(owner.address, 0))).to.be.equal(0);
      expect(Number(await nftContract.totalSupply())).to.be.equal(0);
    });
  
    it("Should only allow administrators or authorized friend contracts to burn tokens", async () => {
      const { nftContract, owner, otherAccounts } = await loadFixture(deployNFTContractFixture);
      
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintValue = ethers.parseEther(mintPrice.toString());

      await nftContract.mint({ value: mintValue });
      await nftContract.burn(owner.address, 0);

      const friendContractRole = await nftContract.FRIEND_CONTRACT();
      await nftContract.grantRole(friendContractRole, otherAccounts[0].address)
      await nftContract.connect(otherAccounts[0]).mint({ value: mintValue });
      await nftContract.connect(otherAccounts[0]).burn(otherAccounts[0].address, 0);

      await nftContract.connect(otherAccounts[1]).mint({ value: mintValue });
      await expect(nftContract.connect(otherAccounts[1]).burn(otherAccounts[1].address, 0)).to.be.rejectedWith("Only administrators and authorized friend contracts are allowed to burn tokens");
    });

    it("Should not allow burning an NFT from the zero address", async () => {
      const { nftContract } = await loadFixture(deployNFTContractFixture);
      
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintValue = ethers.parseEther(mintPrice.toString());

      await nftContract.mint({ value: mintValue });
      
      await expect(nftContract.burn(ethers.ZeroAddress, 0)).to.be.rejectedWith("Burn from the zero address is not allowed");
    });

    it("Should not allow burning an NFT if there are no tokens", async () => {
      const { nftContract, owner } = await loadFixture(deployNFTContractFixture);
      
      await expect(nftContract.burn(owner.address, 0)).to.be.rejectedWith("There is no tokens to burn");
    });

    it("Should withdraw", async () => {
      const { nftContract, nftContractAddress, owner, otherAccounts } = await loadFixture(deployNFTContractFixture);
      
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintValue = ethers.parseEther(mintPrice.toString());

      await nftContract.connect(otherAccounts[0]).mint({ value: mintValue });

      const ownerBalanceBeforeWithdraw = await ethers.provider.getBalance(owner.address);
      const withdrawTx = await nftContract.withdraw();
      const withdrawReceipt = await withdrawTx.wait();
      const withdrawTxGasUsed = withdrawReceipt ? withdrawReceipt.gasUsed * withdrawReceipt.gasPrice : 0;

      const ownerBalance = await ethers.provider.getBalance(owner.address);
      const expectedOwnerBalance = ethers.parseUnits(((BigInt(ownerBalance) + BigInt(withdrawTxGasUsed)) - BigInt(ownerBalanceBeforeWithdraw)).toString(), "wei");
      const nftContractBalance = ethers.parseUnits((await ethers.provider.getBalance(nftContractAddress)).toString(), "wei");

      expect(expectedOwnerBalance).to.be.equal(mintValue);
      expect(nftContractBalance).to.be.equal(0);
    }); 

    it("Should only allow administrators to withdraw", async () => {
      const { nftContract, otherAccounts } = await loadFixture(deployNFTContractFixture);
      
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintValue = ethers.parseEther(mintPrice.toString());

      await nftContract.connect(otherAccounts[0]).mint({ value: mintValue });

      await expect(nftContract.connect(otherAccounts[0]).withdraw()).to.be.rejectedWith("Only administrators are allowed to withdraw tokens");
    }); 

    it("Should not allow withdrawing if there are no native tokens", async () => {
      const { nftContract } = await loadFixture(deployNFTContractFixture);
      
      await expect(nftContract.withdraw()).to.be.rejectedWith("Not enough balance");
    });

    it("Should emit Withdrawn event with right data when withdraw", async () => {
      const { nftContract, nftContractAddress, owner } = await loadFixture(deployNFTContractFixture);
      
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintValue = ethers.parseEther(mintPrice.toString());

      await nftContract.mint({ value: mintValue });

      const nftContractBalance = ethers.parseUnits((await ethers.provider.getBalance(nftContractAddress)).toString(), "wei");

      await nftContract.withdraw();

      const events = await nftContract.queryFilter(nftContract.filters.Withdrawn());
      expect(events.length).to.be.greaterThan(0);
      const latestEvent = events[events.length - 1];

      expect(Number(latestEvent.args.amount)).to.equal(Number(nftContractBalance));
      expect(latestEvent.args.receiver).to.equal(owner.address);
    });

    it("Should set the mint price", async () => {
      const { nftContract } = await loadFixture(deployNFTContractFixture);

      const newMintPrice = 0.025;
      await nftContract.setMintPrice(0, ethers.parseEther(newMintPrice.toString()));

      expect(Number(ethers.formatEther((await nftContract.mintPrice()).toString()))).to.equal(newMintPrice);
    });

    it("Should only allow administrators to set mint price", async () => {
      const { nftContract, otherAccounts } = await loadFixture(deployNFTContractFixture);

      const newMintPrice = 0.025;

      await expect(nftContract.connect(otherAccounts[0]).setMintPrice(0, ethers.parseEther(newMintPrice.toString()))).to.be.rejectedWith("Only administrators are allowed to set mint price");
    }); 
  
    it("Should set score", async () => {
      const { nftContract } = await loadFixture(deployNFTContractFixture);

      await nftContract.setScore(0, 50);
  
      expect(Number(await nftContract.getScore(0))).to.equal(50);
    });

    it("Should only allow administrators or authorized friend contracts to set score", async () => {
      const { nftContract, otherAccounts } = await loadFixture(deployNFTContractFixture);

      await nftContract.setScore(0, 50);

      const friendContractRole = await nftContract.FRIEND_CONTRACT();
      await nftContract.grantRole(friendContractRole, otherAccounts[0].address)
      await nftContract.connect(otherAccounts[0]).setScore(0, 50);

      await expect(nftContract.connect(otherAccounts[1]).setScore(0, 50)).to.be.rejectedWith("Only administrators and authorized authorized friend contracts are allowed to set score");
    }); 
  
    it("Should return the URI", async () => {
      const { nftContract } = await loadFixture(deployNFTContractFixture);

      const baseUri = await nftContract.BASE_URI();
      const uri = await nftContract.uri(0);
  
      expect(uri).to.equal(baseUri + 0 + ".json");
    });
  
    it("Should return the total supply", async () => {
      const { nftContract } = await loadFixture(deployNFTContractFixture);
      
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintValue = ethers.parseEther(mintPrice.toString());

      await nftContract.mint({ value: mintValue });

      const totalSupply = await nftContract.totalSupply();
  
      expect(totalSupply).to.equal(1);
    });
  });
  
  describe("Battle Contract", () => {
    it("Should battle", async () => {
      const { nftContract, battleContract } = await loadFixture(deployNFTContractAndBattleContractFixture);
      
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintValue = ethers.parseEther(mintPrice.toString());

      await nftContract.mint({ value: mintValue });
      await nftContract.mint({ value: mintValue });

      const firstNftId = 0;
      const secondNftId = 1;
      await battleContract.battle(firstNftId, secondNftId);

      const events = await battleContract.queryFilter(battleContract.filters.BattleCompleted());
      expect(events.length).to.be.greaterThan(0);
      const latestEvent = events[events.length - 1];

      const winnerNftId = Number(latestEvent.args.winnerNftId);

      expect(Number(await nftContract.getScore(winnerNftId))).to.equal(1);
      expect(Number(await nftContract.totalSupply())).to.be.equal(1);
    });

    it("Should both NFTs be owned by the caller", async () => {
      const { nftContract, battleContract, otherAccounts } = await loadFixture(deployNFTContractAndBattleContractFixture);
      
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintValue = ethers.parseEther(mintPrice.toString());

      await nftContract.mint({ value: mintValue });
      await nftContract.connect(otherAccounts[0]).mint({ value: mintValue });

      const firstNftId = 0;
      const secondNftId = 1;
      await expect(battleContract.battle(firstNftId, secondNftId)).to.be.rejectedWith("Both NFTs must be owned by the caller");
    }); 

    it("Should emit Battle Completed event with right data when battle", async () => {
      const { nftContract, battleContract, owner } = await loadFixture(deployNFTContractAndBattleContractFixture);
      
      const mintPrice = Number(ethers.formatEther((Number(await nftContract.mintPrice())).toString()));
      const mintValue = ethers.parseEther(mintPrice.toString());

      await nftContract.mint({ value: mintValue });
      await nftContract.mint({ value: mintValue });

      const firstNftId = 0;
      const secondNftId = 1;
      await battleContract.battle(firstNftId, secondNftId);

      const events = await battleContract.queryFilter(battleContract.filters.BattleCompleted());
      expect(events.length).to.be.greaterThan(0);
      const latestEvent = events[events.length - 1];

      expect(Number(latestEvent.args.firstNftId)).to.equal(firstNftId);
      expect(Number(latestEvent.args.secondNftId)).to.equal(secondNftId);
      expect(latestEvent.args.caller).to.equal(owner.address);
    });
  });
});
