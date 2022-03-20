async function main() {

  const Token = await ethers.getContractFactory("Token721");
  const token = await Token.deploy();

  console.log("721 address:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });