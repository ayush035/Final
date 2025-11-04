// components/PostCard.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { get0GDownloadUrl } from '@/lib/0g-storage-upload';
import { MoreVertical, Trash2, Lock, Globe } from 'lucide-react';

const PostCard = ({ 
  post, 
  showAuthor = true, 
  size = 'medium',
  className = '',
  aiPollData = null,
  onDelete = null,
  onTogglePrivacy = null,
  isOwner = false
}) => {
  const { address } = useAccount();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  // Poll voting state
  const [selectedOption, setSelectedOption] = useState(null);
  const [votes, setVotes] = useState(
    aiPollData?.options.map(() => 0) || []
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleVote = (optionIndex) => {
    if (selectedOption !== null) return; // Already voted
    
    setSelectedOption(optionIndex);
    const newVotes = [...votes];
    newVotes[optionIndex] += 1;
    setVotes(newVotes);
    
    // TODO: Store vote on blockchain or database
    console.log('Voted for option:', optionIndex, aiPollData.options[optionIndex]);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      if (onDelete) onDelete(post.id);
      setShowMenu(false);
    }
  };

  const handleTogglePrivacy = () => {
    if (onTogglePrivacy) onTogglePrivacy(post.id, post.isPrivate);
    setShowMenu(false);
  };

  const totalVotes = votes.reduce((sum, count) => sum + count, 0);

  const getPercentage = (voteCount) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  const sizeClasses = {
    small: 'h-48',
    medium: 'h-64',
    large: 'h-80'
  };

  const isOwnPost = address && post.author.toLowerCase() === address.toLowerCase();
  const imageUrl = get0GDownloadUrl(post.image);

  return (
    <div className={`bg-black rounded-xl shadow-2xl outline outline-offset-2 outline-zinc-700 
      overflow-hidden hover:outline-purple-400 transition-all duration-300 group ${className}`}>
      
      {/* Image Container */}
      <div className={`relative ${sizeClasses[size]} bg-zinc-900`}>
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse text-center">
              <div className="w-8 h-8 bg-zinc-700 rounded-full mx-auto mb-2"></div>
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
              <div className="text-xs mt-1">Try refreshing</div>
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
        
        {/* Top Right Badges Container */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
          {/* Private Badge */}
          {post.isPrivate && (
            <div className="flex items-center gap-1 bg-orange-900 bg-opacity-90 text-orange-200 
              text-xs px-2 py-1 rounded backdrop-blur-sm">
              <Lock className="h-3 w-3" />
              <span>Private</span>
            </div>
          )}
          
          {/* Own Post Indicator */}
          {isOwnPost && (
            <div className="bg-purple-500 bg-opacity-90 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              Your Post
            </div>
          )}
        </div>
        
        {/* AI Badge (top left) */}
        {aiPollData && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-blue-600 
            text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <span>✨</span>
            <span>AI Poll</span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 
          transition-all duration-300" />
      </div>

      {/* AI Poll Section */}
      {aiPollData && (
        <div className="p-4 bg-gradient-to-r from-purple-900 to-blue-900 border-t border-purple-700">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <h3 className="text-purple-200 font-semibold text-sm">AI Recommended Poll</h3>
              </div>
              {aiPollData.verified && (
                <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full flex items-center gap-1">
                  <span>✓</span>
                  <span>Verified</span>
                </span>
              )}
            </div>
            <p className="text-white font-medium text-sm mb-3">
              {aiPollData.question}
            </p>
          </div>

          <div className="space-y-2">
            {aiPollData.options.map((option, index) => {
              const voteCount = votes[index] || 0;
              const percentage = getPercentage(voteCount);
              const isSelected = selectedOption === index;
              const hasVoted = selectedOption !== null;

              return (
                <button
                  key={index}
                  onClick={() => handleVote(index)}
                  disabled={hasVoted}
                  className={`w-full text-left transition-all ${
                    hasVoted ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02]'
                  }`}
                >
                  <div className={`relative rounded-lg overflow-hidden border-2 ${
                    isSelected 
                      ? 'border-purple-400 bg-purple-800' 
                      : hasVoted 
                      ? 'border-zinc-700 bg-zinc-800' 
                      : 'border-zinc-600 bg-zinc-800 hover:border-purple-500'
                  }`}>
                    {/* Progress bar background */}
                    {hasVoted && (
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    )}
                    
                    {/* Option content */}
                    <div className="relative px-4 py-3 flex items-center justify-between">
                      <span className={`font-medium text-sm ${
                        isSelected ? 'text-white' : 'text-purple-200'
                      }`}>
                        {option}
                      </span>
                      {hasVoted && (
                        <span className="text-sm font-bold text-white">
                          {percentage}%
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <div className="mt-3 text-center text-xs text-purple-300">
              {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} • Thanks for voting!
            </div>
          )}
        </div>
      )}

      {/* Post Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            {showAuthor && (
              <div className="text-zinc-400 text-xs">
                {isOwnPost ? 'You' : `${post.author.slice(0, 6)}...${post.author.slice(-4)}`}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-purple-400 text-xs underline 
                transition-colors"
              title="View full image on 0G Storage"
            >
              View ↗
            </a>

            {/* Three-dot menu (only show for owner) */}
            {isOwner && (onDelete || onTogglePrivacy) && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 
                    rounded-lg transition-colors"
                  aria-label="Post options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border-2 border-zinc-700 
                    rounded-lg shadow-xl z-50 overflow-hidden">
                    {onTogglePrivacy && (
                      <button
                        onClick={handleTogglePrivacy}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm 
                          text-white hover:bg-zinc-800 transition-colors"
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
                    )}

                    {onTogglePrivacy && onDelete && (
                      <div className="border-t border-zinc-700"></div>
                    )}

                    {onDelete && (
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm 
                          text-red-400 hover:bg-zinc-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Post</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 0G Hash */}
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

export default PostCard;