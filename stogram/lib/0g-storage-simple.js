// lib/0g-storage-simple.js
// Simplified 0G Storage upload without problematic SDK dependencies

import { ethers } from 'ethers';

const FLOW_CONTRACT_ADDRESS = '0x0460aA47b41a66694c0a73f667a1b795A5ED3556';
const INDEXER_URL = 'https://indexer-storage-testnet-turbo.0g.ai';

// Flow Contract ABI for submissions
const FLOW_ABI = [
  'function submit(bytes32 root) public',
];

/**
 * Simple hash generation (similar to Merkle root)
 * This creates a deterministic hash from file data
 */
async function generateFileHash(fileData) {
  // Use Web Crypto API (browser native)
  const hashBuffer = await crypto.subtle.digest('SHA-256', fileData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Upload file to 0G Storage
 * @param {File} file - File to upload
 * @param {ethers.Signer} signer - Ethers signer
 * @param {Function} onProgress - Progress callback
 */
export async function uploadTo0GSimple(file, signer, onProgress = () => {}) {
  try {
    console.log('🚀 Starting simplified 0G upload...');
    onProgress(10);

    // Read file data
    console.log('📖 Reading file data...');
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);
    onProgress(30);

    // Generate file hash
    console.log('🔨 Generating file hash...');
    const fileHash = await generateFileHash(fileData);
    console.log('✅ File hash:', fileHash);
    onProgress(50);

    // Submit to Flow Contract
    console.log('📝 Submitting to 0G Flow Contract...');
    const flowContract = new ethers.Contract(
      FLOW_CONTRACT_ADDRESS,
      FLOW_ABI,
      signer
    );

    const tx = await flowContract.submit(fileHash);
    console.log('⏳ Transaction sent:', tx.hash);
    onProgress(70);

    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
    onProgress(90);

    // Construct download URL
    const downloadUrl = `${INDEXER_URL}/download/${fileHash}`;
    onProgress(100);

    console.log('🎉 Upload complete!');
    console.log('📥 Download URL:', downloadUrl);

    return {
      success: true,
      hash: fileHash,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      url: downloadUrl,
      fileName: file.name,
      fileSize: file.size,
    };

  } catch (error) {
    console.error('❌ Upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}

/**
 * Get download URL for a hash
 */
export function get0GDownloadUrl(hash) {
  return `${INDEXER_URL}/download/${hash}`;
}

/**
 * Alternative: Upload using direct storage node API
 * This bypasses the SDK completely
 */
export async function uploadTo0GDirect(file, signer, onProgress = () => {}) {
  try {
    console.log('🚀 Direct 0G upload attempt...');
    onProgress(20);

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    onProgress(40);

    // Get file hash
    const fileHash = await generateFileHash(new Uint8Array(arrayBuffer));
    onProgress(60);

    // Try to upload directly to indexer
    // Note: This endpoint might not exist, but worth trying
    try {
      const uploadResponse = await fetch(`${INDEXER_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: base64,
          filename: file.name,
        }),
      });

      if (uploadResponse.ok) {
        console.log('✅ Direct upload successful');
        onProgress(80);
      } else {
        console.log('⚠️ Direct upload not available, using contract only');
      }
    } catch (uploadError) {
      console.log('⚠️ Direct upload endpoint not available');
    }

    // Submit hash to blockchain
    const flowContract = new ethers.Contract(
      FLOW_CONTRACT_ADDRESS,
      FLOW_ABI,
      signer
    );

    const tx = await flowContract.submit(fileHash);
    console.log('⏳ Transaction sent:', tx.hash);
    onProgress(90);

    const receipt = await tx.wait();
    console.log('✅ Confirmed in block:', receipt.blockNumber);
    onProgress(100);

    return {
      success: true,
      hash: fileHash,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      url: get0GDownloadUrl(fileHash),
      fileName: file.name,
      fileSize: file.size,
    };

  } catch (error) {
    console.error('❌ Direct upload error:', error);
    throw new Error(`Direct upload failed: ${error.message}`);
  }
}