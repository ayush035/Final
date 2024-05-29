import { ethers } from "ethers";

async function mintNFT(imageURI) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contractAddress = "Y0x884eA5C68A77a09e7586fBEbe79D594cb56b3AAC";
  const abi = [ /* ABI from the compiled contract */ ];
  const contract = new ethers.Contract(contractAddress, abi, signer);

  try {
    const tx = await contract.mintMyNFT(imageURI);
    await tx.wait();
    console.log("NFT minted:", tx);
  } catch (error) {
    console.error("Error minting NFT:", error);
  }
}

// Example usage
const imageURI = "ipfs://YOUR_IMAGE_URI";
mintNFT(imageURI);
