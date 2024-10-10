import { ethers } from 'ethers';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
const contractAddress = "0xC3a3e3419ED038B261dE1BF8057558F85b6e33D8"; // Deployed contract address
const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "username",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "UsernameMinted",
    "type": "event"
  },
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
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_wallet",
        "type": "address"
      }
    ],
    "name": "getUsernameFromWallet",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_username",
        "type": "string"
      }
    ],
    "name": "isUsernameAvailable",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_username",
        "type": "string"
      }
    ],
    "name": "mintUsername",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "usernames",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "walletToUsername",
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


const MintUsername = () => {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');

  // Connect to Ethereum provider (MetaMask)
  const requestAccount = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  };

  // Check username availability
  const checkUsernameAvailability = async () => {
    if (!username) return;
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const isAvailable = await contract.isUsernameAvailable(username);
      return isAvailable;
    }
  };

  // Mint the username
  const mintUsername = async () => {
    if (!username) return;
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      try {
        const isAvailable = await checkUsernameAvailability();
        if (isAvailable) {
          const transaction = await contract.mintUsername(username);
          setStatus('Transaction submitted');
          await transaction.wait();
          setStatus('Username minted successfully');
        } else {
          setStatus('Username is taken');
        }
      } catch (error) {
        console.error(error);
        setStatus('Error minting username');
      }
    }
  };

  return (
    <>
    <Navbar/>
    <div className="bg-white text-black my-20">
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={mintUsername}>Mint Username</button>
      <p>{status}</p>
    </div> </>
  );
};

export default MintUsername;
