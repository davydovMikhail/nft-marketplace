const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");

describe("Marketplace", function () {
  beforeEach(async () => {
    [owner, user1, user2, user3] = await ethers.getSigners()
    const Token20F = await ethers.getContractFactory("Token20") 
    const Token721F = await ethers.getContractFactory("Token721") 
    const MarketplaceF = await ethers.getContractFactory("Marketplace")
    const totalSupply = parseEther("1000000")
    token20 = await Token20F.connect(owner).deploy(totalSupply)
    token721 = await Token721F.connect(owner).deploy()
    marketplace = await MarketplaceF.connect(owner).deploy(token721.address, token20.address)
    await token20.connect(owner).transfer(user1.address, 10000)
    await token20.connect(owner).transfer(user2.address, 10000)
    await token20.connect(owner).transfer(user3.address, 10000)
    await token721.connect(owner).setNewMarketplaceAddress(marketplace.address)
    const URIS = ['link1','link2','link3','link4','link5','link6','link7','link8']
    await marketplace.connect(owner).createItem(URIS[0], owner.address)
    await marketplace.connect(owner).createItem(URIS[1], owner.address)
    await marketplace.connect(owner).createItem(URIS[2], user1.address)
    await marketplace.connect(owner).createItem(URIS[3], user1.address)
    await marketplace.connect(owner).createItem(URIS[4], user2.address)
    await marketplace.connect(owner).createItem(URIS[5], user2.address)
    await marketplace.connect(owner).createItem(URIS[6], user3.address)
    await marketplace.connect(owner).createItem(URIS[7], user3.address)
  })

  it("selling nft", async function () {
    const price = 100
    const id = 3
    await token721.connect(user1).approve(marketplace.address, id)
    await marketplace.connect(user1).listItem(id, price)
    expect(await token721.ownerOf(id)).to.equal(marketplace.address);
    await expect(marketplace.connect(owner).cancel(id)).to.be.revertedWith("the token does not belong to you")
    await marketplace.connect(user1).cancel(id)
    expect(await token721.ownerOf(id)).to.equal(user1.address)
    await token721.connect(user1).approve(marketplace.address, id)
    await marketplace.connect(user1).listItem(id, price)
  });
});
