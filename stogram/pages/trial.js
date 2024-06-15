// pages/index.js

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Home() {
  const [contract, setContract] = useState(null);
  const [username, setUsername] = useState('');
  const [availability, setAvailability] = useState(null);
  const [message, setMessage] = useState('');

  const { isConnected } = useAccount();
  const { data: signer } = useSignMessage();

  useEffect(() => {
    if (signer) {
      const contractAddress = "0x5594a82F09953fd753f171A6AfF00763Dbfa122e" ; 
      const contractABI = 
        [
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
              },
              {
                "indexed": false,
                "internalType": "string",
                "name": "username",
                "type": "string"
              }
            ],
            "name": "UsernameMinted",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
              },
              {
                "indexed": false,
                "internalType": "string",
                "name": "username",
                "type": "string"
              }
            ],
            "name": "UsernameNotAvailable",
            "type": "event"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "name": "addressToUsername",
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
                "name": "_address",
                "type": "address"
              }
            ],
            "name": "getUsername",
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
            "name": "usernameToAddress",
            "outputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          }
        ]
;
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contractInstance);
    }
  }, [signer]);

  const handleCheckAvailability = async () => {
    if (contract && username) {
      try {
        const isAvailable = await contract.isUsernameAvailable(username);
        setAvailability(isAvailable);
      } catch (error) {
        console.error('Error checking username availability:', error);
      }
    }
  };

  const handleMintUsername = async () => {
    if (contract && username && availability) {
      try {
        const tx = await contract.mintUsername(username);
        await tx.wait();
        setMessage(`Username "${username}" has been minted successfully.`);
      } catch (error) {
        console.error('Error minting username:', error);
        setMessage('Error minting username: ' + error.message);
      }
    } else {
      setMessage('Username not available.');
    }
  };

  return (

    <div>
      <Navbar/>
      <h1>Username Registry</h1>
      <ConnectButton />
      {isConnected && (
        <div className='text-black'>
          <div className='text-black'>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
            <button onClick={handleCheckAvailability}>Check Availability</button>
            {availability !== null && (
              <p>{availability ? 'Username is available' : 'Username is not available'}</p>
            )}
          </div>
          <div>
            <button onClick={handleMintUsername}>Mint Username</button>
          </div>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}
