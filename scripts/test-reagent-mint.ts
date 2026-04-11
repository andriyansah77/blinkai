/**
 * Test REAGENT Token Minting
 * 
 * This script tests that the platform wallet can successfully mint REAGENT tokens.
 * It performs a test mint of 10,000 REAGENT and verifies the results.
 * 
 * Usage:
 *   npx ts-node scripts/test-reagent-mint.ts
 */

import { ethers } from 'ethers';

// TIP20 Token ABI
const TIP20_ABI = [
  'function mint(address to, uint256 amount) external',
  'function balanceOf(address account) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'function supplyCap() external view returns (uint256)',
  'function hasRole(bytes32 role, address account) external view returns (bool)',
  'function decimals() external view returns (uint8)'
];

const ISSUER_ROLE = ethers.id('ISSUER_ROLE');

async function main() {
  console.log('🧪 Testing REAGENT Token Minting\n');

  // Load configuration
  const config = loadConfig();
  
  // Setup provider and signer
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const platformSigner = new ethers.Wallet(config.platformPrivateKey, provider);
  
  console.log(`Platform Wallet: ${platformSigner.address}`);
  
  // Verify platform wallet address matches
  if (platformSigner.address.toLowerCase() !== config.platformWalletAddress.toLowerCase()) {
    throw new Error(
      `Platform wallet address mismatch!\n` +
      `  Expected: ${config.platformWalletAddress}\n` +
      `  Got: ${platformSigner.address}`
    );
  }
  
  // Create token contract instance
  const token = new ethers.Contract(config.tokenAddress, TIP20_ABI, platformSigner);
  
  // Verify ISSUER_ROLE
  console.log('\n🔐 Verifying ISSUER_ROLE...');
  const hasRole = await token.hasRole(ISSUER_ROLE, platformSigner.address);
  
  if (!hasRole) {
    throw new Error('Platform wallet does not have ISSUER_ROLE!');
  }
  
  console.log('   ✓ Platform wallet has ISSUER_ROLE');
  
  // Check current state
  console.log('\n📊 Current State:');
  const totalSupplyBefore = await token.totalSupply();
  const supplyCap = await token.supplyCap();
  const decimals = await token.decimals();
  
  console.log(`   Total Supply: ${ethers.formatUnits(totalSupplyBefore, decimals)} REAGENT`);
  console.log(`   Supply Cap: ${ethers.formatUnits(supplyCap, decimals)} REAGENT`);
  console.log(`   Remaining: ${ethers.formatUnits(supplyCap - totalSupplyBefore, decimals)} REAGENT`);
  
  // Generate test address or use provided
  const testAddress = config.testAddress || ethers.Wallet.createRandom().address;
  console.log(`\n🎯 Test Address: ${testAddress}`);
  
  const balanceBefore = await token.balanceOf(testAddress);
  console.log(`   Balance Before: ${ethers.formatUnits(balanceBefore, decimals)} REAGENT`);
  
  // Mint 10,000 REAGENT (standard mint amount)
  const mintAmount = ethers.parseUnits('10000', decimals);
  
  console.log(`\n💎 Minting ${ethers.formatUnits(mintAmount, decimals)} REAGENT...`);
  
  // Check if mint would exceed cap
  if (totalSupplyBefore + mintAmount > supplyCap) {
    throw new Error('Mint would exceed supply cap!');
  }
  
  // Execute mint
  const tx = await token.mint(testAddress, mintAmount);
  console.log(`   Transaction Hash: ${tx.hash}`);
  console.log('   Waiting for confirmation...');
  
  const receipt = await tx.wait();
  console.log(`   ✓ Confirmed in block ${receipt.blockNumber}`);
  console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
  
  // Verify results
  console.log('\n✅ Verifying Results...');
  
  const balanceAfter = await token.balanceOf(testAddress);
  const totalSupplyAfter = await token.totalSupply();
  
  const balanceIncrease = balanceAfter - balanceBefore;
  const supplyIncrease = totalSupplyAfter - totalSupplyBefore;
  
  console.log(`   Balance After: ${ethers.formatUnits(balanceAfter, decimals)} REAGENT`);
  console.log(`   Balance Increase: ${ethers.formatUnits(balanceIncrease, decimals)} REAGENT`);
  console.log(`   Total Supply After: ${ethers.formatUnits(totalSupplyAfter, decimals)} REAGENT`);
  console.log(`   Supply Increase: ${ethers.formatUnits(supplyIncrease, decimals)} REAGENT`);
  
  // Validate
  const errors: string[] = [];
  
  if (balanceIncrease.toString() !== mintAmount.toString()) {
    errors.push(
      `Balance increase mismatch: expected ${ethers.formatUnits(mintAmount, decimals)}, got ${ethers.formatUnits(balanceIncrease, decimals)}`
    );
  }
  
  if (supplyIncrease.toString() !== mintAmount.toString()) {
    errors.push(
      `Supply increase mismatch: expected ${ethers.formatUnits(mintAmount, decimals)}, got ${ethers.formatUnits(supplyIncrease, decimals)}`
    );
  }
  
  if (totalSupplyAfter > supplyCap) {
    errors.push('Total supply exceeds cap!');
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Validation Errors:');
    errors.forEach(error => console.log(`   - ${error}`));
    process.exit(1);
  }
  
  // Print summary
  printSummary({
    testAddress,
    mintAmount: ethers.formatUnits(mintAmount, decimals),
    balanceBefore: ethers.formatUnits(balanceBefore, decimals),
    balanceAfter: ethers.formatUnits(balanceAfter, decimals),
    totalSupplyBefore: ethers.formatUnits(totalSupplyBefore, decimals),
    totalSupplyAfter: ethers.formatUnits(totalSupplyAfter, decimals),
    supplyCap: ethers.formatUnits(supplyCap, decimals),
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString()
  });
  
  console.log('\n✅ Mint test passed successfully!');
}

function loadConfig() {
  const tokenAddress = process.env.REAGENT_TOKEN_ADDRESS;
  const rpcUrl = process.env.TEMPO_RPC_URL;
  const platformWalletAddress = process.env.PLATFORM_WALLET_ADDRESS;
  const platformPrivateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
  const testAddress = process.env.TEST_MINT_ADDRESS;
  
  if (!tokenAddress) {
    throw new Error('REAGENT_TOKEN_ADDRESS not set in environment');
  }
  if (!rpcUrl) {
    throw new Error('TEMPO_RPC_URL not set in environment');
  }
  if (!platformWalletAddress) {
    throw new Error('PLATFORM_WALLET_ADDRESS not set in environment');
  }
  if (!platformPrivateKey) {
    throw new Error('PLATFORM_WALLET_PRIVATE_KEY not set in environment');
  }
  
  return {
    tokenAddress,
    rpcUrl,
    platformWalletAddress,
    platformPrivateKey,
    testAddress
  };
}

function printSummary(data: any) {
  console.log('\n' + '='.repeat(70));
  console.log('📋 MINT TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Test Address:           ${data.testAddress}`);
  console.log(`Mint Amount:            ${data.mintAmount} REAGENT`);
  console.log(`Balance Before:         ${data.balanceBefore} REAGENT`);
  console.log(`Balance After:          ${data.balanceAfter} REAGENT`);
  console.log(`Total Supply Before:    ${data.totalSupplyBefore} REAGENT`);
  console.log(`Total Supply After:     ${data.totalSupplyAfter} REAGENT`);
  console.log(`Supply Cap:             ${data.supplyCap} REAGENT`);
  console.log(`Transaction Hash:       ${data.txHash}`);
  console.log(`Block Number:           ${data.blockNumber}`);
  console.log(`Gas Used:               ${data.gasUsed}`);
  console.log('='.repeat(70));
}

// Run test
main()
  .catch((error) => {
    console.error('\n❌ Mint test failed:');
    console.error(error);
    process.exit(1);
  });
