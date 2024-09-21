import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import ProjectNFTABI from '../scdata/ProjectNFT.json'; // Replace with your ABI file


const ProjectNFTPage = () => {
    const [account, setAccount] = useState('');
    const [projectNFTs, setProjectNFTs] = useState([]);
    const [ownedNFTs, setOwnedNFTs] = useState([]);
    const [form, setForm] = useState({ name: '', description: '', image: '', price: '' });
    const contractAddress = '0xCf9DEAac5A764Dc0487843904F52a7684ac4619F'; // Replace with your contract address

    const pinataApi = import.meta.env.VITE_PINATA_API;
    const pinataSApi = import.meta.env.VITE_PINATA_SECRET_API;

    useEffect(() => {
        const loadAccount = async () => {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setAccount(address);
            await fetchNFTs();
            await fetchOwnedNFTs(address);
        };

        loadAccount();
    }, []);

    const fetchNFTs = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, ProjectNFTABI.abi, provider);
        const nfts = await contract.listAllNFTs();
        setProjectNFTs(nfts[1]);
    };

    const fetchOwnedNFTs = async (address) => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, ProjectNFTABI.abi, provider);
        const nfts = await contract.getOwnedNFTsWithDetails(address);
        setOwnedNFTs(nfts);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const uploadToPinata = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            body: formData,
            headers: {
                pinata_api_key: pinataApi,
                pinata_secret_api_key: pinataSApi,
            },
        });

        const data = await response.json();
        return data.IpfsHash; // Return the IPFS hash
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        const ipfsHash = await uploadToPinata(file);
        setForm({ ...form, image: ipfsHash });
    };

    const createProjectNFT = async (e) => {
        e.preventDefault();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, ProjectNFTABI.abi, signer);

        try {
            // Price is already in Wei; no conversion needed
            const transaction = await contract.createProjectNFT(form.name, form.description, form.image, form.price);
            await transaction.wait();
            await fetchNFTs();
            setForm({ name: '', description: '', image: '', price: '' });
        } catch (error) {
            console.error("Error creating NFT:", error);
        }
    };

    const buyNFT = async (tokenId, price) => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, ProjectNFTABI.abi, signer);

        const transaction = await contract.buyNFT(tokenId, { value: price });
        await transaction.wait();
        await fetchNFTs();
        await fetchOwnedNFTs(account);
    };

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold">Project NFT Marketplace</h1>
            <form onSubmit={createProjectNFT} className="mt-5">
                <input name="name" onChange={handleChange} placeholder="Project Name" required className="border p-2" />
                <input name="description" onChange={handleChange} placeholder="Description" required className="border p-2" />
                <input type="file" onChange={handleImageUpload} required className="border p-2" />
                <input
                    name="price"
                    type="number"
                    onChange={handleChange}
                    placeholder="Price (in Wei)"
                    required
                    className="border p-2"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 mt-2">Create Project NFT</button>
            </form>

            <h2 className="mt-10 text-xl font-semibold">All Project NFTs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {projectNFTs.map((nft, index) => (
                    <div key={index} className="border p-4">
                        <h3 className="font-bold">{nft.name}</h3>
                        <p>{nft.description}</p>
                        <img src={`https://ipfs.io/ipfs/${nft.ipfsHash}`} alt={nft.name} className="w-full h-auto" />
                        <p>Price: {parseFloat(nft.price)} Wei</p>
                        <button onClick={() => buyNFT(nft.tokenId, nft.price)} className="bg-green-500 text-white p-2 mt-2">Buy NFT</button>
                    </div>
                ))}
            </div>

            <h2 className="mt-10 text-xl font-semibold">Your Owned NFTs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {ownedNFTs.map((nft, index) => (
                    <div key={index} className="border p-4">
                        <h3 className="font-bold">{nft.name}</h3>
                        <p>{nft.description}</p>
                        <img src={`https://ipfs.io/ipfs/${nft.ipfsHash}`} alt={nft.name} className="w-full h-auto" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectNFTPage;