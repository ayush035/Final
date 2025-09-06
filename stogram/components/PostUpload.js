// components/PostUpload.js
import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import lighthouse from '@lighthouse-web3/sdk';
import Navbar from '@/components/Navbar';

const SOCIAL_POSTS_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "image",
				"type": "string"
			}
		],
		"name": "createPost",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "author",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "image",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "PostCreated",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "getAllPosts",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "author",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "image",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct SocialPosts.Post[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "offset",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "count",
				"type": "uint256"
			}
		],
		"name": "getFeed",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "author",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "image",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct SocialPosts.Post[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMyPosts",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "author",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "image",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct SocialPosts.Post[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "postId",
				"type": "uint256"
			}
		],
		"name": "getPost",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "author",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "image",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct SocialPosts.Post",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalPosts",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const CONTRACT_ADDRESS = "0x8C5028149f79290379F0E19D3DE642ca4C22629C"
const LIGHTHOUSE_API_KEY = "a8dee0d8.92117c8d9ba148a2a8e0bff1cb01cfe9";

export default function PostUpload() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient(); // ✅ replaces useSigner

  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");
  const [creatingPost, setCreatingPost] = useState(false);

  const progressCallback = (progressData) => {
    let percentageDone = 100 - (progressData.total / progressData.uploaded).toFixed(2);
    console.log(percentageDone);
  };

  const uploadFile = async (file) => {
    if (!file || file.length === 0) return;
    
    setUploading(true);
    setError('');
    setFileUploaded(false);

    try {
      const output = await lighthouse.upload(file, LIGHTHOUSE_API_KEY, false, null, progressCallback);
      console.log('File Status:', output);
      console.log('Visit at https://gateway.lighthouse.storage/ipfs/' + output.data.Hash);
      
      setFileName(file[0].name);
      setIpfsHash(output.data.Hash);
      setFileUploaded(true);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload file to IPFS');
    } finally {
      setUploading(false);
    }
  };

  const createPost = async () => {
    if (!walletClient || !ipfsHash || !isConnected) {
      setError('Please connect wallet and upload a file first');
      return;
    }

    setCreatingPost(true);
    setError('');

    try {
      // ✅ ethers v6 + wagmi v1 style
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, SOCIAL_POSTS_ABI, signer);
      
      const tx = await contract.createPost(ipfsHash);
      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      
      console.log('Post created successfully!');
      
      // Reset form
      setIpfsHash('');
      setFileName('');
      setDescription('');
      setFileUploaded(false);
      
      alert('Post created successfully!');
      
    } catch (err) {
      console.error('Create post error:', err);
      setError(`Failed to create post: ${err.message}`);
    } finally {
      setCreatingPost(false);
    }
  };

  const mintAsNFT = async () => {
    if (!ipfsHash) {
      setError('Please upload a file first');
      return;
    }
    alert('NFT minting feature coming soon!');
  };

  useEffect(() => {
    let timer;
    if (fileUploaded) {
      timer = setTimeout(() => {
        setFileUploaded(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [fileUploaded]);

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-screen">
        <main className="rounded-xl bg-black text-purple-300 mx-4 w-full max-w-2xl outline outline-offset-2 outline-zinc-700 shadow-2xl">
          
          <div className="flex justify-center items-center my-6 mx-4">
            <div className="rounded-2xl bg-black">
              <div className="text-3xl my-4 mx-8 cursor-pointer font-sans font-semibold">
                Upload Posts
              </div>
            </div>
          </div>

          <div className="p-2 mx-8 flex flex-col">
            <div className="p-2 mx-4 flex flex-col space-y-4">
              
              {!isConnected && (
                <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 mb-4">
                  <p className="text-yellow-200">Please connect your wallet to create posts</p>
                </div>
              )}

              <div>
                <label className="block my-2 font-sans text-md font-semibold" htmlFor="filepicker">
                  Pick files to store
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => uploadFile(e.target.files)}
                  disabled={uploading}
                  className="block w-full text-purple-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-400 file:text-white hover:file:bg-purple-500"
                />
                
                {fileUploaded && (
                  <div className="mt-2 p-3 bg-green-900 border border-green-600 rounded-lg">
                    <div className="text-green-200 font-sans font-semibold">
                      File uploaded! Ready to post.
                    </div>
                  </div>
                )}
                
                {uploading && (
                  <div className="mt-2 text-purple-300">Uploading to IPFS...</div>
                )}
              </div>

              <div>
                <label className="block my-2 font-sans text-md font-semibold">
                  Description
                </label>
                <input
                  className="text-pink-500 rounded-md px-4 py-2 w-full outline outline-offset-2 outline-zinc-700 bg-zinc-900"
                  type="text"
                  placeholder="Hey, there!"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={uploading || creatingPost}
                />
              </div>

              {error && (
                <div className="bg-red-900 border border-red-600 rounded-lg p-4">
                  <div className="text-red-200">{error}</div>
                </div>
              )}

              <div className="flex justify-center items-center my-2 mx-6 space-x-4">
                <button
                  onClick={createPost}
                  disabled={uploading || creatingPost || !ipfsHash || !isConnected}
                  className="rounded-2xl bg-purple-400 outline outline-offset-2 outline-zinc-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors my-4"
                >
                  <div className="text-2xl my-2 mx-3 cursor-pointer font-sans font-semibold text-white hover:text-black px-4">
                    {creatingPost ? 'Creating...' : 'Post'}
                  </div>
                </button>

                <button
                  onClick={mintAsNFT}
                  disabled={uploading || !ipfsHash}
                  className="rounded-2xl bg-zinc-800 outline outline-offset-2 outline-zinc-700 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {/* <div className="text-2xl my-2 mx-3 cursor-pointer font-sans font-semibold text-white hover:text-purple-300 px-4">
                    Mint as NFT
                  </div> */}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
