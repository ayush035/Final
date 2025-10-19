// lib/0g-http-client.js
import { ethers } from 'ethers';

/**
 * 0G Storage Configuration
 */
export const ZG_CONFIG = {
  // Network Configuration
  network: 'testnet',
  
  // RPC Endpoints
  evmRpc: 'https://evmrpc-testnet.0g.ai/',
  indexerRpc: 'https://indexer-storage-testnet-turbo.0g.ai',
  
  // Flow Contract Address (testnet)
  flowContract: '0xbD2C3F0E65eDF5582141C35969d66e34629cC768',
  
  // Storage Configuration
  expectedReplicas: 1,
};

/**
 * Get download URL for a file
 */
export function get0GDownloadUrl(rootHash) {
  return `${ZG_CONFIG.indexerRpc}/download?root=${rootHash}`;
}

/**
 * Flow Contract ABI for submit function
 */
const FLOW_CONTRACT_ABI = [
  'function submit(tuple(uint256 length, bytes tags, bytes32[] nodes) submission) external payable',
  'function numSubmissions() external view returns (uint256)',
];

/**
 * Chunk size for 0G (256 KB)
 */
const CHUNK_SIZE = 256 * 1024;

/**
 * Pad data to chunk size
 */
function padData(data) {
  const paddedLength = Math.ceil(data.length / CHUNK_SIZE) * CHUNK_SIZE;
  const padded = new Uint8Array(paddedLength);
  padded.set(data);
  return padded;
}

/**
 * Calculate merkle tree for data
 */
async function calculateMerkleTree(data) {
  const paddedData = padData(data);
  const numChunks = Math.ceil(paddedData.length / CHUNK_SIZE);
  
  // Calculate leaf nodes (hash each chunk)
  const leaves = [];
  for (let i = 0; i < numChunks; i++) {
    const chunk = paddedData.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const hash = ethers.keccak256(chunk);
    leaves.push(hash);
  }
  
  // Build merkle tree
  let currentLevel = leaves;
  while (currentLevel.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
      const combined = ethers.solidityPacked(['bytes32', 'bytes32'], [left, right]);
      const parentHash = ethers.keccak256(combined);
      nextLevel.push(parentHash);
    }
    currentLevel = nextLevel;
  }
  
  return {
    root: currentLevel[0],
    leaves: leaves,
  };
}

/**
 * Select storage nodes
 */
async function selectNodes(numChunks) {
  try {
    const response = await fetch(`${ZG_CONFIG.indexerRpc}/nodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        numChunks,
        replicas: ZG_CONFIG.expectedReplicas,
      }),
    });

    if (!response.ok) {
      // If node selection endpoint doesn't exist, use default nodes
      console.warn('Node selection endpoint not available, using default configuration');
      return [{
        url: ZG_CONFIG.indexerRpc,
        address: '0x0000000000000000000000000000000000000000',
      }];
    }

    const nodes = await response.json();
    return nodes && nodes.length > 0 ? nodes : [{
      url: ZG_CONFIG.indexerRpc,
      address: '0x0000000000000000000000000000000000000000',
    }];
  } catch (error) {
    console.warn('Error selecting nodes:', error);
    return [{
      url: ZG_CONFIG.indexerRpc,
      address: '0x0000000000000000000000000000000000000000',
    }];
  }
}

/**
 * Upload file data to storage nodes
 */
async function uploadToNodes(file, merkleRoot, nodes, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('root', merkleRoot);

  let uploadSuccess = false;
  let lastError = null;

  // Try uploading to each node
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodeUrl = node.url || ZG_CONFIG.indexerRpc;

    try {
      console.log(`📤 Uploading to node ${i + 1}/${nodes.length}: ${nodeUrl}`);

      const uploadUrl = `${nodeUrl}/upload`;
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Upload successful to node ${i + 1}:`, result);
        uploadSuccess = true;
        
        if (onProgress) {
          onProgress(60 + (i + 1) / nodes.length * 20);
        }
        
        break; // Success, no need to try other nodes
      } else {
        const errorText = await response.text();
        lastError = new Error(`Node ${i + 1} upload failed: ${errorText}`);
        console.warn(lastError.message);
      }
    } catch (error) {
      lastError = error;
      console.warn(`Error uploading to node ${i + 1}:`, error.message);
    }
  }

  if (!uploadSuccess) {
    console.warn('⚠️ File upload to nodes failed, but will proceed with blockchain submission');
    console.warn('The file may need to be re-uploaded or may become available later');
  }

  return uploadSuccess;
}

/**
 * Upload file to 0G Storage
 */
export async function uploadTo0G(file, signer, onProgress = null) {
  try {
    console.log('🚀 Starting 0G upload:', file.name);
    console.log('📦 File size:', file.size, 'bytes');

    if (onProgress) onProgress(5);

    // Step 1: Read file data
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    if (onProgress) onProgress(15);

    // Step 2: Calculate merkle tree
    console.log('🔢 Calculating merkle tree...');
    const { root: merkleRoot, leaves } = await calculateMerkleTree(fileData);
    console.log('✅ Merkle root:', merkleRoot);

    if (onProgress) onProgress(30);

    // Step 3: Select storage nodes
    const numChunks = Math.ceil(fileData.length / CHUNK_SIZE);
    console.log('📡 Selecting storage nodes for', numChunks, 'chunks...');
    const nodes = await selectNodes(numChunks);
    console.log('✅ Selected', nodes.length, 'node(s)');

    if (onProgress) onProgress(40);

    // Step 4: Upload file data to storage nodes
    console.log('📤 Uploading file data to storage nodes...');
    const uploadSuccess = await uploadToNodes(file, merkleRoot, nodes, onProgress);

    if (onProgress) onProgress(70);

    // Step 5: Submit to blockchain
    console.log('⛓️ Submitting to blockchain...');
    const address = await signer.getAddress();
    console.log('👤 Uploader address:', address);

    const flowContract = new ethers.Contract(
      ZG_CONFIG.flowContract,
      FLOW_CONTRACT_ABI,
      signer
    );

    // Prepare submission data
    const submission = {
      length: fileData.length,
      tags: '0x',
      nodes: leaves, // Include all leaf nodes
    };

    console.log('📝 Creating blockchain transaction...');
    const tx = await flowContract.submit(submission, {
      value: 0, // No payment for testnet
      gasLimit: 500000, // Adjust if needed
    });

    console.log('⏳ Transaction sent:', tx.hash);
    if (onProgress) onProgress(85);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

    if (onProgress) onProgress(95);

    // Step 6: Verify file is accessible
    console.log('🔍 Verifying file accessibility...');
    const downloadUrl = get0GDownloadUrl(merkleRoot);
    
    // Wait a bit for the file to propagate
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let accessible = false;
    try {
      const verifyResponse = await fetch(downloadUrl, { method: 'HEAD' });
      accessible = verifyResponse.ok;
      console.log(accessible ? '✅ File is accessible' : '⚠️ File not yet accessible');
    } catch (error) {
      console.warn('⚠️ File verification pending');
    }

    if (onProgress) onProgress(100);

    console.log('🎉 Upload complete!');

    return {
      hash: merkleRoot,
      txHash: tx.hash,
      url: downloadUrl,
      blockNumber: receipt.blockNumber,
      accessible,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        numChunks,
        uploadSuccess,
      },
    };

  } catch (error) {
    console.error('❌ Upload error:', error);

    let errorMessage = error.message;
    if (error.code === 'ACTION_REJECTED') {
      errorMessage = 'Transaction was rejected by user';
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = 'Insufficient funds for gas fees';
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = 'Network error - please check your connection';
    }

    throw new Error(`Failed to upload to 0G Storage: ${errorMessage}`);
  }
}

/**
 * Download file from 0G Storage
 */
export async function downloadFrom0G(rootHash, withProof = false) {
  try {
    console.log('📥 Downloading from 0G:', rootHash);

    const url = get0GDownloadUrl(rootHash);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    console.log('✅ Download complete, size:', fileData.length, 'bytes');

    // Optional: Verify merkle root
    if (withProof) {
      console.log('🔍 Verifying merkle proof...');
      const { root } = await calculateMerkleTree(fileData);
      if (root.toLowerCase() !== rootHash.toLowerCase()) {
        throw new Error('Merkle proof verification failed');
      }
      console.log('✅ Merkle proof verified');
    }

    return fileData;

  } catch (error) {
    console.error('❌ Download error:', error);
    throw new Error(`Failed to download from 0G Storage: ${error.message}`);
  }
}

/**
 * Check if file exists on 0G Storage
 */
export async function fileExists(rootHash) {
  try {
    const url = get0GDownloadUrl(rootHash);
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

/**
 * Get file info from 0G Storage
 */
export async function getFileInfo(rootHash) {
  try {
    const response = await fetch(`${ZG_CONFIG.indexerRpc}/file-info?root=${rootHash}`);

    if (!response.ok) {
      return null;
    }

    const info = await response.json();
    return info;

  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
}

export default {
  uploadTo0G,
  downloadFrom0G,
  fileExists,
  getFileInfo,
  get0GDownloadUrl,
  ZG_CONFIG,
};