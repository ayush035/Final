import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useAccount, usePublicClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

 export default function SuperfluidDemo() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState('');
  const [adminAddress, setAdminAddress] = useState('');
  const [message, setMessage] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();



  const CFAv1ForwarderAddress = '0xcfA132E353cB4E398080B9700609bb008eceB125';
  const GDAv1ForwarderAddress = '0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08';
  const tokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const receiverAddress = '0xC72fa67241b2Ab95776DB23Cb27A845d4290d75B';
  const flowRate='3805175038052 wei/second';

  const CFAv1ForwarderABI = [
  "function createFlow(address token, address sender, address receiver, int96 flowRate, bytes memory userData) external returns (bool)"
  ];

  const GDAv1ForwarderABI = [
  "function createPool(address token, address admin, (uint32 transferabilityForUnitsOwner, bool distributionFromAnyAddress) memory poolConfig) external returns (bool, address)"
  ];

//   const connectWallet = async () => {
//     if (typeof window.ethereum !== 'undefined') {
//       try {
//         await window.ethereum.request({ method: 'eth_requestAccounts' });
//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         setProvider(provider);
//         const signer = provider.getSigner();
//         const address = await signer.getAddress();
//         setAccount(address);
//         setMessage(`Connected to ${address}`);
//       } catch (error) {
//         console.error('Failed to connect wallet:', error);
//         setMessage('Failed to connect wallet. Please try again.');
//       }
//     } else {
//       setMessage('Please install Metamask to use this feature.');
//     }
//   };

  const createStream = async () => {
    if (!isConnected) {
      setMessage('Please connect your wallet first.');
      return;
    }

    const signer = provider.getSigner();
    const contract = new ethers.Contract(CFAv1ForwarderAddress, CFAv1ForwarderABI, signer);

    try {
      const tx = await contract.createFlow(
        tokenAddress,
        account,
        receiverAddress,
        flowRate,
        "0x"
      );
      await tx.wait();
      setMessage('The stream has been created successfully.');
    } catch (error) {
      console.error('Error creating stream:', error);
      setMessage('Failed to create stream. Please try again.');
    }
  };

//   const createPool = async () => {
//     if (!provider) {
//       setMessage('Please connect your wallet first.');
//       return;
//     }

//     const signer = provider.getSigner();
//     const contract = new ethers.Contract(GDAv1ForwarderAddress, GDAv1ForwarderABI, signer);

//     try {
//       const poolConfig = {
//         transferabilityForUnitsOwner: 0,
//         distributionFromAnyAddress: false
//       };
//       const tx = await contract.createPool(tokenAddress, adminAddress, poolConfig);
//       const receipt = await tx.wait();
//       const [success, poolAddress] = receipt.events.find(e => e.event === 'PoolCreated').args;
//       setMessage(`Pool created successfully at ${poolAddress}`);
//     } catch (error) {
//       console.error('Error creating pool:', error);
//       setMessage('Failed to create pool. Please try again.');
//     }
//   };

  return (

    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>Superfluid Demo</h1>
     
      
      {!isConnected ? (
        <div className='text-black'> please connect wallet to continue</div>
      ) : ( <>
    

        <button onClick={createStream} className="mx-10 font-sans text-white text-xl font-bold bg-pink-400 rounded-lg my-2 px-2 py-1"> Stream donation </button>
        

  
        {message && <p style={{ marginTop: '20px', textAlign: 'center' }}>{message}</p>}
        </>
   )
    }

        </div>
    );
  }
