const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

task("createItem", "mint nft from marketplace")
    .addParam("uri", "link to ipfs")
    .addParam("owner", "future owner of nft")
    .setAction(async function (taskArgs, hre) {
        const marketplace = await hre.ethers.getContractAt("Marketplace", process.env.ADDR_MARKETPLACE);
        try {
            await marketplace.createItem(taskArgs.uri, taskArgs.owner)
            console.log('successful');
        } catch (e) {
            console.log('error',e)
        }
    });