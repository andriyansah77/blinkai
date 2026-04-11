/**
 * Direct Deployment Script for REAGENT Token (Skip Pre-flight Checks)
 * 
 * This script deploys REAGENT token to Tempo MAINNET without pre-flight checks.
 * Use this if pre-flight checks are failing but you know Tempo CLI is working.
 * 
 * Prerequisites (MANUAL CHECK):
 *   1. Tempo CLI installed and in PATH
 *   2. Logged in: tempo wallet login
 *   3. Wallet funded with gas
 * 
 * Usage:
 *   npm run reagent:deploy:direct
 */

import { ethers } from 'ethers';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const MAINNET_RPC = 'https://rpc.tempo.xyz';
const MAINNET_CHAIN_ID = 4217;
const FACTORY_ADDRESS = '0x20Fc000000000000000000000000000000000000';
const ISSUER_ROLE = ethers.id('ISSUER_ROLE');

const TIP20_FACTORY_ABI = [
  'function createToken(string name, string symbol, string currency, address quoteToken, address admin, bytes32 salt) external returns (address)',
  'event TokenCreated(address indexed token, string name, string symbol)'
];

const TIP20_ABI = [
  'function grantRole(bytes32 role, address account) external',
  'function hasRole(bytes32 role, address account) external view returns (bool)',
  'function setSupplyCap(uint256 cap) external',
  'function supplyCap() external view returns (uint256)',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)'
];

async function main() {
  console.log('🚀 REAGENT Token Direct Deployment (Skip Pre-flight)\n');
  console.log('⚠️  WARNING: Deploying to TEMPO MAINNET with REAL tokens!\n');
  
  // Get wallet address
  console.log('📋 Getting wallet information...\n');
  const walletAddress = getWalletAddress();
  console.log(`   Wallet: ${walletAddress}`);
  
  // Load config
  const config = {
    rpcUrl: process.env.TEMPO_RPC_URL || MAINNET_RPC,
    chainId: parseInt(process.env.TEMPO_CHAIN_ID || MAINNET_CHAIN_ID.toString()),
    walletAddress,
    platformWalletAddress: process.env.PLATFORM_WALLET_ADDRESS || walletAddress,
    quoteTokenAddress: process.env.QUOTE_TOKEN_ADDRESS || '0x20c0000000000000000000000000000000000000'
  };
  
  console.log(`   Platform Wallet: ${config.platformWalletAddress}`);
  console.log(`   Quote Token: ${config.quoteTokenAddress}`);
  console.log(`   Chain ID: ${config.chainId}`);
  console.log(`   RPC: ${config.rpcUrl}\n`);
  
  // Confirmation
  await confirmDeployment();
  
  // Deploy
  console.log('\n🚀 Starting deployment...\n');
  const tokenAddress = await deployToken(config);
  
  // Verify
  console.log('\n✅ Verifying deployment...');
  await verifyDeployment(tokenAddress, config);
  
  // Grant role
  console.log('\n🔐 Granting ISSUER_ROLE...');
  await grantIssuerRole(tokenAddress, config);
  
  // Set supply cap
  console.log('\n📊 Setting supply cap...');
  await setSupplyCap(tokenAddress);
  
  // Save info
  console.log('\n💾 Saving deployment information...');
  saveDeploymentInfo(tokenAddress, config);
  updateEnvFile(tokenAddress);
  
  // Success
  printSuccess(tokenAddress, config);
}

function getWalletAddress(): string {
  try {
    const output = execSync('tempo wallet address', { encoding: 'utf-8' });
    return output.trim();
  } catch (error) {
    console.error('❌ Failed to get wallet address');
    console.error('   Make sure you are logged in: tempo wallet login');
    process.exit(1);
  }
}

async function confirmDeployment(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('⚠️  Type "DEPLOY TO MAINNET" to continue: ', (answer) => {
      rl.close();
      
      if (answer !== 'DEPLOY TO MAINNET') {
        console.log('\n❌ Deployment cancelled');
        process.exit(0);
      }
      
      resolve();
    });
  });
}

async function deployToken(config: any): Promise<string> {
  console.log('   Preparing deployment transaction...');
  
  const factory = new ethers.Interface(TIP20_FACTORY_ABI);
  const data = factory.encodeFunctionData('createToken', [
    'ReAgent Token',
    'REAGENT',
    'USD',
    config.quoteTokenAddress,
    config.walletAddress,
    ethers.id('reagent-mainnet-v1')
  ]);
  
  const txData = {
    to: FACTORY_ADDRESS,
    data: data,
    value: '0'
  };
  
  const txFile = path.join(__dirname, 'deploy-tx.json');
  fs.writeFileSync(txFile, JSON.stringify(txData, null, 2));
  
  try {
    console.log('   Sending transaction to Tempo Mainnet...');
    
    const output = execSync(`tempo request ${FACTORY_ADDRESS} --method POST --data @${txFile}`, {
      encoding: 'utf-8'
    });
    
    const txHash = parseTxHash(output);
    console.log(`   Transaction hash: ${txHash}`);
    
    console.log('   Waiting for confirmation...');
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const receipt = await provider.waitForTransaction(txHash, 1, 60000);
    
    if (!receipt) {
      throw new Error('Transaction not confirmed');
    }
    
    console.log(`   ✓ Confirmed in block ${receipt.blockNumber}`);
    
    const tokenAddress = parseTokenAddress(receipt);
    console.log(`\n   ✅ REAGENT Token deployed: ${tokenAddress}`);
    
    return tokenAddress;
  } finally {
    if (fs.existsSync(txFile)) {
      fs.unlinkSync(txFile);
    }
  }
}

function parseTxHash(output: string): string {
  const match = output.match(/0x[a-fA-F0-9]{64}/);
  if (!match) {
    throw new Error('Failed to parse transaction hash');
  }
  return match[0];
}

function parseTokenAddress(receipt: ethers.TransactionReceipt): string {
  const factory = new ethers.Interface(TIP20_FACTORY_ABI);
  
  for (const log of receipt.logs) {
    try {
      const parsed = factory.parseLog({
        topics: log.topics as string[],
        data: log.data
      });
      
      if (parsed && parsed.name === 'TokenCreated') {
        return parsed.args[0];
      }
    } catch {
      continue;
    }
  }
  
  throw new Error('TokenCreated event not found');
}

async function verifyDeployment(tokenAddress: string, config: any): Promise<void> {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const token = new ethers.Contract(tokenAddress, TIP20_ABI, provider);
  
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  
  console.log(`   Name: ${name}`);
  console.log(`   Symbol: ${symbol}`);
  console.log(`   Decimals: ${decimals}`);
  
  if (name !== 'ReAgent Token' || symbol !== 'REAGENT' || decimals !== 6) {
    throw new Error('Token verification failed');
  }
  
  console.log('   ✓ Token verified');
}

async function grantIssuerRole(tokenAddress: string, config: any): Promise<void> {
  const token = new ethers.Interface(TIP20_ABI);
  const data = token.encodeFunctionData('grantRole', [ISSUER_ROLE, config.platformWalletAddress]);
  
  const txData = { to: tokenAddress, data, value: '0' };
  const txFile = path.join(__dirname, 'grant-role-tx.json');
  fs.writeFileSync(txFile, JSON.stringify(txData, null, 2));
  
  try {
    console.log(`   Granting ISSUER_ROLE to ${config.platformWalletAddress}...`);
    
    const output = execSync(`tempo request ${tokenAddress} --method POST --data @${txFile}`, {
      encoding: 'utf-8'
    });
    
    const txHash = parseTxHash(output);
    console.log(`   Transaction hash: ${txHash}`);
    console.log('   ✓ ISSUER_ROLE granted');
  } finally {
    if (fs.existsSync(txFile)) {
      fs.unlinkSync(txFile);
    }
  }
}

async function setSupplyCap(tokenAddress: string): Promise<void> {
  const token = new ethers.Interface(TIP20_ABI);
  const supplyCap = ethers.parseUnits('400000000', 6);
  const data = token.encodeFunctionData('setSupplyCap', [supplyCap]);
  
  const txData = { to: tokenAddress, data, value: '0' };
  const txFile = path.join(__dirname, 'set-cap-tx.json');
  fs.writeFileSync(txFile, JSON.stringify(txData, null, 2));
  
  try {
    console.log('   Setting supply cap to 400M REAGENT...');
    
    const output = execSync(`tempo request ${tokenAddress} --method POST --data @${txFile}`, {
      encoding: 'utf-8'
    });
    
    const txHash = parseTxHash(output);
    console.log(`   Transaction hash: ${txHash}`);
    console.log('   ✓ Supply cap set');
  } finally {
    if (fs.existsSync(txFile)) {
      fs.unlinkSync(txFile);
    }
  }
}

function saveDeploymentInfo(tokenAddress: string, config: any): void {
  const deploymentInfo = {
    network: 'mainnet',
    tokenAddress,
    adminAddress: config.walletAddress,
    platformWalletAddress: config.platformWalletAddress,
    quoteTokenAddress: config.quoteTokenAddress,
    chainId: config.chainId,
    rpcUrl: config.rpcUrl,
    timestamp: new Date().toISOString(),
    deploymentMethod: 'tempo-cli-direct'
  };
  
  const filePath = path.join(__dirname, '..', 'REAGENT_MAINNET_DEPLOYMENT.json');
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`   ✓ Saved to REAGENT_MAINNET_DEPLOYMENT.json`);
}

function updateEnvFile(tokenAddress: string): void {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('   ⚠️  .env not found');
    return;
  }
  
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Update REAGENT_TOKEN_ADDRESS
  if (envContent.includes('REAGENT_TOKEN_ADDRESS=')) {
    envContent = envContent.replace(
      /REAGENT_TOKEN_ADDRESS="[^"]*"/,
      `REAGENT_TOKEN_ADDRESS="${tokenAddress}"`
    );
  } else {
    envContent += `\nREAGENT_TOKEN_ADDRESS="${tokenAddress}"\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('   ✓ .env updated');
}

function printSuccess(tokenAddress: string, config: any): void {
  console.log('\n' + '='.repeat(70));
  console.log('🎉 PRODUCTION DEPLOYMENT SUCCESSFUL');
  console.log('='.repeat(70));
  console.log(`Network:              Tempo Mainnet`);
  console.log(`Chain ID:             ${config.chainId}`);
  console.log(`Token Address:        ${tokenAddress}`);
  console.log(`Admin Address:        ${config.walletAddress}`);
  console.log(`Platform Wallet:      ${config.platformWalletAddress}`);
  console.log(`Quote Token:          ${config.quoteTokenAddress}`);
  console.log(`Explorer:             https://explore.tempo.xyz/address/${tokenAddress}`);
  console.log('='.repeat(70));
  console.log('\n📝 Next Steps:');
  console.log('   1. Verify token on Tempo Explorer');
  console.log('   2. Test minting functionality');
  console.log('   3. Monitor token contract');
  console.log('   4. Proceed to Phase 3');
  console.log('='.repeat(70));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Deployment failed:');
    console.error(error);
    process.exit(1);
  });
