/**
 * Deploy REAGENT Token using Tempo Wallet CLI
 * 
 * This script uses the Tempo CLI for wallet management and transactions,
 * eliminating the need for manual private key management.
 * 
 * Prerequisites:
 *   1. Install Tempo CLI: curl -L https://tempo.xyz/install | bash
 *   2. Login: tempo wallet login
 *   3. Fund wallet with test tokens
 * 
 * Usage:
 *   npx ts-node --project scripts/tsconfig.json scripts/deploy-with-tempo-cli.ts
 */

import { ethers } from 'ethers';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// TIP20Factory ABI
const TIP20_FACTORY_ABI = [
  'function createToken(string name, string symbol, string currency, address quoteToken, address admin, bytes32 salt) external returns (address)',
];

// TIP20 Token ABI
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

const FACTORY_ADDRESS = '0x20Fc000000000000000000000000000000000000';
const ISSUER_ROLE = ethers.id('ISSUER_ROLE');

async function main() {
  console.log('🚀 Deploying REAGENT Token using Tempo Wallet CLI\n');

  // Check if Tempo CLI is installed
  checkTempoCLI();
  
  // Get wallet address from Tempo CLI
  const walletAddress = getTempoWalletAddress();
  console.log(`📍 Using Tempo Wallet: ${walletAddress}\n`);
  
  // Load configuration
  const config = loadConfig(walletAddress);
  
  // Setup provider
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  
  // Deploy token
  console.log('📝 Deploying REAGENT token...');
  const tokenAddress = await deployTokenWithTempoCLI(config, provider);
  
  // Verify deployment
  console.log('\n✅ Verifying deployment...');
  await verifyDeployment(tokenAddress, provider);
  
  // Grant ISSUER_ROLE
  console.log('\n🔐 Granting ISSUER_ROLE...');
  await grantIssuerRoleWithTempoCLI(tokenAddress, config.platformWalletAddress);
  
  // Set supply cap
  console.log('\n📊 Setting supply cap...');
  await setSupplyCapWithTempoCLI(tokenAddress);
  
  // Save deployment info
  console.log('\n💾 Saving deployment information...');
  saveDeploymentInfo(tokenAddress, walletAddress, config);
  
  // Update .env
  updateEnvFile(tokenAddress);
  
  console.log('\n✅ Deployment completed successfully!');
  console.log(`\n📍 REAGENT Token Address: ${tokenAddress}`);
  console.log('\nNext steps:');
  console.log('  1. Verify on Tempo Explorer');
  console.log('  2. Test minting functionality');
  console.log('  3. Proceed to Phase 3');
}

function checkTempoCLI() {
  try {
    execSync('tempo --version', { stdio: 'pipe' });
    console.log('✅ Tempo CLI found\n');
  } catch (error) {
    console.error('❌ Tempo CLI not found!');
    console.error('\nPlease install Tempo CLI:');
    console.error('  curl -L https://tempo.xyz/install | bash');
    console.error('\nThen login:');
    console.error('  tempo wallet login');
    process.exit(1);
  }
}

function getTempoWalletAddress(): string {
  try {
    const output = execSync('tempo wallet address', { encoding: 'utf-8' });
    const address = output.trim();
    
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid address format');
    }
    
    return address;
  } catch (error) {
    console.error('❌ Failed to get Tempo Wallet address');
    console.error('\nPlease login to Tempo Wallet:');
    console.error('  tempo wallet login');
    process.exit(1);
  }
}

function loadConfig(adminAddress: string) {
  const rpcUrl = process.env.TEMPO_RPC_URL || 'https://rpc.tempo.xyz';
  const chainId = parseInt(process.env.TEMPO_CHAIN_ID || '4217');
  const platformWalletAddress = process.env.PLATFORM_WALLET_ADDRESS || adminAddress;
  const quoteTokenAddress = process.env.QUOTE_TOKEN_ADDRESS;
  
  if (!quoteTokenAddress) {
    console.error('❌ QUOTE_TOKEN_ADDRESS not set in environment');
    console.error('\nPlease set QUOTE_TOKEN_ADDRESS in .env file');
    process.exit(1);
  }
  
  console.log(`   RPC URL: ${rpcUrl}`);
  console.log(`   Chain ID: ${chainId}`);
  console.log(`   Platform Wallet: ${platformWalletAddress}`);
  console.log(`   Quote Token: ${quoteTokenAddress}`);
  
  return {
    rpcUrl,
    chainId,
    platformWalletAddress,
    quoteTokenAddress
  };
}

async function deployTokenWithTempoCLI(config: any, provider: ethers.JsonRpcProvider): Promise<string> {
  // Encode deployment transaction
  const factory = new ethers.Interface(TIP20_FACTORY_ABI);
  const data = factory.encodeFunctionData('createToken', [
    'ReAgent Token',
    'REAGENT',
    'USD',
    config.quoteTokenAddress,
    await getTempoWalletAddress(),
    ethers.id('reagent-v1')
  ]);
  
  console.log('   Sending deployment transaction via Tempo CLI...');
  
  // Create transaction file for Tempo CLI
  const txData = {
    to: FACTORY_ADDRESS,
    data: data,
    value: '0'
  };
  
  const txFile = path.join(__dirname, 'deploy-tx.json');
  fs.writeFileSync(txFile, JSON.stringify(txData, null, 2));
  
  try {
    // Send transaction using Tempo CLI
    const output = execSync(`tempo request ${FACTORY_ADDRESS} --method POST --data @${txFile}`, {
      encoding: 'utf-8'
    });
    
    // Parse transaction hash from output
    const txHash = parseTxHashFromOutput(output);
    console.log(`   Transaction hash: ${txHash}`);
    
    // Wait for confirmation
    console.log('   Waiting for confirmation...');
    const receipt = await provider.waitForTransaction(txHash);
    
    if (!receipt) {
      throw new Error('Transaction receipt not found');
    }
    
    console.log(`   ✓ Confirmed in block ${receipt.blockNumber}`);
    
    // Parse token address from logs
    const tokenAddress = parseTokenAddressFromReceipt(receipt);
    console.log(`\n   ✅ Token deployed at: ${tokenAddress}`);
    
    return tokenAddress;
  } finally {
    // Cleanup
    if (fs.existsSync(txFile)) {
      fs.unlinkSync(txFile);
    }
  }
}

function parseTxHashFromOutput(output: string): string {
  // Parse transaction hash from Tempo CLI output
  const match = output.match(/0x[a-fA-F0-9]{64}/);
  if (!match) {
    throw new Error('Failed to parse transaction hash from output');
  }
  return match[0];
}

function parseTokenAddressFromReceipt(receipt: ethers.TransactionReceipt): string {
  // Parse TokenCreated event from logs
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

async function verifyDeployment(tokenAddress: string, provider: ethers.JsonRpcProvider) {
  const token = new ethers.Contract(tokenAddress, TIP20_ABI, provider);
  
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  
  console.log(`   Name: ${name}`);
  console.log(`   Symbol: ${symbol}`);
  console.log(`   Decimals: ${decimals}`);
  
  if (name !== 'ReAgent Token' || symbol !== 'REAGENT' || decimals !== 6) {
    throw new Error('Token deployment verification failed');
  }
  
  console.log('   ✓ Deployment verified');
}

async function grantIssuerRoleWithTempoCLI(tokenAddress: string, platformWalletAddress: string) {
  const token = new ethers.Interface(TIP20_ABI);
  const data = token.encodeFunctionData('grantRole', [ISSUER_ROLE, platformWalletAddress]);
  
  const txData = {
    to: tokenAddress,
    data: data,
    value: '0'
  };
  
  const txFile = path.join(__dirname, 'grant-role-tx.json');
  fs.writeFileSync(txFile, JSON.stringify(txData, null, 2));
  
  try {
    console.log(`   Granting ISSUER_ROLE to ${platformWalletAddress}...`);
    
    const output = execSync(`tempo request ${tokenAddress} --method POST --data @${txFile}`, {
      encoding: 'utf-8'
    });
    
    const txHash = parseTxHashFromOutput(output);
    console.log(`   Transaction hash: ${txHash}`);
    console.log('   ✓ ISSUER_ROLE granted successfully');
  } finally {
    if (fs.existsSync(txFile)) {
      fs.unlinkSync(txFile);
    }
  }
}

async function setSupplyCapWithTempoCLI(tokenAddress: string) {
  const token = new ethers.Interface(TIP20_ABI);
  const supplyCap = ethers.parseUnits('400000000', 6);
  const data = token.encodeFunctionData('setSupplyCap', [supplyCap]);
  
  const txData = {
    to: tokenAddress,
    data: data,
    value: '0'
  };
  
  const txFile = path.join(__dirname, 'set-cap-tx.json');
  fs.writeFileSync(txFile, JSON.stringify(txData, null, 2));
  
  try {
    console.log('   Setting supply cap to 400M REAGENT...');
    
    const output = execSync(`tempo request ${tokenAddress} --method POST --data @${txFile}`, {
      encoding: 'utf-8'
    });
    
    const txHash = parseTxHashFromOutput(output);
    console.log(`   Transaction hash: ${txHash}`);
    console.log('   ✓ Supply cap set successfully');
  } finally {
    if (fs.existsSync(txFile)) {
      fs.unlinkSync(txFile);
    }
  }
}

function saveDeploymentInfo(tokenAddress: string, adminAddress: string, config: any) {
  const deploymentInfo = {
    tokenAddress,
    adminAddress,
    platformWalletAddress: config.platformWalletAddress,
    quoteTokenAddress: config.quoteTokenAddress,
    timestamp: new Date().toISOString(),
    deploymentMethod: 'tempo-cli'
  };
  
  const deploymentPath = path.join(__dirname, '..', 'REAGENT_DEPLOYMENT.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`   ✓ Deployment info saved`);
}

function updateEnvFile(tokenAddress: string) {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('   ⚠️  .env file not found, skipping update');
    return;
  }
  
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  if (envContent.includes('REAGENT_TOKEN_ADDRESS=')) {
    envContent = envContent.replace(
      /REAGENT_TOKEN_ADDRESS=.*/,
      `REAGENT_TOKEN_ADDRESS="${tokenAddress}"`
    );
  } else {
    envContent += `\nREAGENT_TOKEN_ADDRESS="${tokenAddress}"\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('   ✓ .env file updated');
}

// Run deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Deployment failed:');
    console.error(error);
    process.exit(1);
  });
