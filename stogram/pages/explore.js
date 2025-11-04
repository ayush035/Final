// pages/explore.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Navbar from '../components/Navbar';
import { get0GDownloadUrl } from '@/lib/0g-browser-client';

const socialContractAddress = "0x25C66b57149495A196dA2c1180a02dB847493460";

const socialPostsABI = [
  "function getAllPosts() external view returns (tuple(uint256 id, address author, string image, uint256 timestamp)[])",
  "function getFeed(uint256 offset, uint256 count) external view returns (tuple(uint256 id, address author, string image, uint256 timestamp)[])",
  "function totalPosts() external view returns (uint256)"
];

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);

  const POSTS_PER_PAGE = 12;

  useEffect(() => {
    loadPosts(0, true);
    getTotalPosts();
  }, []);

  const getTotalPosts = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(socialContractAddress, socialPostsABI, provider);
        const total = await contract.totalPosts();
        setTotalPosts(Number(total));
      }
    } catch (err) {
      console.error('Error getting total posts:', err);
    }
  };

  const loadPosts = async (newOffset = 0, replace = false) => {
    setLoading(true);
    setError('');

    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(socialContractAddress, socialPostsABI, provider);

        // Use getFeed for pagination (newest first)
        const newPosts = await contract.getFeed(newOffset, POSTS_PER_PAGE);

        if (replace) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }

        setHasMore(newPosts.length === POSTS_PER_PAGE);
        setOffset(newOffset + newPosts.length);
      }
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadPosts(offset);
    }
  };

  const refreshPosts = () => {
    setOffset(0);
    setHasMore(true);
    loadPosts(0, true);
    getTotalPosts();
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 my-24">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold font-sans text-purple-300 mb-2">
              Explore Posts
            </h1>
            <p className="text-zinc-400">
              Discover content stored on 0G Storage ({totalPosts} posts)
            </p>
          </div>
          
          <button
            onClick={refreshPosts}
            disabled={loading}
            className="px-6 py-3 bg-purple-400 text-white rounded-lg font-semibold 
              hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed 
              transition-colors flex items-center gap-2"
          >
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
            {loading && <span className="animate-spin">⟳</span>}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div className="text-red-200">{error}</div>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {posts.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📷</div>
            <div className="text-zinc-400 text-lg mb-4">
              No posts found. Be the first to share something amazing!
            </div>
            <a
              href="/upload"
              className="inline-block mt-4 px-6 py-3 bg-purple-400 text-white rounded-lg 
                font-semibold hover:bg-purple-500 transition-colors"
            >
              Create First Post
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {posts.map((post) => (
                <PostCard key={post.id.toString()} post={post} />
              ))}
            </div>

            {/* Load More Button */}
            <div className="flex justify-center">
              {hasMore && !loading && (
                <button
                  onClick={loadMore}
                  className="px-8 py-3 bg-zinc-800 text-white rounded-lg font-semibold 
                    hover:bg-zinc-700 transition-colors"
                >
                  Load More Posts
                </button>
              )}
              
              {loading && (
                <div className="text-center py-4">
                  <div className="animate-pulse text-purple-300">Loading more posts...</div>
                </div>
              )}
              
              {!hasMore && posts.length > 0 && (
                <div className="text-center py-4 text-zinc-400">
                  You've seen all posts! 🎉
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

// Post Card Component
const PostCard = ({ post }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Get the 0G download URL
  const imageUrl = get0GDownloadUrl(post.image);

  return (
    <div className="bg-black rounded-xl shadow-2xl outline outline-offset-2 outline-zinc-700 
      overflow-hidden hover:outline-purple-400 transition-all duration-300 group">
      
      {/* Image Container */}
      <div className="relative h-64 bg-zinc-900">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse space-y-2 text-center">
              <div className="w-12 h-12 bg-zinc-700 rounded-full mx-auto"></div>
              <div className="text-zinc-400 text-sm">Loading from 0G...</div>
            </div>
          </div>
        )}
        
        {!imageError ? (
          <img
            src={imageUrl}
            alt={`Post by ${post.author}`}
            className={`w-full h-full object-cover group-hover:scale-105 
              transition-transform duration-300 ${imageLoading ? 'invisible' : 'visible'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <div className="text-center text-zinc-400 p-4">
              <div className="text-3xl mb-2">📷</div>
              <div className="text-sm">Image failed to load</div>
              <div className="text-xs mt-1">Try refreshing the page</div>
            </div>
          </div>
        )}

        {/* Timestamp Overlay */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white 
          text-xs px-2 py-1 rounded backdrop-blur-sm">
          {new Date(Number(post.timestamp) * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 
          transition-all duration-300" />
      </div>

      {/* Post Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="text-purple-300 font-semibold text-sm mb-1">
              Post #{post.id.toString()}
            </div>
            <div className="text-zinc-400 text-xs">
              By {post.author.slice(0, 6)}...{post.author.slice(-4)}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-purple-400 text-xs underline 
                transition-colors"
              title="View on 0G Storage"
            >
              View ↗
            </a>
          </div>
        </div>

        {/* 0G Hash (truncated) */}
        <div className="text-xs text-zinc-500 font-mono mb-3 break-all">
          0G: {post.image.slice(0, 20)}...{post.image.slice(-8)}
        </div>
        
        {/* Footer with date and actions */}
        <div className="flex justify-between items-center pt-3 border-t border-zinc-700">
          <div className="text-zinc-500 text-xs">
            {new Date(Number(post.timestamp) * 1000).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button 
              className="text-zinc-500 hover:text-red-400 text-sm transition-colors"
              title="Like (coming soon)"
            >
              ♡
            </button>
            <button 
              className="text-zinc-500 hover:text-blue-400 text-sm transition-colors"
              title="Comment (coming soon)"
            >
              💬
            </button>
            <button 
              className="text-zinc-500 hover:text-green-400 text-sm transition-colors"
              title="Share"
              onClick={() => {
                navigator.clipboard.writeText(imageUrl);
                alert('Link copied to clipboard!');
              }}
            >
              📤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;