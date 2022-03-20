require("@nomiclabs/hardhat-waffle");
// require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();
// require("./tasks");

const { API_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
};