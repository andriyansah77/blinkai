/**
 * Deploy REAGENT Token on Tempo Network
 * 
 * This script deploys the REAGENT token using TIP20Factory precompiled contract
 * and performs all necessary setup including role grants and supply cap.
 * 
 * Usage:
 *   npx ts-node scripts/deploy-reagent-token.ts
 * 
 * Environment Variables Required:
 *   - TEMPO_RPC_URL: Tempo Network RPC endpoint
 *   - TEMPO_CHAIN_ID: Tempo Network chain ID
 *   - PLATFORM_ADMIN_PRIVATE_KEY: Private key for admin wallet (will grant roles)
 *   - PLATFORM_WALLET_ADDRESS: Address that will receive ISSUER_ROLE
 *   - QUOTE_TOKEN_ADDRESS: USD-denominated TIP-20 token for DEX pairing
 */

import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// TIP20Factory ABI (precompiled contract)
const TIP20_FACTORY_ABI = [
  'function createToken(string name, string symbol, string currency, address quoteToken, address admin, bytes32 salt) external returns (address)',
  'event TokenCreated(address indexed token, string name, string symbol)'
];

// TIP20 Token ABI (minimal interface needed)
const TIP20_ABI = [
  'function grantRole(bytes32 role, address account) external',
  'function hasRole(bytes32 role, address account) external view returns (bool)',
  'function setSupplyCap(uint256 cap) external',
  'function supplyCap() external view returns (uint256)',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)',
  'function mint(address to, uint256 amount) external'
];

// Constants
const FACTORY_ADDRESS = '0x20Fc000000000000000000000000000000000000';
const ISSUER_ROLE = ethers.id('ISSUER_ROLE');
const DEFAULT_ADMIN_ROLE = ethers.ZeroHash; // 0x00...00

interface DeploymentConfig {
  name: string;
  symbol: string;
  currency: string;
  decimals: number;
  supplyCap: string;
  salt: string;
}

interface DeploymentResult {
  tokenAddress: string;
  adminAddress: string;
  platformWalletAddress: string;
  quoteTokenAddress: string;
  txHash: string;
  blockNumber: number;
  gasUsed: string;
  timestamp: string;
}

async function main() {
  console.log('🚀 Starting REAGENT Token Deployment on Tempo Network\n');

  // Load environment variables
  const config = loadConfig();
  
  // Setup provider and signer
  const { provider, adminSigner } = await setupProvider(config);
  
  // Verify network
  await verifyNetwork(provider, config);
  
  // Deploy token
  console.log('📝 Deploying REAGENT token...');
  const tokenAddress = await deployToken(adminSigner, config);
  
  // Verify deployment
  console.log('\n✅ Verifying deployment...');
  await verifyDeployment(tokenAddress, provider);
  
  // Grant ISSUER_ROLE
  console.log('\n🔐 Granting ISSUER_ROLE to platform wallet...');
  await grantIssuerRole(tokenAddress, adminSigner, config.platformWalletAddress);
  
  // Set supply cap
  console.log('\n📊 Setting supply cap to 400M REAGENT...');
  await setSupplyCap(tokenAddress, adminSigner);
  
  // Test minting
  console.log('\n🧪 Testing mint function...');
  await testMinting(tokenAddress, adminSigner, config.platformWalletAddress);
  
  // Save deployment info
  console.log('\n💾 Saving deployment information...');
  const deploymentInfo = await saveDeploymentInfo(
    tokenAddress,
    adminSigner.address,
    config
  );
  
  // Update .env file
  console.log('\n📝 Updating .env file...');
  updateEnvFile(tokenAddress);
  
  // Print summary
  printSummary(deploymentInfo);
  
  console.log('\n✅ Deployment completed successfully!');
  console.log('\n⚠️  IMPORTANT: Update your .env file with the REAGENT_TOKEN_ADDRESS');
  console.log(`   REAGENT_TOKEN_ADDRESS="${tokenAddress}"`);
}

function loadConfig() {
  console.log('📋 Loading configuration...');
  
  const rpcUrl = process.env.TEMPO_RPC_URL;
  const chainId = process.env.TEMPO_CHAIN_ID;
  const adminPrivateKey = process.env.PLATFORM_ADMIN_PRIVATE_KEY;
  const platformWalletAddress = process.env.PLATFORM_WALLET_ADDRESS;
  const quoteTokenAddress = process.env.QUOTE_TOKEN_ADDRESS;
  
  if (!rpcUrl) {
    throw new Error('TEMPO_RPC_URL not set in environment');
  }
  if (!chainId) {
    throw new Error('TEMPO_CHAIN_ID not set in environment');
  }
  if (!adminPrivateKey) {
    throw new Error('PLATFORM_ADMIN_PRIVATE_KEY not set in environment');
  }
  if (!platformWalletAddress) {
    throw new Error('PLATFORM_WALLET_ADDRESS not set in environment');
  }
  if (!quoteTokenAddress) {
    throw new Error('QUOTE_TOKEN_ADDRESS not set in environment');
  }
  
  console.log(`   RPC URL: ${rpcUrl}`);
  console.log(`   Chain ID: ${chainId}`);
  console.log(`   Platform Wallet: ${platformWalletAddress}`);
  console.log(`   Quote Token: ${quoteTokenAddress}`);
  
  return {
    rpcUrl,
    chainId: parseInt(chainId),
    adminPrivateKey,
    platformWalletAddress,
    quoteTokenAddress
  };
}

async function setupProvider(config: any) {
  console.log('\n🔌 Connecting to Tempo Network...');
  
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const adminSigner = new ethers.Wallet(config.adminPrivateKey, provider);
  
  // Check connection
  const network = await provider.getNetwork();
  console.log(`   Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
  
  // Check admin balance
  const balance = await provider.getBalance(adminSigner.address);
  console.log(`   Admin address: ${adminSigner.address}`);
  console.log(`   Admin balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance === BigInt(0)) {
    throw new Error('Admin wallet has no balance for gas fees');
  }
  
  return { provider, adminSigner };
}

async function verifyNetwork(provider: ethers.JsonRpcProvider, config: any) {
  const network = await provider.getNetwork();
  
  if (Number(network.chainId) !== config.chainId) {
    throw new Error(
      `Network mismatch: Expected ${config.chainId}, got ${network.chainId}`
    );
  }
  
  console.log('   ✓ Network verified');
}

async function deployToken(
  adminSigner: ethers.Wallet,
  config: any
): Promise<string> {
  const deployConfig: DeploymentConfig = {
    name: 'ReAgent Token',
    symbol: 'REAGENT',
    currency: 'USD',
    decimals: 6,
    supplyCap: '400000000', // 400M
    salt: ethers.id('reagent-v1')
  };
  
  console.log(`   Token Name: ${deployConfig.name}`);
  console.log(`   Token Symbol: ${deployConfig.symbol}`);
  console.log(`   Currency: ${deployConfig.currency}`);
  console.log(`   Decimals: ${deployConfig.decimals}`);
  console.log(`   Supply Cap: ${deployConfig.supplyCap} REAGENT`);
  
  // Create factory contract instance
  const factory = new ethers.Contract(
    FACTORY_ADDRESS,
    TIP20_FACTORY_ABI,
    adminSigner
  );
  
  console.log('\n   Sending deployment transaction...');
  
  // Deploy token
  const tx = await factory.createToken(
    deployConfig.name,
    deployConfig.symbol,
    deployConfig.currency,
    config.quoteTokenAddress,
    adminSigner.address,
    deployConfig.salt
  );
  
  console.log(`   Transaction hash: ${tx.hash}`);
  console.log('   Waiting for confirmation...');
  
  const receipt = await tx.wait();
  
  console.log(`   ✓ Confirmed in block ${receipt.blockNumber}`);
  console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
  
  // Parse TokenCreated event to get token address
  const tokenCreatedEvent = receipt.logs.find((log: any) => {
    try {
      const parsed = factory.interface.parseLog(log);
      return parsed?.name === 'TokenCreated';
    } catch {
      return false;
    }
  });
  
  if (!tokenCreatedEvent) {
    throw new Error('TokenCreated event not found in transaction receipt');
  }
  
  const parsedEvent = factory.interface.parseLog(tokenCreatedEvent);
  const tokenAddress = parsedEvent?.args[0];
  
  console.log(`\n   ✅ Token deployed at: ${tokenAddress}`);
  
  return tokenAddress;
}

async function verifyDeployment(
  tokenAddress: string,
  provider: ethers.JsonRpcProvider
) {
  const token = new ethers.Contract(tokenAddress, TIP20_ABI, provider);
  
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  const totalSupply = await token.totalSupply();
  
  console.log(`   Name: ${name}`);
  console.log(`   Symbol: ${symbol}`);
  console.log(`   Decimals: ${decimals}`);
  console.log(`   Total Supply: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
  
  if (name !== 'ReAgent Token' || symbol !== 'REAGENT' || decimals !== 6) {
    throw new Error('Token deployment verification failed');
  }
  
  console.log('   ✓ Deployment verified');
}

async function grantIssuerRole(
  tokenAddress: string,
  adminSigner: ethers.Wallet,
  platformWalletAddress: string
) {
  const token = new ethers.Contract(tokenAddress, TIP20_ABI, adminSigner);
  
  // Check if role already granted
  const hasRole = await token.hasRole(ISSUER_ROLE, platformWalletAddress);
  
  if (hasRole) {
    console.log('   ✓ ISSUER_ROLE already granted');
    return;
  }
  
  console.log(`   Granting ISSUER_ROLE to ${platformWalletAddress}...`);
  
  const tx = await token.grantRole(ISSUER_ROLE, platformWalletAddress);
  console.log(`   Transaction hash: ${tx.hash}`);
  
  const receipt = await tx.wait();
  console.log(`   ✓ Confirmed in block ${receipt.blockNumber}`);
  
  // Verify role granted
  const hasRoleAfter = await token.hasRole(ISSUER_ROLE, platformWalletAddress);
  
  if (!hasRoleAfter) {
    throw new Error('Failed to grant ISSUER_ROLE');
  }
  
  console.log('   ✓ ISSUER_ROLE granted successfully');
}

async function setSupplyCap(
  tokenAddress: string,
  adminSigner: ethers.Wallet
) {
  const token = new ethers.Contract(tokenAddress, TIP20_ABI, adminSigner);
  
  const supplyCap = ethers.parseUnits('400000000', 6); // 400M with 6 decimals
  
  console.log(`   Setting supply cap to ${ethers.formatUnits(supplyCap, 6)} REAGENT...`);
  
  const tx = await token.setSupplyCap(supplyCap);
  console.log(`   Transaction hash: ${tx.hash}`);
  
  const receipt = await tx.wait();
  console.log(`   ✓ Confirmed in block ${receipt.blockNumber}`);
  
  // Verify supply cap
  const capAfter = await token.supplyCap();
  
  if (capAfter !== supplyCap) {
    throw new Error('Failed to set supply cap');
  }
  
  console.log(`   ✓ Supply cap set to ${ethers.formatUnits(capAfter, 6)} REAGENT`);
}

async function testMinting(
  tokenAddress: string,
  adminSigner: ethers.Wallet,
  platformWalletAddress: string
) {
  const token = new ethers.Contract(tokenAddress, TIP20_ABI, adminSigner);
  
  // Get platform wallet signer
  const platformPrivateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
  
  if (!platformPrivateKey) {
    console.log('   ⚠️  PLATFORM_WALLET_PRIVATE_KEY not set, skipping mint test');
    return;
  }
  
  const platformSigner = new ethers.Wallet(
    platformPrivateKey,
    adminSigner.provider
  );
  
  const tokenWithPlatformSigner = new ethers.Contract(
    tokenAddress,
    TIP20_ABI,
    platformSigner
  );
  
  // Mint 10,000 REAGENT (test amount)
  const mintAmount = ethers.parseUnits('10000', 6);
  
  console.log(`   Minting ${ethers.formatUnits(mintAmount, 6)} REAGENT to platform wallet...`);
  
  const balanceBefore = await token.totalSupply();
  
  const tx = await tokenWithPlatformSigner.mint(platformWalletAddress, mintAmount);
  console.log(`   Transaction hash: ${tx.hash}`);
  
  const receipt = await tx.wait();
  console.log(`   ✓ Confirmed in block ${receipt.blockNumber}`);
  
  const balanceAfter = await token.totalSupply();
  const minted = balanceAfter - balanceBefore;
  
  // Convert to string for comparison to avoid bigint type issues
  if (minted.toString() !== mintAmount.toString()) {
    throw new Error('Mint test failed: incorrect amount minted');
  }
  
  console.log(`   ✓ Mint test successful: ${ethers.formatUnits(minted, 6)} REAGENT minted`);
}

async function saveDeploymentInfo(
  tokenAddress: string,
  adminAddress: string,
  config: any
): Promise<DeploymentResult> {
  const deploymentInfo: DeploymentResult = {
    tokenAddress,
    adminAddress,
    platformWalletAddress: config.platformWalletAddress,
    quoteTokenAddress: config.quoteTokenAddress,
    txHash: '', // Will be filled from actual deployment
    blockNumber: 0,
    gasUsed: '0',
    timestamp: new Date().toISOString()
  };
  
  const deploymentPath = path.join(
    __dirname,
    '..',
    'REAGENT_DEPLOYMENT.json'
  );
  
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`   ✓ Deployment info saved to ${deploymentPath}`);
  
  return deploymentInfo;
}

function updateEnvFile(tokenAddress: string) {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('   ⚠️  .env file not found, skipping update');
    return;
  }
  
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Check if REAGENT_TOKEN_ADDRESS already exists
  if (envContent.includes('REAGENT_TOKEN_ADDRESS=')) {
    // Update existing
    envContent = envContent.replace(
      /REAGENT_TOKEN_ADDRESS=.*/,
      `REAGENT_TOKEN_ADDRESS="${tokenAddress}"`
    );
  } else {
    // Add new
    envContent += `\n# REAGENT Token (deployed on Tempo Network)\nREAGENT_TOKEN_ADDRESS="${tokenAddress}"\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('   ✓ .env file updated');
}

function printSummary(deploymentInfo: DeploymentResult) {
  console.log('\n' + '='.repeat(70));
  console.log('📋 DEPLOYMENT SUMMARY');
  console.log('='.repeat(70));
  console.log(`Token Address:          ${deploymentInfo.tokenAddress}`);
  console.log(`Admin Address:          ${deploymentInfo.adminAddress}`);
  console.log(`Platform Wallet:        ${deploymentInfo.platformWalletAddress}`);
  console.log(`Quote Token:            ${deploymentInfo.quoteTokenAddress}`);
  console.log(`Timestamp:              ${deploymentInfo.timestamp}`);
  console.log('='.repeat(70));
  console.log('\n📝 Next Steps:');
  console.log('   1. Verify token on Tempo Explorer: https://explorer.tempo.xyz');
  console.log('   2. Update .env with REAGENT_TOKEN_ADDRESS');
  console.log('   3. Test minting functionality');
  console.log('   4. Proceed with Phase 3 implementation');
  console.log('='.repeat(70));
}

// Run deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Deployment failed:');
    console.error(error);
    process.exit(1);
  });
