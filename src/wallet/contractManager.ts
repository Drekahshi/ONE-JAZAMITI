import { ethers } from 'ethers';
import { walletManager } from './walletManager';

// Contract ABIs (Simplified for MVP, ideally import from artifacts)
const OJZ_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

const REGISTRY_ABI = [
    "function plantTree(string treeType, string location, string photoUrl)",
    "function getUserTreeCount(address user) view returns (uint256)",
    "event TreePlanted(uint256 indexed id, address indexed planter, string treeType, string location)"
];

const STAKING_ABI = [
    "function stake(uint256 amount)",
    "function withdraw(uint256 amount)",
    "function getStake(address user) view returns (uint256)",
    "function calculateRewards(address user) view returns (uint256)"
];

// Addresses (Should be loaded from env or config)
// For now, using placeholders - User needs to deploy and update these
const OJZ_ADDRESS = process.env.REACT_APP_OJZ_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
const REGISTRY_ADDRESS = process.env.REACT_APP_TREE_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000";
const STAKING_ADDRESS = process.env.REACT_APP_STAKING_ADDRESS || "0x0000000000000000000000000000000000000000";

class ContractManager {
    private provider: ethers.BrowserProvider | null = null;
    private signer: ethers.JsonRpcSigner | null = null;

    private ojzContract: ethers.Contract | null = null;
    private registryContract: ethers.Contract | null = null;
    private stakingContract: ethers.Contract | null = null;

    async initialize() {
        // @ts-ignore
        if (window.onewallet && window.onewallet.ethereum) {
            // @ts-ignore
            this.provider = new ethers.BrowserProvider(window.onewallet.ethereum);
            this.signer = await this.provider.getSigner();

            this.ojzContract = new ethers.Contract(OJZ_ADDRESS, OJZ_ABI, this.signer);
            this.registryContract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, this.signer);
            this.stakingContract = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, this.signer);

            console.log("Contracts initialized");
        }
    }

    async plantTree(treeType: string, location: string, photoUrl: string) {
        if (!this.registryContract) await this.initialize();
        if (!this.registryContract) throw new Error("Contracts not initialized");

        console.log(`Planting tree: ${treeType} at ${location}`);
        const tx = await this.registryContract.plantTree(treeType, location, photoUrl);
        await tx.wait();
        return tx.hash;
    }

    async stakeTokens(amount: string) {
        if (!this.stakingContract || !this.ojzContract) await this.initialize();
        if (!this.stakingContract || !this.ojzContract) throw new Error("Contracts not initialized");

        const amountWei = ethers.parseEther(amount);

        // Approve first
        console.log("Approving tokens...");
        const approveTx = await this.ojzContract.approve(STAKING_ADDRESS, amountWei);
        await approveTx.wait();

        // Stake
        console.log("Staking tokens...");
        const tx = await this.stakingContract.stake(amountWei);
        await tx.wait();
        return tx.hash;
    }

    async getStakedBalance(address: string): Promise<string> {
        if (!this.stakingContract) await this.initialize();
        if (!this.stakingContract) return "0";

        try {
            const balance = await this.stakingContract.getStake(address);
            return ethers.formatEther(balance);
        } catch (e) {
            console.error("Error fetching staked balance", e);
            return "0";
        }
    }
}

export const contractManager = new ContractManager();
