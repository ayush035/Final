// lib/0g-storage-upload.js
// Correct 0G Storage implementation using official SDK

import { Indexer } from '@0glabs/0g-ts-sdk';

// 0G Network Configuration
const INDEXER_RPC = 'https://indexer-storage-testnet-turbo.0g.ai';
const RPC_URL = 'https://evmrpc-testnet.0g.ai';

/**
 * Upload file to 0G Storage using the official SDK
 * @param {File} file - The file to upload
 * @param {ethers.Signer} signer - Ethers signer for transaction signing
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Upload result with hash and URL
 */
export async function uploadTo0GStorage(file, signer, onProgress = () => {}) {
  try {
    console.log('🚀 Starting 0G Storage upload...');
    console.log('File:', file.name, 'Size:', file.size, 'bytes');
    
    onProgress(10);

    // Initialize indexer
    console.log('📡 Connecting to 0G Indexer:', INDEXER_RPC);
    const indexer = new Indexer(INDEXER_RPC);
    onProgress(20);

    // Convert File to Uint8Array
    console.log('📦 Converting file to binary data...');
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    onProgress(30);

    // Create 0G Blob from binary data
    console.log('🔨 Creating 0G Blob object...');
    const { Blob: ZGBlob } = await import('@0glabs/0g-ts-sdk');
    const zgFile = new ZGBlob(uint8Array);
    onProgress(40);

    // Generate Merkle tree
    console.log('🌳 Generating Merkle tree...');
    const [tree, treeErr] = await zgFile.merkleTree();
    if (treeErr !== null) {
      throw new Error(`Merkle tree generation failed: ${treeErr}`);
    }
    
    const rootHash = tree.rootHash();
    console.log('✅ Root hash generated:', rootHash);
    onProgress(50);

    // Upload to 0G network
    console.log('☁️ Uploading to 0G Storage Network...');
    console.log('Using RPC:', RPC_URL);
    
    const [txHash, uploadErr] = await indexer.upload(zgFile, RPC_URL, signer);
    
    if (uploadErr !== null) {
      throw new Error(`Upload failed: ${uploadErr}`);
    }
    
    console.log('✅ Upload successful!');
    console.log('Transaction hash:', txHash);
    onProgress(80);

    // Close the file
    await zgFile.close();
    onProgress(90);

    // Construct download URL
    const downloadUrl = `${INDEXER_RPC}/download/${rootHash}`;
    
    console.log('📥 Download URL:', downloadUrl);
    onProgress(100);

    return {
      success: true,
      hash: rootHash,
      txHash: txHash,
      url: downloadUrl,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
    };

  } catch (error) {
    console.error('❌ 0G Storage upload error:', error);
    throw new Error(`Failed to upload to 0G Storage: ${error.message}`);
  }
}

/**
 * Get download URL for a file hash
 * @param {string} rootHash - The root hash of the file
 * @returns {string} Download URL
 */
export function get0GDownloadUrl(rootHash) {
  return `${INDEXER_RPC}/download/${rootHash}`;
}

/**
 * Download file from 0G Storage
 * @param {string} rootHash - The root hash of the file
 * @returns {Promise<Blob>} File blob
 */
export async function downloadFrom0GStorage(rootHash) {
  try {
    const url = get0GDownloadUrl(rootHash);
    console.log('📥 Downloading from 0G:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('✅ Download complete');
    return blob;
    
  } catch (error) {
    console.error('❌ Download error:', error);
    throw new Error(`Failed to download: ${error.message}`);
  }
}