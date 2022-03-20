const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");

describe("Marketplace", function () {
  beforeEach(async () => {
    [owner, user1, user2, user3, user4] = await ethers.getSigners()
    const Token20F = await ethers.getContractFactory("Token20") 
    const Token721F = await ethers.getContractFactory("Token721") 
    const MarketplaceF = await ethers.getContractFactory("Marketplace")
    const totalSupply = parseEther("1000000")
    token20 = await Token20F.connect(owner).deploy(totalSupply)
    token721 = await Token721F.connect(owner).deploy()
    marketplace = await MarketplaceF.connect(owner).deploy(token721.address, token20.address)
    userBalance = 10000
    await token20.connect(owner).transfer(user1.address, userBalance)
    await token20.connect(owner).transfer(user2.address, userBalance)
    await token20.connect(owner).transfer(user3.address, userBalance)
    await token20.connect(owner).transfer(user4.address, userBalance)
    await token721.connect(owner).setNewMarketplaceAddress(marketplace.address)
    const URIS = ['link1','link2','link3','link4','link5']
    await marketplace.connect(owner).createItem(URIS[0], owner.address)
    await marketplace.connect(owner).createItem(URIS[1], user1.address)
    await marketplace.connect(owner).createItem(URIS[2], user2.address)
    await marketplace.connect(owner).createItem(URIS[3], user3.address)
    await marketplace.connect(owner).createItem(URIS[4], user4.address)
  })

  it("selling nft", async function () {
    const price = 100
    const id = 2
    await token721.connect(user1).approve(marketplace.address, id)
    await marketplace.connect(user1).listItem(id, price)
    expect(await token721.ownerOf(id)).to.equal(marketplace.address);
    await expect(marketplace.connect(owner).cancel(id)).to.be.revertedWith("the token does not belong to you")
    await marketplace.connect(user1).cancel(id)
    expect(await token721.ownerOf(id)).to.equal(user1.address)
    await token721.connect(user1).approve(marketplace.address, id)
    await marketplace.connect(user1).listItem(id, price)
    const balanceBefore = await token20.balanceOf(user2.address)
    await token20.connect(user2).approve(marketplace.address, price)
    await marketplace.connect(user2).buyItem(id)
    expect(await token721.ownerOf(id)).to.equal(user2.address)
    expect(await token20.balanceOf(user2.address)).to.equal(balanceBefore - price)
  });

  it("successful auction", async function (){
    const id = 2
    const lowPrice = 50
    const startPrice = 100
    const secondPrice = 150
    const thirdPrice = 200
    const lastPrice = 250
    await token721.connect(user1).approve(marketplace.address, id)
    await marketplace.connect(user1).listItemOnAuction(id, startPrice)
    expect(await token721.ownerOf(id)).to.equal(marketplace.address)
    await token20.connect(user2).approve(marketplace.address, secondPrice)
    await token20.connect(user3).approve(marketplace.address, thirdPrice)
    await token20.connect(user4).approve(marketplace.address, lastPrice)
    await expect(marketplace.connect(user2).makeBid(id, lowPrice)).to.be.revertedWith("your price is less than the current one")
    await marketplace.connect(user2).makeBid(id, secondPrice)
    expect(await token20.balanceOf(user2.address)).to.equal(userBalance - secondPrice)
    expect(await token20.balanceOf(marketplace.address)).to.equal(secondPrice)
    await marketplace.connect(user3).makeBid(id, thirdPrice)
    expect(await token20.balanceOf(user2.address)).to.equal(userBalance)
    expect(await token20.balanceOf(user3.address)).to.equal(userBalance - thirdPrice)
    expect(await token20.balanceOf(marketplace.address)).to.equal(thirdPrice)
    await marketplace.connect(user4).makeBid(id, lastPrice)
    expect(await token20.balanceOf(marketplace.address)).to.equal(lastPrice)
    await expect(marketplace.connect(user2).finishAuction(id)).to.be.revertedWith("the time for debriefing has not yet expired")
    const moreThanThreeDays = 300000 // seconds
    await ethers.provider.send("evm_increaseTime", [moreThanThreeDays])
    await ethers.provider.send("evm_mine")
    await token20.connect(user2).approve(marketplace.address, 1000)
    await expect(marketplace.connect(user2).makeBid(id, 1000)).to.be.revertedWith("auction time has passed")
    await marketplace.connect(user2).finishAuction(id)
    expect(await token20.balanceOf(user1.address)).to.equal(userBalance + lastPrice)
    expect(await token721.ownerOf(id)).to.equal(user4.address)
    await expect(marketplace.connect(user2).finishAuction(id)).to.be.revertedWith("the auction has ended before you")
  })

  it("unsuccessful auction (1 bidder)", async function() {
    const id = 2
    const startPrice = 100
    const secondPrice = 150
    await token721.connect(user1).approve(marketplace.address, id)
    await marketplace.connect(user1).listItemOnAuction(id, startPrice)
    await token20.connect(user2).approve(marketplace.address, secondPrice)
    await marketplace.connect(user2).makeBid(id, secondPrice)
    expect(await token20.balanceOf(user2.address)).to.equal(userBalance - secondPrice)
    expect(await token721.ownerOf(id)).to.equal(marketplace.address)
    const moreThanThreeDays = 300000 // seconds
    await ethers.provider.send("evm_increaseTime", [moreThanThreeDays])
    await ethers.provider.send("evm_mine")
    await marketplace.connect(user4).finishAuction(id)
    expect(await token721.ownerOf(id)).to.equal(user1.address)
    expect(await token20.balanceOf(user2.address)).to.equal(userBalance)
  })

  it("unsuccessful auction (0 bidder)", async function() {
    const id = 2
    const startPrice = 100
    await token721.connect(user1).approve(marketplace.address, id)
    await marketplace.connect(user1).listItemOnAuction(id, startPrice)
    expect(await token721.ownerOf(id)).to.equal(marketplace.address)
    const moreThanThreeDays = 300000 // seconds
    await ethers.provider.send("evm_increaseTime", [moreThanThreeDays])
    await ethers.provider.send("evm_mine")
    await marketplace.connect(user4).finishAuction(id)
    expect(await token721.ownerOf(id)).to.equal(user1.address)
  })
});
