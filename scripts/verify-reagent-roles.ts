/**
 * Verify REAGENT Token Roles and Configuration
 * 
 * This script verifies that the REAGENT token is correctly configured:
 * - Admin has DEFAULT_ADMIN_ROLE
 * - Platform wallet has ISSUER_ROLE
 * - Supply cap is set correctly
 * - Token metadata is correct
 * 
 * Usage:
 *   npx ts-node scripts/verify-reagent-roles.ts
 */

import { ethers } from 'ethers';

// TIP20 Token ABI
const TIP20_ABI = [
  'function hasRole(bytes32 role, address account) external view returns (bool)',
  'function getRoleAdmin(bytes32 role) external view returns (bytes32)',
  'function supplyCap() external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function balanceOf(address account) external view returns (uint256)'
];

// Role constants
const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
const ISSUER_ROLE = ethers.id('ISSUER_ROLE');
const PAUSE_ROLE = ethers.id('PAUSE_ROLE');

interface VerificationResult {
  passed: boolean;
  message: string;
  details?: any;
}

async function main() {
  console.log('🔍 Verifying REAGENT Token Configuration\n');

  // Load configuration
  const config = loadConfig();
  
  // Setup provider
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  
  // Create token contract instance
  const token = new ethers.Contract(config.tokenAddress, TIP20_ABI, provider);
  
  const results: VerificationResult[] = [];
  
  // Verify token metadata
  console.log('📋 Verifying Token Metadata...');
  results.push(await verifyMetadata(token));
  
  // Verify admin role
  console.log('\n🔐 Verifying Admin Role...');
  results.push(await verifyAdminRole(token, config.adminAddress));
  
  // Verify issuer role
  console.log('\n🔐 Verifying Issuer Role...');
  results.push(await verifyIssuerRole(token, config.platformWalletAddress));
  
  // Verify supply cap
  console.log('\n📊 Verifying Supply Cap...');
  results.push(await verifySupplyCap(token));
  
  // Verify total supply
  console.log('\n📊 Verifying Total Supply...');
  results.push(await verifyTotalSupply(token));
  
  // Print summary
  printSummary(results);
  
  // Exit with appropriate code
  const allPassed = results.every(r => r.passed);
  process.exit(allPassed ? 0 : 1);
}

function loadConfig() {
  const tokenAddress = process.env.REAGENT_TOKEN_ADDRESS;
  const rpcUrl = process.env.TEMPO_RPC_URL;
  const adminAddress = process.env.PLATFORM_ADMIN_ADDRESS;
  const platformWalletAddress = process.env.PLATFORM_WALLET_ADDRESS;
  
  if (!tokenAddress) {
    throw new Error('REAGENT_TOKEN_ADDRESS not set in environment');
  }
  if (!rpcUrl) {
    throw new Error('TEMPO_RPC_URL not set in environment');
  }
  if (!platformWalletAddress) {
    throw new Error('PLATFORM_WALLET_ADDRESS not set in environment');
  }
  
  console.log(`Token Address: ${tokenAddress}`);
  console.log(`RPC URL: ${rpcUrl}`);
  console.log(`Platform Wallet: ${platformWalletAddress}`);
  if (adminAddress) {
    console.log(`Admin Address: ${adminAddress}`);
  }
  
  return {
    tokenAddress,
    rpcUrl,
    adminAddress,
    platformWalletAddress
  };
}

async function verifyMetadata(token: ethers.Contract): Promise<VerificationResult> {
  try {
    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    
    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Decimals: ${decimals}`);
    
    if (name !== 'ReAgent Token') {
      return {
        passed: false,
        message: `❌ Token name incorrect: expected "ReAgent Token", got "${name}"`
      };
    }
    
    if (symbol !== 'REAGENT') {
      return {
        passed: false,
        message: `❌ Token symbol incorrect: expected "REAGENT", got "${symbol}"`
      };
    }
    
    if (decimals !== 6) {
      return {
        passed: false,
        message: `❌ Token decimals incorrect: expected 6, got ${decimals}`
      };
    }
    
    return {
      passed: true,
      message: '✅ Token metadata correct',
      details: { name, symbol, decimals }
    };
  } catch (error: any) {
    return {
      passed: false,
      message: `❌ Failed to verify metadata: ${error.message}`
    };
  }
}

async function verifyAdminRole(
  token: ethers.Contract,
  adminAddress?: string
): Promise<VerificationResult> {
  try {
    if (!adminAddress) {
      return {
        passed: true,
        message: '⚠️  Admin address not provided, skipping admin role check'
      };
    }
    
    const hasRole = await token.hasRole(DEFAULT_ADMIN_ROLE, adminAddress);
    
    console.log(`   Admin Address: ${adminAddress}`);
    console.log(`   Has DEFAULT_ADMIN_ROLE: ${hasRole}`);
    
    if (!hasRole) {
      return {
        passed: false,
        message: `❌ Admin does not have DEFAULT_ADMIN_ROLE`
      };
    }
    
    return {
      passed: true,
      message: '✅ Admin has DEFAULT_ADMIN_ROLE',
      details: { adminAddress, hasRole }
    };
  } catch (error: any) {
    return {
      passed: false,
      message: `❌ Failed to verify admin role: ${error.message}`
    };
  }
}

async function verifyIssuerRole(
  token: ethers.Contract,
  platformWalletAddress: string
): Promise<VerificationResult> {
  try {
    const hasRole = await token.hasRole(ISSUER_ROLE, platformWalletAddress);
    
    console.log(`   Platform Wallet: ${platformWalletAddress}`);
    console.log(`   Has ISSUER_ROLE: ${hasRole}`);
    
    if (!hasRole) {
      return {
        passed: false,
        message: `❌ Platform wallet does not have ISSUER_ROLE`
      };
    }
    
    // Verify ISSUER_ROLE admin
    const roleAdmin = await token.getRoleAdmin(ISSUER_ROLE);
    console.log(`   ISSUER_ROLE admin: ${roleAdmin === DEFAULT_ADMIN_ROLE ? 'DEFAULT_ADMIN_ROLE' : roleAdmin}`);
    
    return {
      passed: true,
      message: '✅ Platform wallet has ISSUER_ROLE',
      details: { platformWalletAddress, hasRole, roleAdmin }
    };
  } catch (error: any) {
    return {
      passed: false,
      message: `❌ Failed to verify issuer role: ${error.message}`
    };
  }
}

async function verifySupplyCap(token: ethers.Contract): Promise<VerificationResult> {
  try {
    const supplyCap = await token.supplyCap();
    const expectedCap = ethers.parseUnits('400000000', 6); // 400M with 6 decimals
    
    console.log(`   Supply Cap: ${ethers.formatUnits(supplyCap, 6)} REAGENT`);
    console.log(`   Expected: ${ethers.formatUnits(expectedCap, 6)} REAGENT`);
    
    if (supplyCap !== expectedCap) {
      return {
        passed: false,
        message: `❌ Supply cap incorrect: expected ${ethers.formatUnits(expectedCap, 6)}, got ${ethers.formatUnits(supplyCap, 6)}`
      };
    }
    
    return {
      passed: true,
      message: '✅ Supply cap set correctly (400M REAGENT)',
      details: { supplyCap: ethers.formatUnits(supplyCap, 6) }
    };
  } catch (error: any) {
    return {
      passed: false,
      message: `❌ Failed to verify supply cap: ${error.message}`
    };
  }
}

async function verifyTotalSupply(token: ethers.Contract): Promise<VerificationResult> {
  try {
    const totalSupply = await token.totalSupply();
    const supplyCap = await token.supplyCap();
    
    console.log(`   Total Supply: ${ethers.formatUnits(totalSupply, 6)} REAGENT`);
    console.log(`   Supply Cap: ${ethers.formatUnits(supplyCap, 6)} REAGENT`);
    console.log(`   Remaining: ${ethers.formatUnits(supplyCap - totalSupply, 6)} REAGENT`);
    
    if (totalSupply > supplyCap) {
      return {
        passed: false,
        message: `❌ Total supply exceeds cap!`
      };
    }
    
    const percentUsed = Number(totalSupply * BigInt(10000) / supplyCap) / 100;
    console.log(`   Usage: ${percentUsed.toFixed(2)}%`);
    
    return {
      passed: true,
      message: `✅ Total supply within cap (${percentUsed.toFixed(2)}% used)`,
      details: {
        totalSupply: ethers.formatUnits(totalSupply, 6),
        supplyCap: ethers.formatUnits(supplyCap, 6),
        remaining: ethers.formatUnits(supplyCap - totalSupply, 6),
        percentUsed
      }
    };
  } catch (error: any) {
    return {
      passed: false,
      message: `❌ Failed to verify total supply: ${error.message}`
    };
  }
}

function printSummary(results: VerificationResult[]) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  
  results.forEach(result => {
    console.log(result.message);
  });
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log('='.repeat(70));
  console.log(`\n${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log('\n✅ All verifications passed! Token is correctly configured.');
  } else {
    console.log('\n❌ Some verifications failed. Please review and fix issues.');
  }
  
  console.log('='.repeat(70));
}

// Run verification
main()
  .catch((error) => {
    console.error('\n❌ Verification failed:');
    console.error(error);
    process.exit(1);
  });
