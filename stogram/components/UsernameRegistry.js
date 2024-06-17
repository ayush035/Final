import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, usePublicClient } from 'wagmi';
import { getContract } from '@/lib/contract'; // Assuming `getContract` is in a separate file

const UsernameRegistry = () => {
  const [username, setUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);
  const [message, setMessage] = useState('');
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const checkAvailability = async () => {
    if (!username) return;

    try {
      const contract = getContract(publicClient);
      console.log('Assigned contract instance:', contract); // Added for debugging

      const available = await contract.isUsernameAvailable(username);
      setIsAvailable(available);

      console.log('Username availability:', available);
    } catch (error) {
      console.error('Error checking username availability:', error);
      setMessage('Error: Failed to check username availability , Please check console');
    }
  };

  const mintUsername = async () => {
    if (!address) return; // Ensure connected before minting

    try {
      const contract = getContract(publicClient);
      console.log('Minting username:', username);
      const tx = await contract.mintUsername(username);
      await tx.wait();
      console.log('Transaction successful:', tx);
      setMessage('Username minted successfully!');
    } catch (error) {
      console.error('Error minting username:', error);
      setMessage('Error: Failed to mint username.');
    }
  };

  useEffect(() => {
    if (username) {
      checkAvailability();
    }
  }, [username]); // Only re-check on username change

  return (
    <div className='text-black'>
      <h1 className='py-2'>Username Registry</h1>
      {isConnected ? (
        <>
          <input
            id="username"
            name="username"
            type="text"
            className='outline outline-offset-1'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
          <button onClick={checkAvailability} className='px-2'>Check Availability</button>
          {isAvailable !== null && (
            <p>{isAvailable ? 'Username is available!' : 'Username is not available.'}</p>
          )}
          <br/>
          <button onClick={mintUsername} disabled={!username || !isAvailable} className='py-2'>
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
