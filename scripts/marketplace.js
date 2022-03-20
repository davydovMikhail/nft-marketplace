async function main() {
    const address20 = "0x9eB02B48372d2B3335CE78362a65Ab6B5863Ed25"
    const address721 = "0x0034CC26efAfB13b3C6Ce414690E3492C84FAe54"
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(address721, address20);
  
    console.log("marketplace address:", marketplace.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });