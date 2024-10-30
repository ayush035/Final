import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import ImageNFTABI from '@/contracts/ImageNFTABI.json';

// Replace this with your contract address after deployment
const contractAddress = '0xc60F19e7415F1b703C44a9bD767bFDCe59aF787b';

export const getProviderOrSigner = async (needSigner = false) => {
    const web3Modal = new Web3Modal();
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    if (needSigner) {
        return provider.getSigner();
    }
    return provider;
};

export const mintNFT = async (tokenURI) => {
    const signer = await getProviderOrSigner(true);
    const contract = new ethers.Contract(contractAddress, ImageNFTABI, signer);
    const tx = await contract.mintNFT(tokenURI);
    await tx.wait();
    return tx;
};

export const getUserNFTs = async (address) => {
    const provider = await getProviderOrSigner();
    const contract = new ethers.Contract(contractAddress, ImageNFTABI, provider);
    const nfts = await contract.getUserNFTs(address);
    return nfts;
};
