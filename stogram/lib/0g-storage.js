// lib/0g-storage.js

import { Indexer, ZgFile, getFlowContract } from '@0g-chain/0g-ts-sdk';
import { ethers } from 'ethers';
import { ZG_CONFIG, get0GDownloadUrl } from './0g-config';

/**
 * Initialize 0G Storage Indexer
 */
function getIndexer() {
  return new Indexer(ZG_CONFIG.indexerRpc);
}

/**
 * Calculate how many segments a file needs
 * @param {number} fileSize - Size of file in bytes
 * @returns {number} Number of segments needed
 */
function calculateSegments(fileSize) {
  const SEGMENT_SIZE = 256 * 1024; // 256KB per segment
  return Math.ceil(fileSize / SEGMENT_SIZE);
}

/**
 * Upload file to 0G Storage
 * @param {File} file - File object from input
 * @param {ethers.Signer} signer - Ethers signer from wallet
 * @param {Function} onProgress - Progress callback (percentage)
 * @returns {Promise<{hash: string, txHash: string, url: string}>}
 */
export async function uploadTo0G(file, signer, onProgress = null) {
  try {
    console.log('Starting 0G upload for file:', file.name);
    
    // Step 1: Convert File to ArrayBuffer and then to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);
    
    console.log('File size:', fileData.length, 'bytes');
    
    // Step 2: Create ZgFile instance
    const zgFile = new ZgFile(fileData);
    
    // Step 3: Calculate file's Merkle root hash
    const rootHash = await zgFile.merkleRoot();
    console.log('File merkle root:', rootHash);
    
    // Step 4: Get indexer and select storage nodes
    const indexer = getIndexer();
    const segmentCount = calculateSegments(fileData.length);
    
    console.log('Selecting storage nodes for', segmentCount, 'segments...');
    
    const nodes = await indexer.selectNodes({
      segmentCount,
      expectedReplicas: ZG_CONFIG.expectedReplicas,
    });
    
    if (!nodes || nodes.length === 0) {
      throw new Error('No storage nodes available');
    }
    
    console.log('Selected', nodes.length, 'storage nodes');
    
    // Step 5: Get Flow contract
    const flowContract = getFlowContract(await signer.provider, signer);
    
    // Step 6: Upload with progress tracking
    let lastProgress = 0;
    
    const [txHash, error] = await zgFile.upload({
      evmRpc: ZG_CONFIG.evmRpc,
      contract: flowContract,
      nodes,
      tags: '0x',
      onProgress: (currentSegment, totalSegments) => {
        const progress = Math.round((currentSegment / totalSegments) * 100);
        if (progress > lastProgress) {
          lastProgress = progress;
          console.log(`Upload progress: ${progress}%`);
          if (onProgress) {
            onProgress(progress);
          }
        }
      },
    });
    
    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload failed: ${error}`);
    }
    
    console.log('Upload successful! Transaction hash:', txHash);
    
    return {
      hash: rootHash,
      txHash,
      url: get0GDownloadUrl(rootHash),
    };
    
  } catch (error) {
    console.error('Error in uploadTo0G:', error);
    throw new Error(`Failed to upload to 0G Storage: ${error.message}`);
  }
}

/**
 * Download file from 0G Storage
 * @param {string} rootHash - File's merkle root hash
 * @param {boolean} withProof - Whether to verify merkle proof
 * @returns {Promise<Uint8Array>} File data
 */
export async function downloadFrom0G(rootHash, withProof = false) {
  try {
    console.log('Downloading file from 0G:', rootHash);
    
    const indexer = getIndexer();
    const fileData = await indexer.download(rootHash, withProof);
    
    if (!fileData) {
      throw new Error('File not found on 0G Storage');
    }
    
    console.log('Download successful, size:', fileData.length, 'bytes');
    return fileData;
    
  } catch (error) {
    console.error('Error downloading from 0G:', error);
    throw new Error(`Failed to download from 0G Storage: ${error.message}`);
  }
}

/**
 * Check if file exists on 0G Storage
 * @param {string} rootHash - File's merkle root hash
 * @returns {Promise<boolean>}
 */
export async function fileExists(rootHash) {
  try {
    const indexer = getIndexer();
    const status = await indexer.getFileStatus(rootHash);
    return status !== null;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

/**
 * Get file info from 0G Storage
 * @param {string} rootHash - File's merkle root hash
 * @returns {Promise<Object|null>}
 */
export async function getFileInfo(rootHash) {
  try {
    const indexer = getIndexer();
    return await indexer.getFileInfo(rootHash);
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
}