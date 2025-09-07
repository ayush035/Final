// components/PostCard.jsx
import React, { useState } from 'react';
import { useAccount } from 'wagmi';

const PostCard = ({ 
  post, 
  showAuthor = true, 
  size = 'medium',
  className = '' 
}) => {
  const { address } = useAccount();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const sizeClasses = {
    small: 'h-48',
    medium: 'h-64',
    large: 'h-80'
  };

  const isOwnPost = address && post.author.toLowerCase() === address.toLowerCase();

  return (
    <div className={`bg-black rounded-xl shadow-2xl outline outline-offset-2 outline-zinc-700 overflow-hidden hover:outline-purple-400 transition-all duration-300 group ${className}`}>
      
      {/* Image Container */}
      <div className={`relative ${sizeClasses[size]} bg-zinc-900`}>
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-zinc-700 rounded-full mb-2"></div>
              <div className="text-zinc-400 text-sm">Loading...</div>
            </div>
          </div>
        )}
        
        {!imageError ? (
          <img
            src={`https://gateway.lighthouse.storage/ipfs/${post.image}`}
            alt={`Post by ${post.author}`}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              imageLoading ? 'invisible' : 'visible'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <div className="text-center text-zinc-400">
              <div className="text-3xl mb-2">📷</div>
              <div className="text-sm">Image failed to load</div>
              <div className="text-xs mt-1">Try refreshing</div>
            </div>
          </div>
        )}

        {/* Timestamp Overlay */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          {new Date(Number(post.timestamp) * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
        </div>
        
        {/* Own Post Indicator */}
        {isOwnPost && (
          <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
            Your Post
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
      </div>

      {/* Post Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            {/* <div className="text-purple-300 font-semibold text-sm mb-1">
              Post #{post.id.toString()}
            </div> */}
            {showAuthor && (
              <div className="text-zinc-400 text-xs">
                {isOwnPost ? 'You' : `${post.author.slice(0, 6)}...${post.author.slice(-4)}`}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <a
              href={`https://gateway.lighthouse.storage/ipfs/${post.image}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-purple-400 text-xs underline transition-colors"
              title="View full image on IPFS"
            >
              View ↗
            </a>
          </div>
        </div>

        {/* IPFS Hash */}
        <div className="text-xs text-zinc-500 font-mono mb-3 break-all">
          IPFS: {post.image.slice(0, 20)}...{post.image.slice(-8)}
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
              title="Share (coming soon)"
              onClick={() => {
                navigator.clipboard.writeText(`https://gateway.lighthouse.storage/ipfs/${post.image}`);
                // You could add a toast notification here
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

export default PostCard;
