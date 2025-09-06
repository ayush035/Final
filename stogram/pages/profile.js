// pages/profile.jsx (or components/Profile.jsx)
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';

// Contract addresses and ABIs
const usernameContractAddress = "0x18B6926A500DC11b4E1b0f8DE27F770c5D9D2089";
const socialContractAddress = "0x8C5028149f79290379F0E19D3DE642ca4C22629C";

const usernameContractABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_wallet", "type": "address" }
    ],
    "name": "checkUsernameFromRainbow",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const socialPostsABI = [
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

const Profile = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState('');

  useEffect(() => {
    if (isConnected && address) {
      resolveUsername(address);
      loadUserPosts();
    }
  }, [isConnected, address, walletClient]);

  // Fetch username
  const resolveUsername = async (walletAddress) => {
    setLoading(true);
    setError('');

    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(usernameContractAddress, usernameContractABI, provider);

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

  // Fetch user posts
  const loadUserPosts = async () => {
    if (!isConnected || !walletClient) return;
  
    setLoadingPosts(true);
    setPostsError('');
  
    try {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
  
      const contract = new ethers.Contract(socialContractAddress, socialPostsABI, signer);
      const userPosts = await contract.getMyPosts();
  
      // Clone before reversing to avoid mutating the read-only Result
      setPosts([...userPosts].reverse());
    } catch (err) {
      console.error('Error loading user posts:', err);
      setPostsError('Failed to load your posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  const PostCard = ({ post }) => (
    <div className="bg-black shadow-2xl text-white rounded-xl outline outline-offset-2 outline-zinc-700 overflow-hidden">
      <div className="relative">
        <img
          src={`https://gateway.lighthouse.storage/ipfs/${post.image}`}
          alt="Post"
          className="w-full h-64 object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-image.png';
          }}
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {new Date(Number(post.timestamp) * 1000).toLocaleDateString()}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div className="text-purple-300 font-sans text-sm">
            Post #{post.id.toString()}
          </div>
          <a
            href={`https://gateway.lighthouse.storage/ipfs/${post.image}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-300 hover:text-purple-400 text-sm underline"
          >
            View on IPFS
          </a>
        </div>
        <div className="text-xs text-zinc-400 mt-2">
          IPFS: {post.image.slice(0, 20)}...
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="mx-4 md:mx-20 my-24">
        <h1 className="text-purple-300 font-semibold text-lg">GM ☀️,</h1>
        
        {isConnected ? (
          loading ? (
            <p className="text-purple-300">Loading your username...</p>
          ) : username ? (
            <div className="text-5xl font-bold font-sans text-purple-300 mb-8">
              {username}
            </div>
          ) : (
            <div className="text-white mb-8">
              <div className="text-3xl font-bold font-sans mb-2">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )
        ) : (
          <p className="text-white mb-8">Please connect your wallet to view your profile.</p>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-sans font-semibold text-purple-300">
              My Posts ({posts.length})
            </h2>
            <button
              onClick={loadUserPosts}
              disabled={loadingPosts || !isConnected}
              className="px-4 py-2 bg-purple-400 text-white rounded-lg font-semibold hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPosts ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {!isConnected ? (
            <div className="text-center py-12 text-zinc-400">
              <p>Connect your wallet to view your posts</p>
            </div>
          ) : loadingPosts ? (
            <div className="text-center py-12 text-purple-300">
              <p>Loading your posts...</p>
            </div>
          ) : postsError ? (
            <div className="text-center py-12 text-red-300">
              <p>{postsError}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <p className="text-lg mb-4">You haven't created any posts yet</p>
              <a
                href="/post"
                className="inline-block px-6 py-3 bg-purple-400 text-white rounded-lg font-semibold hover:bg-purple-500 transition-colors"
              >
                Create Your First Post
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id.toString()} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
