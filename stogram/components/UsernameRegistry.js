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
      console.log('Assigned contract instance:', contract); // Debugging

      const available = await contract.isUsernameAvailable(username);
      console.log('Raw response:', available);
      
      if (typeof available === 'boolean') {
        setIsAvailable(available);
      } else {
        throw new Error('Unexpected response type');
      }

      console.log('Username availability:', available);
    } catch (error) {
      console.error('Error checking username availability:', error);
      setMessage('Error: Failed to check username availability. Please check the console.');
    }
  };

  const mintUsername = async () => {
    if (!address) return; // Ensure connected before minting

    try {
      const signer = await publicClient.getSigner();
      const contract = getContract(signer);
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
    <div className="flex justify-center items-center h-screen">
      <main className="rounded-xl bg-white text-pink-500 mx-72 outline outline-offset-2 outline-pink-300 shadow-2xl">
        <div className="flex justify-center items-center my-6 mx-4">
          <div className="rounded-2xl bg-white">
            <div className="text-3xl my-4 px-28 cursor-pointer font-mono font-semibold">Mint your name</div>
            {isConnected ? (
              <>
                <div className="px-16">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className="outline outline-offset-2 outline-pink-300 rounded-lg my-4 font-mono text-md font-semibold text-pink-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
                <div className="px-16 font-semibold font-mono">
                  <button onClick={checkAvailability}>Check Availability</button>
                </div>
                {isAvailable !== null && (
                  <p>{isAvailable ? 'Username is available!' : 'Username is not available.'}</p>
                )}
                <br />
                <div className="flex justify-center items-center my-4 mx-8">
                  <div className="rounded-2xl bg-gray-100 outline outline-offset-2 outline-pink-300">
                    <div className="text-2xl my-2 mx-4 cursor-pointer font-mono font-semibold text-black hover:text-pink-500">
                      <button onClick={mintUsername} disabled={!username || !isAvailable} className="py-2">
                        Mint
                      </button>
                    </div>
                  </div>
                </div>
                {message && <p>{message}</p>}
              </>
            ) : (
              <p>Please connect your wallet to interact.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UsernameRegistry;
