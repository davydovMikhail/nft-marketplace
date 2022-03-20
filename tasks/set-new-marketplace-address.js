const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

task("setNewMarketplaceAddress", "set new marketplace address")
    .addParam("address", "marketplace's address")
    .setAction(async function (taskArgs, hre) {
        const token = await hre.ethers.getContractAt("Token721", process.env.ADDR_CONTRACT721);
        try {
            await token.setNewMarketplaceAddress(taskArgs.address)
            console.log('successful');
        } catch (e) {
            console.log('error',e)
        }
    });