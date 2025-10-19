// lib/0g-sdk-wrapper.js
// This file acts as a bridge to handle the SDK properly

let SDK_LOADED = false;
let Indexer, ZgFile, getFlowContract;

// Dynamically import SDK (only works on client-side)
async function loadSDK() {
  if (SDK_LOADED) return true;
  
  try {
    const sdk = await import('@0glabs/0g-ts-sdk');
    Indexer = sdk.Indexer;
    ZgFile = sdk.ZgFile;
    getFlowContract = sdk.getFlowContract;
    SDK_LOADED = true;
    return true;
  } catch (error) {
    console.error('Failed to load 0G SDK:', error);
    return false;
  }
}

export const ZG_CONFIG = {
  evmRpc: 'https://evmrpc-testnet.0g.ai/',
  indexerRpc: 'https://indexer-storage-testnet-turbo.0g.ai',
};

export function get0GDownloadUrl(rootHash) {
  return `https://rpc-storage-testnet.0g.ai/download/${rootHash}`;
}

export async function uploadTo0G(file, signer, onProgress = null) {
  try {
    // Load SDK
    const loaded = await loadSDK();
    if (!loaded) {
      throw new Error('Failed to load 0G SDK');
    }

    console.log('🚀 Starting upload with official SDK');

    // Convert file
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    if (onProgress) onProgress(20);

    // Create ZgFile
    const zgFile = new ZgFile(fileData);
    const merkleRoot = await zgFile.merkleRoot();
    console.log('✅ Merkle root:', merkleRoot);

    if (onProgress) onProgress(40);

    // Select nodes
    const indexer = new Indexer(ZG_CONFIG.indexerRpc);
    const numSegments = Math.ceil(fileData.length / (256 * 1024));
    const nodes = await indexer.selectNodes(numSegments, 1);
    
    console.log('✅ Selected nodes:', nodes);

    if (onProgress) onProgress(60);

    // Get flow contract
    const flowContract = getFlowContract(signer.provider, signer);

    // Upload
    const [txHash, error] = await zgFile.upload({
      evmRpc: ZG_CONFIG.evmRpc,
      contract: flowContract,
      nodes,
      tags: '0x',
      onProgress: (current, total) => {
        const progress = 60 + Math.round((current / total) * 40);
        if (onProgress) onProgress(progress);
      },
    });

    if (error) {
      throw new Error(`Upload failed: ${error}`);
    }

    console.log('🎉 Upload complete!', txHash);

    return {
      hash: merkleRoot,
      txHash,
      url: get0GDownloadUrl(merkleRoot),
    };

  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

export async function downloadFrom0G(rootHash) {
  const loaded = await loadSDK();
  if (!loaded) {
    throw new Error('Failed to load 0G SDK');
  }

  const indexer = new Indexer(ZG_CONFIG.indexerRpc);
  return await indexer.download(rootHash, false);
}

export async function fileExists(rootHash) {
  try {
    const loaded = await loadSDK();
    if (!loaded) return false;

    const indexer = new Indexer(ZG_CONFIG.indexerRpc);
    const status = await indexer.getFileStatus(rootHash);
    return status !== null;
  } catch (error) {
    return false;
  }
}