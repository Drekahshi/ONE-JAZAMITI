const hre = require("hardhat");

async function main() {
    console.log("Deploying contracts to Harmony Testnet...");

    // 1. Deploy OJZ Token
    const OJZToken = await hre.ethers.getContractFactory("OJZToken");
    const ojzToken = await OJZToken.deploy();
    await ojzToken.waitForDeployment();
    const ojzAddress = await ojzToken.getAddress();
    console.log(`OJZToken deployed to: ${ojzAddress}`);

    // 2. Deploy Tree Registry
    const TreeRegistry = await hre.ethers.getContractFactory("TreeRegistry");
    const treeRegistry = await TreeRegistry.deploy();
    await treeRegistry.waitForDeployment();
    const registryAddress = await treeRegistry.getAddress();
    console.log(`TreeRegistry deployed to: ${registryAddress}`);

    // 3. Deploy Staking Contract
    const Staking = await hre.ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(ojzAddress);
    await staking.waitForDeployment();
    const stakingAddress = await staking.getAddress();
    console.log(`Staking deployed to: ${stakingAddress}`);

    console.log("Deployment complete!");
    console.log("----------------------------------------------------");
    console.log("Copy these addresses to your .env file or frontend config:");
    console.log(`REACT_APP_OJZ_TOKEN_ADDRESS=${ojzAddress}`);
    console.log(`REACT_APP_TREE_REGISTRY_ADDRESS=${registryAddress}`);
    console.log(`REACT_APP_STAKING_ADDRESS=${stakingAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
