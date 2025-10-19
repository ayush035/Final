import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi'; // To check wallet connection status
import { ethers } from 'ethers';

const contractAddress = "0x5f2B1D191b44E5F4727F1a0810f6383C53a099bD"; // Deployed contract address
const contractABI  = [
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
  const [isAvailable, setIsAvailable] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null); // Track selected account
  const { isConnected } = useAccount(); // Check wallet connection

  useEffect(() => {
    // Ensure the connected wallet is tracked after MetaMask connects
    const trackWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setSelectedAccount(accounts[0].address || accounts[0]); // v6 returns objects
        }
      }
    };
    trackWallet();
  }, [isConnected]); // This effect runs when the wallet connects

  // Connect to Ethereum provider (MetaMask)
  const requestAccount = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setSelectedAccount(accounts[0]); // Track the account that is connected
    } else {
      console.log("Please install MetaMask!");
    }
  };

  // Check username availability
  const checkUsernameAvailability = async () => {
    if (!username) return;
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const available = await contract.isUsernameAvailable(username);
      setIsAvailable(available);
    }
  };

  // Mint the username
  const mintUsername = async () => {
    if (!username || !isAvailable) {
      setStatus('Please check the availability before minting.');
      return;
    }

    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      try {
        // v6 automatically uses the connected signer; no need for 'from'
        const transaction = await contract.mintUsername(username);
        setStatus('Transaction submitted');
        await transaction.wait();
        setStatus('Username minted successfully');
      } catch (error) {
        console.error(error);
        setStatus('Error minting username');
      }
    }
  };

  return (
    <>
      <div className="flex justify-center items-center h-screen">
        <main className="rounded-xl bg-black text-purple-300 mx-72 outline outline-offset-2 outline-zinc-700 drop-shadow-lg shadow-purple-300">
          {isConnected ? (
            <div className="flex justify-center items-center my-6 mx-4">
              <div className="rounded-2xl bg-black">
                <div className="text-3xl my-4 px-28 cursor-pointer font-sans font-semibold">
                  Mint your name
                </div>
                <div className="px-16">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className="outline outline-offset-2 outline-zinc-700 rounded-lg my-4 font-sans text-md font-semibold text-purple-400 px-2"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
                <div className="px-16 font-semibold font-sans">
                  <button onClick={checkUsernameAvailability}>Check Availability</button>
                </div>
                {isAvailable !== null && (
                  <p className="mx-16">{isAvailable ? 'Username is available!' : 'Username is not available.'}</p>
                )}
                <br />
                <div className="flex justify-center items-center my-4 mx-8">
                  <div className="rounded-2xl bg-purple-400 outline outline-offset-2 outline-zinc-700 hover:bg-white">
                    <div className="text-2xl my-2 mx-4 cursor-pointer font-sans font-semibold text-white hover:text-black hover:bg-white">
                      <button
                        onClick={mintUsername}
                        disabled={!username || !isAvailable}
                        className="py-2 cursor-pointer"
                      >
                        Mint
                      </button>
                    </div>
                  </div>
                </div>
                {status && <p>{status}</p>}
              </div>
            </div>
          ) : (
            <p className="text-center py-8">Please connect your wallet to interact with this feature.</p>
          )}
        </main>
      </div>
    </>
  );
};

export default MintUsername;
