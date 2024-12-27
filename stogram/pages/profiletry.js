import React, { useState, useEffect } from 'react'; // Corrected import (useEffect instead of useReducer)
import Image from 'next/image';
import Navbar from '../components/Navbar';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi'; // RainbowKit integration for wallet connection
import logo from '@/public/logo.jpg';

const contractAddress = "0x18B6926A500DC11b4E1b0f8DE27F770c5D9D2089"; // Your deployed contract address
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_wallet",
        "type": "address"
      }
    ],
    "name": "checkUsernameFromRainbow",
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

const Profile = () => {
  const { address, isConnected } = useAccount(); // Get the connected wallet address and connection status
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isConnected && address) {
      resolveUsername(address);
    }
  }, [isConnected, address]);

  // Function to resolve username from the connected wallet address
  const resolveUsername = async (walletAddress) => {
    setLoading(true);
    setError('');

    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);

        const resolvedUsername = await contract.checkUsernameFromRainbow(walletAddress);
        setUsername(resolvedUsername);
      } else {
        setError("Ethereum provider not detected. Please install MetaMask.");
      }
    } catch (err) {
      console.error("Error resolving username:", err.message);
      setError("No username associated with this wallet. Go to Username and mint your username now!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className='mx-20 my-24'>

      <h1 className="text-purple-300 font-semibold">Username</h1>
      {isConnected ? (
        loading ? (
          <p>Loading your username...</p>
        ) : username ? (
          <p className="text-purple-300">
            <div className='text-5xl font-bold font-sans'>{username}</div>
          </p>
        ) : (
          <p className="text-white">{error}</p>
        )
      ) : (
        <p className="text-white">Please connect your wallet to view your profile.</p>
      )}

</div>
      <div className="flex justify-center">
        <div className="text-3xl font-sans font-semibold text-purple-300 ">
          Posts
        </div>
      </div>

      <div className="flex">
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-black shadow-2xl text-white mx-20 my-2 rounded-xl outline outline-offset-2 outline-zinc-700 outline-width:4px">
            <div className="mx-1 my-1 cursor-pointer">
              <a href="https://bafybeietu4bacniu3vfiparmvxqmd4oclzdiieqva2gaz2exyif46ne4tu.ipfs.dweb.link/Logo.png">
                <Image src={logo} alt="" height={260} width={400} />
              </a>
            </div>
            <div className="flex justify-center">
              <div className="text-purple-300 font-sans my-2">
                <a href="https://bafybeietu4bacniu3vfiparmvxqmd4oclzdiieqva2gaz2exyif46ne4tu.ipfs.dweb.link">
                  View on IPFS
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
