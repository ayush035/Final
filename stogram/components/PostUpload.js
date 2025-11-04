// components/PostUpload.js
import React, { useState } from "react";
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import Navbar from '@/components/Navbar';
import { uploadTo0GSimple as uploadTo0GStorage, get0GDownloadUrl } from '@/lib/0g-storage-simple';

const SOCIAL_POSTS_ABI = [
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
  }
];

const CONTRACT_ADDRESS = "0x25C66b57149495A196dA2c1180a02dB847493460";

export default function PostUpload() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // File state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState("");
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileHash, setFileHash] = useState("");
  const [uploadDetails, setUploadDetails] = useState(null);
  
  // Post state
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  
  // Error state
  const [error, setError] = useState("");

  /**
   * Handle file selection
   */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Reset previous states
    setError('');
    setFileUploaded(false);
    setFileHash('');
    setUploadDetails(null);
    setUploadProgress(0);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, GIF, WebP, etc.)');
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }
    
    setSelectedFile(file);
    setFileName(file.name);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  /**
   * Upload file to 0G Storage
   */
  const uploadFile = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    
    if (!isConnected || !walletClient) {
      setError('Please connect your wallet first');
      return;
    }
    
    setUploading(true);
    setError('');
    setFileUploaded(false);
    setUploadProgress(0);

    try {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      console.log('Starting upload to 0G Storage...');
      
      const result = await uploadTo0GStorage(
        selectedFile, 
        signer,
        (progress) => {
          setUploadProgress(progress);
          console.log(`Upload progress: ${progress}%`);
        }
      );
      
      console.log('✅ Upload successful:', result);
      
      setFileHash(result.hash);
      setUploadDetails(result);
      setFileUploaded(true);
      setUploadProgress(100);
      
    } catch (err) {
      console.error('❌ Upload error:', err);
      setError(`Failed to upload file: ${err.message}`);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Create post on blockchain with privacy setting
   */
  const createPost = async () => {
    if (!walletClient || !fileHash || !isConnected) {
      setError('Please connect wallet and upload a file first');
      return;
    }

    setCreatingPost(true);
    setError('');

    try {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS, 
        SOCIAL_POSTS_ABI, 
        signer
      );
      
      console.log('Creating post with hash:', fileHash);
      console.log('Privacy setting:', isPrivate ? 'Private' : 'Public');
      
      // Store the file hash in the smart contract with privacy setting
      const tx = await contract.createPost(fileHash, isPrivate);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Post created successfully! Block:', receipt.blockNumber);
      
      resetForm();
      alert(`🎉 ${isPrivate ? 'Private' : 'Public'} post created successfully!\n\nYour image is now stored on 0G Storage.`);
      
    } catch (err) {
      console.error('❌ Create post error:', err);
      
      let errorMessage = 'Failed to create post';
      if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setCreatingPost(false);
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFileHash('');
    setFileName('');
    setDescription('');
    setSelectedFile(null);
    setFilePreview(null);
    setFileUploaded(false);
    setUploadProgress(0);
    setUploadDetails(null);
    setIsPrivate(false);
  };

  /**
   * Cancel and reset
   */
  const handleCancel = () => {
    if (uploading || creatingPost) {
      return;
    }
    resetForm();
    setError('');
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen py-8 px-4">
        <main className="rounded-xl bg-black text-purple-300 w-full max-w-2xl outline outline-offset-2 outline-zinc-700 shadow-2xl">
          
          {/* Header */}
          <div className="flex flex-col justify-center items-center my-6 mx-4">
            <div className="text-3xl my-4 font-sans font-semibold text-center">
              Upload to 0G Storage
            </div>
            <div className="text-sm text-zinc-400 text-center max-w-md">
              Store your images permanently on the decentralized 0G network
            </div>
          </div>

          <div className="p-6 mx-4 flex flex-col space-y-6">
            
            {/* Wallet Connection Warning */}
            {!isConnected && (
              <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">⚠️</span>
                  <div>
                    <p className="text-yellow-200 font-semibold">Wallet Not Connected</p>
                    <p className="text-yellow-300 text-sm mt-1">
                      Please connect your wallet to upload files and create posts
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload Section */}
            <div className="space-y-3">
              <label 
                className="block font-sans text-md font-semibold" 
                htmlFor="filepicker"
              >
                Select Image
              </label>
              
              <input
                id="filepicker"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading || creatingPost}
                className="block w-full text-purple-300 
                  file:mr-4 file:py-2 file:px-4 
                  file:rounded-lg file:border-0 
                  file:text-sm file:font-semibold 
                  file:bg-purple-400 file:text-white 
                  hover:file:bg-purple-500 
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  transition-colors cursor-pointer"
              />
              
              <p className="text-xs text-zinc-500">
                Supported formats: JPEG, PNG, GIF, WebP. Max size: 10MB
              </p>
            </div>

            {/* File Preview */}
            {filePreview && !fileUploaded && (
              <div className="bg-zinc-800 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-zinc-300 font-semibold mb-1">
                      Selected File
                    </p>
                    <p className="text-xs text-zinc-400 break-all">
                      {fileName}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Size: {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={handleCancel}
                    disabled={uploading}
                    className="ml-4 text-zinc-400 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>

                {/* Image Preview */}
                <div className="relative w-full h-48 bg-zinc-900 rounded-lg overflow-hidden">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Upload Button */}
                <button
                  onClick={uploadFile}
                  disabled={uploading || !isConnected}
                  className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg 
                    hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed 
                    transition-colors font-semibold"
                >
                  {uploading ? `Uploading... ${uploadProgress}%` : 'Upload to 0G Storage'}
                </button>
              </div>
            )}
            
            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="w-full bg-zinc-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Uploading to 0G Storage...</span>
                  <span className="text-purple-300 font-semibold">{uploadProgress}%</span>
                </div>
              </div>
            )}

            {/* Upload Success */}
            {fileUploaded && uploadDetails && (
              <div className="bg-green-900 border border-green-600 rounded-lg p-4 space-y-3">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✓</span>
                  <div className="flex-1">
                    <p className="text-green-200 font-semibold mb-2">
                      File Uploaded Successfully!
                    </p>
                    
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-green-300 font-semibold">File Hash:</span>
                        <p className="text-green-400 font-mono break-all mt-1">
                          {fileHash}
                        </p>
                      </div>
                    </div>

                    <a
                      href={uploadDetails.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-xs text-green-400 hover:text-green-300 underline"
                    >
                      View on 0G Storage ↗
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Toggle */}
            {fileUploaded && (
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-200 mb-1">
                      Post Privacy
                    </p>
                    <p className="text-xs text-zinc-400">
                      {isPrivate 
                        ? '🔒 Only you can see this post' 
                        : '🌍 Everyone can see this post'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPrivate(!isPrivate)}
                    disabled={creatingPost}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors
                      ${isPrivate ? 'bg-purple-600' : 'bg-zinc-600'}
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                        ${isPrivate ? 'translate-x-7' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                <div className="mt-3 text-xs text-zinc-500">
                  {isPrivate ? (
                    <p>✓ Private posts are only visible to you</p>
                  ) : (
                    <p>✓ Public posts appear in the global feed</p>
                  )}
                </div>
              </div>
            )}

            {/* Description Input */}
            {fileUploaded && (
              <div className="space-y-2">
                <label className="block font-sans text-md font-semibold">
                  Description (Optional)
                </label>
                <input
                  className="text-pink-500 rounded-md px-4 py-3 w-full 
                    outline outline-offset-2 outline-zinc-700 bg-zinc-900
                    focus:outline-purple-500 transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  type="text"
                  placeholder="Add a description for your post..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={creatingPost}
                  maxLength={200}
                />
                {description && (
                  <p className="text-xs text-zinc-500 text-right">
                    {description.length}/200 characters
                  </p>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-900 border border-red-600 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">⚠️</span>
                  <div>
                    <p className="text-red-200 font-semibold">Error</p>
                    <p className="text-red-300 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {fileUploaded && (
              <div className="flex gap-4 pt-4">
                <button
                  onClick={createPost}
                  disabled={creatingPost || !isConnected}
                  className="flex-1 rounded-xl bg-purple-400 outline outline-offset-2 outline-zinc-700 
                    hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed 
                    transition-colors py-3 px-6"
                >
                  <div className="text-xl font-sans font-semibold text-white">
                    {creatingPost ? 'Creating Post...' : `Create ${isPrivate ? 'Private' : 'Public'} Post`}
                  </div>
                </button>

                <button
                  onClick={handleCancel}
                  disabled={creatingPost}
                  className="rounded-xl bg-zinc-800 outline outline-offset-2 outline-zinc-700 
                    hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed 
                    transition-colors py-3 px-6"
                >
                  <div className="text-xl font-sans font-semibold text-white">
                    Cancel
                  </div>
                </button>
              </div>
            )}

            {/* Info Footer */}
            <div className="pt-4 border-t border-zinc-800">
              <div className="text-xs text-zinc-500 text-center space-y-1">
                <p>🔒 Powered by 0G Decentralized Storage Network</p>
                <p>Your files are stored permanently and censorship-resistant</p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}