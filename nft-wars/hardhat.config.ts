import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
require('dotenv').config();

const config = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    polygon_mumbai: { 
      url: 'https://rpc-mumbai.maticvigil.com', 
      accounts: [process.env.PRIVATE_KEY as string]
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 4000,
  },
};

export default config;
