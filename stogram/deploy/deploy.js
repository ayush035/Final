async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
  
    const ImageNFT = await ethers.getContractFactory("ImageNFT");
    const imageNFT = await ImageNFT.deploy();
    await imageNFT.deployed();
  
    console.log("ImageNFT deployed to:", imageNFT.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  
    