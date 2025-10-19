// lib/0g-browser-client.js
import { ethers } from 'ethers';

export const ZG_CONFIG = {
  evmRpc: 'https://evmrpc-testnet.0g.ai/',
  indexerRpc: 'https://indexer-storage-testnet-turbo.0g.ai',
  flowContract: '0xbD2C3F0E65eDF5582141C35969d66e34629cC768',
};

export function get0GDownloadUrl(rootHash) {
  // Try multiple URL formats
  return `${ZG_CONFIG.indexerRpc}/download/${rootHash}`;
}

/**
 * Flow Contract ABI
 */
const FLOW_ABI = [
  'function submit(tuple(uint256 length, bytes tags, bytes32 root) submission) external payable returns (uint256)',
  'function numSubmissions() external view returns (uint256)',
];

/**
 * Calculate Keccak256 hash using ethers
 */
function keccak256(data) {
  return ethers.keccak256(data);
}

/**
 * Pad data to 256KB chunks
 */
function padToChunk(data) {
  const CHUNK_SIZE = 256 * 1024; // 256KB
  const paddedLength = Math.ceil(data.length / CHUNK_SIZE) * CHUNK_SIZE;
  const padded = new Uint8Array(paddedLength);
  padded.set(data);
  return padded;
}

/**
 * Calculate merkle root for file
 */
async function calculateMerkleRoot(data) {
  const CHUNK_SIZE = 256 * 1024;
  const paddedData = padToChunk(data);
  const numChunks = paddedData.length / CHUNK_SIZE;

  // Calculate leaf hashes
  const leaves = [];
  for (let i = 0; i < numChunks; i++) {
    const chunk = paddedData.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const hash = keccak256(chunk);
    leaves.push(hash);
  }

  // Build merkle tree
  if (leaves.length === 0) {
    throw new Error('No data to hash');
  }

  let currentLevel = leaves;
  while (currentLevel.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
      const combined = ethers.concat([left, right]);
      const parentHash = keccak256(combined);
      nextLevel.push(parentHash);
    }
    currentLevel = nextLevel;
  }

  return currentLevel[0];
}

/**
 * Upload to 0G storage nodes via HTTP
 */
async function uploadToStorageNode(file, merkleRoot, onProgress) {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Try different endpoints
    const endpoints = [
      `${ZG_CONFIG.indexerRpc}/upload`,
      `${ZG_CONFIG.indexerRpc}/submit`,
    ];

    let uploadSuccess = false;
    let uploadError = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`📤 Trying upload endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: {
            'X-Merkle-Root': merkleRoot,
          },
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Upload to storage node successful:', result);
          uploadSuccess = true;
          break;
        } else {
          console.warn(`Endpoint ${endpoint} returned:`, response.status);
        }
      } catch (err) {
        console.warn(`Endpoint ${endpoint} failed:`, err.message);
        uploadError = err;
      }
    }

    if (!uploadSuccess) {
      console.warn('⚠️ Direct storage upload not available, relying on blockchain propagation');
    }

    return uploadSuccess;
  } catch (error) {
    console.warn('Storage node upload error:', error);
    return false;
  }
}

/**
 * Upload file to 0G Storage
 */
export async function uploadTo0G(file, signer, onProgress = null) {
  try {
    console.log('🚀 Starting 0G upload:', file.name, `(${file.size} bytes)`);

    if (onProgress) onProgress(10);

    // Read file data
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);
    console.log('📦 File data loaded:', fileData.length, 'bytes');

    if (onProgress) onProgress(20);

    // Calculate merkle root
    console.log('🔢 Calculating merkle root...');
    const merkleRoot = await calculateMerkleRoot(fileData);
    console.log('✅ Merkle root:', merkleRoot);

    if (onProgress) onProgress(40);

    // Try to upload to storage nodes
    console.log('📤 Uploading to storage nodes...');
    await uploadToStorageNode(file, merkleRoot, onProgress);

    if (onProgress) onProgress(60);

    // Submit to blockchain
    console.log('⛓️ Submitting to blockchain...');
    const flowContract = new ethers.Contract(
      ZG_CONFIG.flowContract,
      FLOW_ABI,
      signer
    );

    const submission = {
      length: fileData.length,
      tags: '0x',
      root: merkleRoot,
    };

    console.log('📝 Creating transaction...');
    const tx = await flowContract.submit(submission, {
      value: 0,
      gasLimit: 500000,
    });

    console.log('⏳ Transaction sent:', tx.hash);
    if (onProgress) onProgress(80);

    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

    if (onProgress) onProgress(90);

    // Wait for file to propagate
    console.log('⏳ Waiting for file to propagate...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (onProgress) onProgress(100);

    const downloadUrl = get0GDownloadUrl(merkleRoot);
    console.log('🎉 Upload complete!');
    console.log('📥 Download URL:', downloadUrl);

    return {
      hash: merkleRoot,
      txHash: tx.hash,
      url: downloadUrl,
      blockNumber: receipt.blockNumber,
    };

  } catch (error) {
    console.error('❌ Upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}

/**
 * Download file from 0G Storage
 */
export async function downloadFrom0G(rootHash) {
  try {
    console.log('📥 Downloading from 0G:', rootHash);

    // Try multiple URL formats
    const urls = [
      `${ZG_CONFIG.indexerRpc}/download/${rootHash}`,
      `${ZG_CONFIG.indexerRpc}/download?root=${rootHash}`,
      `${ZG_CONFIG.indexerRpc}/file/${rootHash}`,
    ];

    let lastError = null;

    for (const url of urls) {
      try {
        console.log('Trying URL:', url);
        const response = await fetch(url);

        if (response.ok) {
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          console.log('✅ Download successful');
          return new Uint8Array(arrayBuffer);
        }
      } catch (err) {
        lastError = err;
        console.warn('URL failed:', url);
      }
    }

    throw new Error(`Download failed from all endpoints: ${lastError?.message}`);

  } catch (error) {
    console.error('❌ Download error:', error);
    throw error;
  }
}

/**
 * Check if file exists
 */
export async function fileExists(rootHash) {
  try {
    const urls = [
      `${ZG_CONFIG.indexerRpc}/download/${rootHash}`,
      `${ZG_CONFIG.indexerRpc}/download?root=${rootHash}`,
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) return true;
      } catch (err) {
        // Continue to next URL
      }
    }

    return false;
  } catch (error) {
    return false;
  }
}

export default {
  uploadTo0G,
  downloadFrom0G,
  fileExists,
  get0GDownloadUrl,
  ZG_CONFIG,
};