/**
 * Manual Deployment Script for REAGENT Token
 * 
 * This script uses manual wallet address input instead of Tempo CLI commands.
 * Use this when Tempo CLI commands don't work from Node.js environment.
 * 
 * Usage:
 *   Set WALLET_ADDRESS environment variable or edit this file
 *   npm run reagent:deploy:manual
 */

import { ethers } from 'ethers';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// EDIT THIS: Your Tempo wallet address
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || '0x3d4ddbbbfea7d850e1a065b3c928c3b4f2f39bfb';

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
  'function setSupplyCap(uint256 cap) external',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)'
];

async function main() {
  console.log('🚀 REAGENT Token Manual Deployment\n');
  console.log('⚠️  WARNING: Deploying to TEMPO MAINNET with REAL tokens!\n');
  
  // Config
  const config = {
    rpcUrl: process.env.TEMPO_RPC_URL || MAINNET_RPC,
    chainId: parseInt(process.env.TEMPO_CHAIN_ID || MAINNET_CHAIN_ID.toString()),
    walletAddress: WALLET_ADDRESS,
    platformWalletAddress: process.env.PLATFORM_WALLET_ADDRESS || WALLET_ADDRESS,
    quoteTokenAddress: process.env.QUOTE_TOKEN_ADDRESS || '0x20c0000000000000000000000000000000000000'
  };
  
  console.log('📋 Deployment Configuration:');
  console.log(`   Network: Tempo Mainnet`);
  console.log(`   Chain ID: ${config.chainId}`);
  console.log(`   RPC: ${config.rpcUrl}`);
  console.log(`   Admin Wallet: ${config.walletAddress}`);
  console.log(`   Platform Wallet: ${config.platformWalletAddress}`);
  console.log(`   Quote Token: ${config.quoteTokenAddress}\n`);
  
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
  console.log('   Step 1: Preparing deployment transaction...');
  
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
  
  console.log(`   ✓ Transaction data saved to: ${txFile}`);
  console.log('\n   Step 2: Sending transaction via Tempo CLI...');
  console.log('   Command: tempo request ' + FACTORY_ADDRESS + ' --method POST --data @' + txFile);
  console.log('\n   Please run this command in your terminal:');
  console.log('   ----------------------------------------');
  console.log(`   cd ${path.dirname(txFile)}`);
  console.log(`   tempo request ${FACTORY_ADDRESS} --method POST --data @deploy-tx.json`);
  console.log('   ----------------------------------------\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('   Paste the transaction hash (0x...): ', async (txHash) => {
      rl.close();
      
      if (!txHash.startsWith('0x') || txHash.length !== 66) {
        console.error('   ❌ Invalid transaction hash');
        process.exit(1);
      }
      
      console.log(`\n   Transaction hash: ${txHash}`);
      console.log('   Waiting for confirmation...');
      
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      const receipt = await provider.waitForTransaction(txHash, 1, 120000);
      
      if (!receipt) {
        throw new Error('Transaction not confirmed');
      }
      
      console.log(`   ✓ Confirmed in block ${receipt.blockNumber}`);
      
      const tokenAddress = parseTokenAddress(receipt);
      console.log(`\n   ✅ REAGENT Token deployed: ${tokenAddress}`);
      
      // Clean up
      if (fs.existsSync(txFile)) {
        fs.unlinkSync(txFile);
      }
      
      resolve(tokenAddress);
    });
  });
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
  
  throw new Error('TokenCreated event not found in receipt');
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
  
  console.log(`   Granting ISSUER_ROLE to ${config.platformWalletAddress}...`);
  console.log(`   Transaction data saved to: ${txFile}`);
  console.log('\n   Please run this command in your terminal:');
  console.log('   ----------------------------------------');
  console.log(`   cd ${path.dirname(txFile)}`);
  console.log(`   tempo request ${tokenAddress} --method POST --data @grant-role-tx.json`);
  console.log('   ----------------------------------------\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('   Paste the transaction hash (0x...): ', (txHash) => {
      rl.close();
      console.log(`   Transaction hash: ${txHash}`);
      console.log('   ✓ ISSUER_ROLE granted');
      
      if (fs.existsSync(txFile)) {
        fs.unlinkSync(txFile);
      }
      
      resolve();
    });
  });
}

async function setSupplyCap(tokenAddress: string): Promise<void> {
  const token = new ethers.Interface(TIP20_ABI);
  const supplyCap = ethers.parseUnits('400000000', 6);
  const data = token.encodeFunctionData('setSupplyCap', [supplyCap]);
  
  const txData = { to: tokenAddress, data, value: '0' };
  const txFile = path.join(__dirname, 'set-cap-tx.json');
  fs.writeFileSync(txFile, JSON.stringify(txData, null, 2));
  
  console.log('   Setting supply cap to 400M REAGENT...');
  console.log(`   Transaction data saved to: ${txFile}`);
  console.log('\n   Please run this command in your terminal:');
  console.log('   ----------------------------------------');
  console.log(`   cd ${path.dirname(txFile)}`);
  console.log(`   tempo request ${tokenAddress} --method POST --data @set-cap-tx.json`);
  console.log('   ----------------------------------------\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('   Paste the transaction hash (0x...): ', (txHash) => {
      rl.close();
      console.log(`   Transaction hash: ${txHash}`);
      console.log('   ✓ Supply cap set');
      
      if (fs.existsSync(txFile)) {
        fs.unlinkSync(txFile);
      }
      
      resolve();
    });
  });
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
    deploymentMethod: 'manual-interactive'
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
  console.log('   3. Proceed to Phase 3');
  console.log('='.repeat(70));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Deployment failed:');
    console.error(error);
    process.exit(1);
  });
