// lib/0g-sdk-client.js
import { Indexer, ZgFile, getFlowContract } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';

export const ZG_CONFIG = {
  evmRpc: 'https://evmrpc-testnet.0g.ai/',
  indexerRpc: 'https://indexer-storage-testnet-turbo.0g.ai',
  flowContract: '0xbD2C3F0E65eDF5582141C35969d66e34629cC768',
  expectedReplicas: 1,
};

export function get0GDownloadUrl(rootHash) {
  return `${ZG_CONFIG.indexerRpc}/download?root=${rootHash}`;
}

export async function uploadTo0G(file, signer, onProgress = null) {
  try {
    console.log('🚀 Starting 0G SDK upload:', file.name);

    // Convert File to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    if (onProgress) onProgress(10);

    // Create ZgFile
    const zgFile = new ZgFile(fileData);
    const merkleRoot = await zgFile.merkleRoot();
    console.log('✅ Merkle root:', merkleRoot);

    if (onProgress) onProgress(30);

    // Select nodes
    const indexer = new Indexer(ZG_CONFIG.indexerRpc);
    const numSegments = Math.ceil(fileData.length / (256 * 1024));
    
    const selectedNodes = await indexer.selectNodes(numSegments, ZG_CONFIG.expectedReplicas);
    console.log('✅ Selected nodes:', selectedNodes.length);

    if (onProgress) onProgress(50);

    // Get flow contract
    const flowContract = getFlowContract(signer.provider, signer);

    // Upload
    const [txHash, error] = await zgFile.upload({
      evmRpc: ZG_CONFIG.evmRpc,
      contract: flowContract,
      nodes: selectedNodes,
      tags: '0x',
      onProgress: (current, total) => {
        const progress = 50 + Math.round((current / total) * 50);
        if (onProgress) onProgress(progress);
      },
    });

    if (error) {
      throw new Error(`Upload failed: ${error}`);
    }

    console.log('🎉 Upload complete!');

    return {
      hash: merkleRoot,
      txHash,
      url: get0GDownloadUrl(merkleRoot),
    };

  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
}

export async function downloadFrom0G(rootHash) {
  try {
    const indexer = new Indexer(ZG_CONFIG.indexerRpc);
    const fileData = await indexer.download(rootHash, false);
    return fileData;
  } catch (error) {
    console.error('❌ Download error:', error);
    throw error;
  }
}

export async function fileExists(rootHash) {
  try {
    const indexer = new Indexer(ZG_CONFIG.indexerRpc);
    const status = await indexer.getFileStatus(rootHash);
    return status !== null;
  } catch (error) {
    return false;
  }
}