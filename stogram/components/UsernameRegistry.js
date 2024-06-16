import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { getContract } from '../lib/contract';
import { ethers } from 'ethers';

const UsernameRegistry = () => {
  const [username, setUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);
  const [message, setMessage] = useState('');
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const checkAvailability = async () => {
    if (!username) return;
    const contract = getContract(publicClient);
    try {
      console.log('Checking availability for username:', username);
      // Use ethers.utils to convert the username if needed
      // const usernameBytes = ethers.utils.formatBytes32String(username);
      const available = await contract.isUsernameAvailable(username);
      console.log('Raw response:', available);
      console.log('Available (boolean):', available);
      console.log('Type of response:', typeof available);
      setIsAvailable(available);
    } catch (error) {
      console.error('Error checking username availability:', error);
      console.error('Error details:', error);
    }
  };

  const mintUsername = async () => {
    if (!walletClient) return;
    const contract = getContract(walletClient);
    try {
      console.log('Minting username:', username);
      const tx = await contract.mintUsername(username);
      await tx.wait();
      console.log('Transaction successful:', tx);
      setMessage('Username minted successfully!');
    } catch (error) {
      console.error('Error minting username:', error);
      console.error('Error details:', error);
      setMessage('Failed to mint username.');
    }
  };

  useEffect(() => {
    if (username) {
      checkAvailability();
    }
  }, [username]);

  return (
    <div className='text-black'>
      <h1>Username Registry</h1>
      {isConnected ? (
        <>
          <input
          className='outline outlineoffset-1'
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
          <button onClick={checkAvailability}>Check Availability</button>
          {isAvailable !== null && (
            <p>{isAvailable ? 'Username is available!' : 'Username is not available.'}</p>
          )}
          <br/>
          <button onClick={mintUsername} disabled={!isAvailable}>
            Mint Username
          </button>
          {message && <p>{message}</p>}
        </>
      ) : (
        <p>Please connect your wallet to interact.</p>
      )}
    </div>
  );
};

export default UsernameRegistry;
