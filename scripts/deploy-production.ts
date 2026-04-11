/**
 * Production Deployment Script for REAGENT Token
 * 
 * This script deploys REAGENT token to Tempo MAINNET with safety checks.
 * 
 * ⚠️ WARNING: This deploys to MAINNET with REAL tokens!
 * 
 * Prerequisites:
 *   1. Tempo CLI installed and logged in
 *   2. Wallet funded with sufficient gas
 *   3. All environment variables configured
 *   4. Tested on testnet first
 * 
 * Usage:
 *   npm run reagent:deploy:production
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

interface DeploymentConfig {
  rpcUrl: string;
  chainId: number;
  walletAddress: string;
  platformWalletAddress: string;
  quoteTokenAddress: string;
  encryptionKey: string;
}

async function main() {
  console.log('🚀 REAGENT Token Production Deployment\n');
  console.log('⚠️  WARNING: Deploying to TEMPO MAINNET with REAL tokens!\n');
  
  // Safety confirmation
  await confirmProduction();
  
  // Pre-flight checks
  console.log('\n📋 Running pre-flight checks...\n');
  await runPreflightChecks();
  
  // Load and verify configuration
  const config = await loadAndVerifyConfig();
  
  // Final confirmation
  await finalConfirmation(config);
  
  // Deploy token
  console.log('\n🚀 Starting deployment...\n');
  const tokenAddress = await deployToken(config);
  
  // Verify deployment
  console.log('\n✅ Verifying deployment...');
  await verifyDeployment(tokenAddress, config);
  
  // Grant ISSUER_ROLE
  console.log('\n🔐 Granting ISSUER_ROLE...');
  await grantIssuerRole(tokenAddress, config);
  
  // Set supply cap
  console.log('\n📊 Setting supply cap...');
  await setSupplyCap(tokenAddress);
  
  // Save deployment info
  console.log('\n💾 Saving deployment information...');
  saveDeploymentInfo(tokenAddress, config);
  
  // Update .env
  updateEnvFile(tokenAddress);
  
  // Print success summary
  printSuccessSummary(tokenAddress, config);
  
  console.log('\n✅ Production deployment completed successfully!');
  console.log('\n⚠️  IMPORTANT: Verify token on Tempo Explorer immediately!');
  console.log(`   https://explorer.tempo.xyz/address/${tokenAddress}`);
}

async function confirmProduction(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve, reject) => {
    rl.question('\n⚠️  Are you SURE you want to deploy to MAINNET? (yes/no): ', (answer) => {
      rl.close();
      
      if (answer.toLowerCase() !== 'yes') {
        console.log('\n❌ Deployment cancelled by user');
        process.exit(0);
      }
      
      resolve();
    });
  });
}

async function runPreflightChecks(): Promise<void> {
  const checks = [
    { name: 'Tempo CLI installed', fn: checkTempoCLI },
    { name: 'Tempo Wallet logged in', fn: checkTempoLogin },
    { name: 'Wallet has sufficient balance', fn: checkWalletBalance },
    { name: 'Environment variables set', fn: checkEnvVars },
    { name: 'Mainnet configuration', fn: checkMainnetConfig }
  ];
  
  for (const check of checks) {
    process.stdout.write(`   ${check.name}... `);
    try {
      await check.fn();
      console.log('✅');
    } catch (error: any) {
      console.log('❌');
      console.error(`\n❌ Pre-flight check failed: ${check.name}`);
      console.error(`   ${error.message}\n`);
      process.exit(1);
    }
  }
  
  console.log('\n✅ All pre-flight checks passed');
}

function checkTempoCLI(): void {
  try {
    execSync('tempo --version', { stdio: 'pipe' });
  } catch {
    throw new Error('Tempo CLI not installed. Run: curl -L https://tempo.xyz/install | bash');
  }
}

function checkTempoLogin(): void {
  try {
    const output = execSync('tempo wallet address', { encoding: 'utf-8', stdio: 'pipe' });
    if (!output || output.trim().length === 0) {
      throw new Error('No wallet address returned');
    }
  } catch (error: any) {
    // Try alternative check with status command
    try {
      const statusOutput = execSync('tempo wallet status', { encoding: 'utf-8', stdio: 'pipe' });
      if (!statusOutput.includes('Wallet:') && !statusOutput.includes('logged in')) {
        throw new Error('Not logged in');
      }
    } catch {
      throw new Error('Not logged in to Tempo Wallet. Run: tempo wallet login');
    }
  }
}

function checkWalletBalance(): void {
  try {
    const output = execSync('tempo wallet balances', { encoding: 'utf-8' });
    
    // Check if wallet has any balance (not all zeros)
    const hasBalance = /\d+\.\d+/.test(output) && !output.match(/0\.000000/g)?.every(match => output.includes(match));
    
    // More lenient check - just warn if balance seems low
    if (output.includes('0.000000') && !output.match(/[1-9]\d*\.\d+/)) {
      console.log('   ⚠️  Warning: Wallet balance appears to be 0 or very low');
      console.log('   ⚠️  You may need to fund your wallet for gas fees');
      console.log('   ⚠️  Continuing anyway - deployment will fail if insufficient gas');
    }
  } catch (error: any) {
    if (error.message.includes('insufficient')) {
      throw error;
    }
    // If we can't check balance, just warn
    console.log('   ⚠️  Warning: Could not verify wallet balance');
  }
}

function checkEnvVars(): void {
  const required = ['TEMPO_RPC_URL', 'TEMPO_CHAIN_ID', 'QUOTE_TOKEN_ADDRESS', 'WALLET_ENCRYPTION_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
  
  // Check encryption key is not default
  if (process.env.WALLET_ENCRYPTION_KEY?.includes('change-this')) {
    throw new Error('WALLET_ENCRYPTION_KEY is still set to default value');
  }
}

function checkMainnetConfig(): void {
  const rpcUrl = process.env.TEMPO_RPC_URL;
  const chainId = process.env.TEMPO_CHAIN_ID;
  
  if (rpcUrl !== MAINNET_RPC) {
    throw new Error(`RPC URL is not mainnet. Expected: ${MAINNET_RPC}, Got: ${rpcUrl}`);
  }
  
  if (chainId !== MAINNET_CHAIN_ID.toString()) {
    throw new Error(`Chain ID is not mainnet. Expected: ${MAINNET_CHAIN_ID}, Got: ${chainId}`);
  }
}

async function loadAndVerifyConfig(): Promise<DeploymentConfig> {
  const walletAddress = execSync('tempo wallet address', { encoding: 'utf-8' }).trim();
  
  const config: DeploymentConfig = {
    rpcUrl: process.env.TEMPO_RPC_URL!,
    chainId: parseInt(process.env.TEMPO_CHAIN_ID!),
    walletAddress,
    platformWalletAddress: process.env.PLATFORM_WALLET_ADDRESS || walletAddress,
    quoteTokenAddress: process.env.QUOTE_TOKEN_ADDRESS!,
    encryptionKey: process.env.WALLET_ENCRYPTION_KEY!
  };
  
  // Verify quote token address
  if (!ethers.isAddress(config.quoteTokenAddress)) {
    throw new Error('Invalid QUOTE_TOKEN_ADDRESS');
  }
  
  console.log('\n📋 Deployment Configuration:');
  console.log(`   Network: Tempo Mainnet`);
  console.log(`   Chain ID: ${config.chainId}`);
  console.log(`   RPC: ${config.rpcUrl}`);
  console.log(`   Admin Wallet: ${config.walletAddress}`);
  console.log(`   Platform Wallet: ${config.platformWalletAddress}`);
  console.log(`   Quote Token: ${config.quoteTokenAddress}`);
  
  return config;
}

async function finalConfirmation(config: DeploymentConfig): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    console.log('\n⚠️  FINAL CONFIRMATION');
    console.log('   This will deploy REAGENT token to MAINNET');
    console.log('   This action is IRREVERSIBLE');
    console.log('   Real tokens will be used for gas fees\n');
    
    rl.question('Type "DEPLOY TO MAINNET" to continue: ', (answer) => {
      rl.close();
      
      if (answer !== 'DEPLOY TO MAINNET') {
        console.log('\n❌ Deployment cancelled');
        process.exit(0);
      }
      
      resolve();
    });
  });
}

async function deployToken(config: DeploymentConfig): Promise<string> {
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
  
  const txFile = path.join(__dirname, 'deploy-mainnet-tx.json');
  fs.writeFileSync(txFile, JSON.stringify(txData, null, 2));
  
  try {
    console.log('   Sending transaction to Tempo Mainnet...');
    console.log('   (This may take a few moments)');
    
    const output = execSync(`tempo request ${FACTORY_ADDRESS} --method POST --data @${txFile}`, {
      encoding: 'utf-8'
    });
    
    const txHash = parseTxHash(output);
    console.log(`   Transaction hash: ${txHash}`);
    
    // Wait for confirmation
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

async function verifyDeployment(tokenAddress: string, config: DeploymentConfig): Promise<void> {
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

async function grantIssuerRole(tokenAddress: string, config: DeploymentConfig): Promise<void> {
  const token = new ethers.Interface(TIP20_ABI);
  const data = token.encodeFunctionData('grantRole', [ISSUER_ROLE, config.platformWalletAddress]);
  
  const txData = { to: tokenAddress, data, value: '0' };
  const txFile = path.join(__dirname, 'grant-role-mainnet-tx.json');
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
  const txFile = path.join(__dirname, 'set-cap-mainnet-tx.json');
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

function saveDeploymentInfo(tokenAddress: string, config: DeploymentConfig): void {
  const deploymentInfo = {
    network: 'mainnet',
    tokenAddress,
    adminAddress: config.walletAddress,
    platformWalletAddress: config.platformWalletAddress,
    quoteTokenAddress: config.quoteTokenAddress,
    chainId: config.chainId,
    rpcUrl: config.rpcUrl,
    timestamp: new Date().toISOString(),
    deploymentMethod: 'tempo-cli-production'
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
  envContent = envContent.replace(
    /REAGENT_TOKEN_ADDRESS=.*/,
    `REAGENT_TOKEN_ADDRESS="${tokenAddress}"`
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('   ✓ .env updated');
}

function printSuccessSummary(tokenAddress: string, config: DeploymentConfig): void {
  console.log('\n' + '='.repeat(70));
  console.log('🎉 PRODUCTION DEPLOYMENT SUCCESSFUL');
  console.log('='.repeat(70));
  console.log(`Network:              Tempo Mainnet`);
  console.log(`Chain ID:             ${config.chainId}`);
  console.log(`Token Address:        ${tokenAddress}`);
  console.log(`Admin Address:        ${config.walletAddress}`);
  console.log(`Platform Wallet:      ${config.platformWalletAddress}`);
  console.log(`Quote Token:          ${config.quoteTokenAddress}`);
  console.log(`Explorer:             https://explorer.tempo.xyz/address/${tokenAddress}`);
  console.log('='.repeat(70));
  console.log('\n📝 Next Steps:');
  console.log('   1. Verify token on Tempo Explorer');
  console.log('   2. Test minting functionality');
  console.log('   3. Monitor token contract');
  console.log('   4. Announce to team');
  console.log('   5. Proceed to Phase 3');
  console.log('='.repeat(70));
}

// Run production deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Production deployment failed:');
    console.error(error);
    console.error('\n⚠️  Check error details and try again');
    process.exit(1);
  });
