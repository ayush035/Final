import React, { useState } from 'react';
import { ethers } from 'ethers';
import Navbar from '@/components/Navbar';

const contractAddress = "0x3Dc655B890cf7A687925cdd4329Cc3F6429cda9C";

// Provided Contract ABI
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "getUserNFTs",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      }
    ],
    "name": "mintNFT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const MintNFT = () => {
  const [file, setFile] = useState(null);
  const [minted, setMinted] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const mintNFT = async () => {
    if (!file) {
      alert("Please upload a file.");
      return;
    }

    try {
      // Connect to MetaMask and initialize the contract
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Create a token URI for the NFT
      const tokenURI = `data:image/${file.type.split("/")[1]};base64,${await fileToBase64(file)}`;

      // Call the mintNFT function on the contract
      const tx = await contract.mintNFT(tokenURI);
      await tx.wait();

      setMessage("NFT Minted!");
      setMinted(true);
    } catch (error) {
      console.error("Error minting NFT:", error);
      setMessage("Error minting NFT.");
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-screen">
        <main className="rounded-xl bg-black text-purple-300 mx-72 outline outline-offset-2 outline-zinc-700 shadow-2xl">
          <div className="flex justify-center items-center my-6 mx-4">
            <div className="rounded-2xl bg-black">
              <div className="text-3xl my-4 mx-8 cursor-pointer font-sans font-semibold">
              Upload Posts              </div>
            </div>
          </div>
          <div className="p-2 mx-8 right flex flex-col">
            <label className="my-4 font-sans text-md " htmlFor="filepicker">
              Select Image to mint it as NFT
            </label>
            <input type="file" onChange={handleFileChange} accept="image/*" />
            <div className="flex justify-center items-center my-12 mx-6">
              <div className="rounded-2xl bg-purple-400 outline outline-offset-2 outline-zinc-700 hover:bg-white">
                <div className="text-2xl my-2 mx-3 cursor-pointer font-sans font-semibold text-white hover:text-black">
                  <button className="px-8 my-2 cursor-pointer" onClick={mintNFT}>
                    Mint NFT
                  </button>
                </div>
              </div>
            </div>
            {message && (
   <div className="overlay">
   <div className="notification">
     <div className="text-white font-sans font-semibold">
                      <p>{message}</p>
              </div></div></div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default MintNFT;
