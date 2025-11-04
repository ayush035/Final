// pages/profile.jsx (or components/Profile.jsx)
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import { SOCIAL_GRAPH_CONTRACT } from '@/lib/config3';
import FollowListModal from '../components/FollowListModal';
import { useReadContract } from 'wagmi';
import { RefreshCw, Users, UserPlus, MoreVertical, Trash2, Lock, Globe } from 'lucide-react';

 
// Contract addresses and ABIs
const usernameContractAddress = "0x0E51e917f9B397CF654Ad009B2b60ae2d7525b46";
const socialContractAddress = "0x25C66b57149495A196dA2c1180a02dB847493460";

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
			},
			{
				"internalType": "bool",
				"name": "isPrivate",
				"type": "bool"
			}
		],
		"name": "createPost",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"name": "deletePost",
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
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isPrivate",
				"type": "bool"
			}
		],
		"name": "PostCreated",
		"type": "event"
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
			}
		],
		"name": "PostDeleted",
		"type": "event"
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
				"internalType": "bool",
				"name": "isPrivate",
				"type": "bool"
			}
		],
		"name": "PostPrivacyChanged",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "postId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isPrivate",
				"type": "bool"
			}
		],
		"name": "setPostPrivacy",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
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
					},
					{
						"internalType": "bool",
						"name": "isPrivate",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "isDeleted",
						"type": "bool"
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
					},
					{
						"internalType": "bool",
						"name": "isPrivate",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "isDeleted",
						"type": "bool"
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
					},
					{
						"internalType": "bool",
						"name": "isPrivate",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "isDeleted",
						"type": "bool"
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
					},
					{
						"internalType": "bool",
						"name": "isPrivate",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "isDeleted",
						"type": "bool"
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
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserPosts",
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
					},
					{
						"internalType": "bool",
						"name": "isPrivate",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "isDeleted",
						"type": "bool"
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
		"name": "isPostDeleted",
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
				"internalType": "uint256",
				"name": "postId",
				"type": "uint256"
			}
		],
		"name": "isPostPrivate",
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
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "totalUserPosts",
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
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState('');
  
  const { data: followersArray } = useReadContract({
    address: SOCIAL_GRAPH_CONTRACT.address,
    abi: SOCIAL_GRAPH_CONTRACT.abi,
    functionName: 'getFollowers',
    args: [address],
    enabled: Boolean(address),
  });

  const { data: followingArray } = useReadContract({
    address: SOCIAL_GRAPH_CONTRACT.address,
    abi: SOCIAL_GRAPH_CONTRACT.abi,
    functionName: 'getFollowing',
    args: [address],
    enabled: Boolean(address),
  });

  const followerCount = followersArray?.length || 0;
  const followingCount = followingArray?.length || 0;

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
  
      setPosts([...userPosts].reverse());
    } catch (err) {
      console.error('Error loading user posts:', err);
      setPostsError('Failed to load your posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(socialContractAddress, socialPostsABI, signer);

      const tx = await contract.deletePost(postId);
      await tx.wait();

      alert('Post deleted successfully!');
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post: ' + (err.message || 'Unknown error'));
    }
  };

  // Handle toggle privacy
  const handleTogglePrivacy = async (postId, currentPrivacy) => {
    const newPrivacy = !currentPrivacy;
    
    try {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(socialContractAddress, socialPostsABI, signer);

      const tx = await contract.setPostPrivacy(postId, newPrivacy);
      await tx.wait();

      alert(`Post is now ${newPrivacy ? 'private' : 'public'}!`);
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, isPrivate: newPrivacy } : post
      ));
    } catch (err) {
      console.error('Error toggling privacy:', err);
      alert('Failed to update privacy: ' + (err.message || 'Unknown error'));
    }
  };

  const PostCard = ({ post }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setShowMenu(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
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
          
          {/* Private Badge */}
          {post.isPrivate && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-orange-900 bg-opacity-90 text-orange-200 text-xs px-2 py-1 rounded backdrop-blur-sm">
              <Lock className="h-3 w-3" />
              <span>Private</span>
            </div>
          )}

          {/* Three-dot menu */}
          <div className="absolute top-2 right-2" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-black bg-opacity-70 text-white hover:bg-opacity-90 rounded-lg transition-colors backdrop-blur-sm"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border-2 border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
                <button
                  onClick={() => {
                    handleTogglePrivacy(post.id, post.isPrivate);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-white hover:bg-zinc-800 transition-colors"
                >
                  {post.isPrivate ? (
                    <>
                      <Globe className="h-4 w-4 text-green-400" />
                      <span>Make Public</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-orange-400" />
                      <span>Make Private</span>
                    </>
                  )}
                </button>

                <div className="border-t border-zinc-700"></div>

                <button
                  onClick={() => {
                    handleDeletePost(post.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Post</span>
                </button>
              </div>
            )}
          </div>

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
              View on 0g storage
            </a>
          </div>
          <div className="text-xs text-zinc-400 mt-2">
            Hash: {post.image.slice(0, 20)}...
          </div>
        </div>
      </div>
    );
  };

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
        <button
            onClick={() => setShowFollowersModal(true)}
            className="bg-black outline outline-2 outline-purple-400 hover:outline-purple-500 rounded-lg shadow-sm p-4 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Followers</p>
                <p className="text-2xl font-bold text-white">{followerCount}</p>
              </div>
              <Users className="h-8 w-8 text-pink-200" />
            </div>
          </button>
          <button
            onClick={() => setShowFollowingModal(true)}
            className="bg-black outline outline-2 outline-purple-400 hover:outline-purple-500 rounded-lg shadow-sm p-4 transition-all cursor-pointer text-left mx-8 my-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Following</p>
                <p className="text-2xl font-bold text-white">{followingCount}</p>
              </div>
              <UserPlus className="h-8 w-8 text-pink-200" />
            </div>
          </button>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-sans font-semibold text-purple-300">
              My Posts ({posts.length})
            </h2>
            <button
              onClick={loadUserPosts}
              disabled={loadingPosts || !isConnected}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-400 text-white rounded-lg font-semibold hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${loadingPosts ? 'animate-spin' : ''}`} />
              <span>{loadingPosts ? 'Loading...' : 'Refresh'}</span>
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
        <FollowListModal
          isOpen={showFollowersModal}
          onClose={() => setShowFollowersModal(false)}
          title="Followers"
          addresses={followersArray}
        />
        <FollowListModal
          isOpen={showFollowingModal}
          onClose={() => setShowFollowingModal(false)}
          title="Following"
          addresses={followingArray}
        />
      </div>
    </>
  );
};

export default Profile;