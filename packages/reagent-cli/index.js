#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Configuration
const API_BASE = process.env.REAGENT_API_BASE || 'https://reagent.eu.cc';
const USER_ID = process.env.REAGENT_USER_ID || '';
const SESSION_TOKEN = process.env.REAGENT_SESSION_TOKEN || '';

// API Client
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'X-User-ID': USER_ID,
    'Authorization': SESSION_TOKEN ? `Bearer ${SESSION_TOKEN}` : ''
  }
});

// Helper functions
function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

// Commands
async function checkBalance() {
  const spinner = ora('Checking your balance...').start();
  
  try {
    const response = await api.post('/api/hermes/skills/minting', {
      action: 'check_balance'
    });
    
    spinner.stop();
    
    if (response.data.success) {
      const { usdBalance, reagentBalance, ethBalance, walletAddress } = response.data.data;
      
      console.log(chalk.green('\n✓ Balance Retrieved\n'));
      console.log(chalk.cyan('Wallet Address:'));
      console.log(`  ${walletAddress}\n`);
      console.log(chalk.cyan('Balances:'));
      console.log(`  ${chalk.yellow('USD Balance:')}     $${usdBalance}`);
      console.log(`  ${chalk.yellow('ETH Balance:')}     ${ethBalance} ETH`);
      console.log(`  ${chalk.yellow('REAGENT Balance:')} ${formatNumber(reagentBalance)} REAGENT\n`);
    } else {
      console.log(chalk.red(`\n✗ Error: ${response.data.error}\n`));
    }
  } catch (error) {
    spinner.stop();
    console.log(chalk.red(`\n✗ Error: ${error.message}\n`));
    if (error.response?.data?.error) {
      console.log(chalk.red(`  ${error.response.data.error}\n`));
    }
  }
}

async function estimateCost() {
  const spinner = ora('Estimating minting cost...').start();
  
  try {
    const response = await api.post('/api/hermes/skills/minting', {
      action: 'estimate_cost'
    });
    
    spinner.stop();
    
    if (response.data.success) {
      const { estimatedGas, estimatedCostUSD, estimatedCostETH } = response.data.data;
      
      console.log(chalk.green('\n✓ Cost Estimation\n'));
      console.log(chalk.cyan('Minting 10,000 REAGENT tokens:'));
      console.log(`  ${chalk.yellow('Estimated Gas:')} ${formatNumber(estimatedGas)} units`);
      console.log(`  ${chalk.yellow('Estimated Cost:')} ${estimatedCostETH} ETH (~$${estimatedCostUSD})\n`);
    } else {
      console.log(chalk.red(`\n✗ Error: ${response.data.error}\n`));
    }
  } catch (error) {
    spinner.stop();
    console.log(chalk.red(`\n✗ Error: ${error.message}\n`));
    if (error.response?.data?.error) {
      console.log(chalk.red(`  ${error.response.data.error}\n`));
    }
  }
}

async function mintTokens() {
  const spinner = ora('Minting 10,000 REAGENT tokens...').start();
  
  try {
    const response = await api.post('/api/hermes/skills/minting', {
      action: 'mint_tokens'
    });
    
    spinner.stop();
    
    if (response.data.success) {
      const { txHash, amount, costUSD, costETH } = response.data.data;
      
      console.log(chalk.green('\n✓ Minting Successful!\n'));
      console.log(chalk.cyan('Transaction Details:'));
      console.log(`  ${chalk.yellow('Amount:')}      ${formatNumber(amount)} REAGENT`);
      console.log(`  ${chalk.yellow('Cost:')}        ${costETH} ETH (~$${costUSD})`);
      console.log(`  ${chalk.yellow('TX Hash:')}     ${txHash}`);
      console.log(`  ${chalk.yellow('Explorer:')}    https://explore.tempo.xyz/tx/${txHash}\n`);
    } else {
      console.log(chalk.red(`\n✗ Error: ${response.data.error}\n`));
    }
  } catch (error) {
    spinner.stop();
    console.log(chalk.red(`\n✗ Error: ${error.message}\n`));
    if (error.response?.data?.error) {
      console.log(chalk.red(`  ${error.response.data.error}\n`));
    }
  }
}

async function getHistory(options) {
  const spinner = ora('Fetching minting history...').start();
  
  try {
    const response = await api.post('/api/hermes/skills/minting', {
      action: 'get_history',
      page: options.page || 1,
      limit: options.limit || 10,
      status: options.status
    });
    
    spinner.stop();
    
    if (response.data.success) {
      const { mints, total, page, limit } = response.data.data;
      
      console.log(chalk.green(`\n✓ Minting History (Page ${page}, Total: ${total})\n`));
      
      if (mints.length === 0) {
        console.log(chalk.yellow('  No minting history found.\n'));
        return;
      }
      
      mints.forEach((mint, index) => {
        const status = mint.status === 'confirmed' 
          ? chalk.green('✓ Confirmed')
          : mint.status === 'pending'
          ? chalk.yellow('⏳ Pending')
          : chalk.red('✗ Failed');
        
        console.log(chalk.cyan(`${index + 1}. ${formatDate(mint.createdAt)}`));
        console.log(`   Amount: ${formatNumber(mint.amount)} REAGENT`);
        console.log(`   Status: ${status}`);
        console.log(`   Cost: ${mint.costETH} ETH (~$${mint.costUSD})`);
        if (mint.txHash) {
          console.log(`   TX: ${mint.txHash}`);
        }
        console.log('');
      });
    } else {
      console.log(chalk.red(`\n✗ Error: ${response.data.error}\n`));
    }
  } catch (error) {
    spinner.stop();
    console.log(chalk.red(`\n✗ Error: ${error.message}\n`));
    if (error.response?.data?.error) {
      console.log(chalk.red(`  ${error.response.data.error}\n`));
    }
  }
}

async function getStats() {
  const spinner = ora('Fetching mining statistics...').start();
  
  try {
    const response = await api.post('/api/hermes/skills/minting', {
      action: 'get_stats'
    });
    
    spinner.stop();
    
    if (response.data.success) {
      const { totalMinted, totalUsers, totalTransactions, avgCostUSD } = response.data.data;
      
      console.log(chalk.green('\n✓ Global Mining Statistics\n'));
      console.log(chalk.cyan('Network Stats:'));
      console.log(`  ${chalk.yellow('Total Minted:')}       ${formatNumber(totalMinted)} REAGENT`);
      console.log(`  ${chalk.yellow('Total Users:')}        ${formatNumber(totalUsers)}`);
      console.log(`  ${chalk.yellow('Total Transactions:')} ${formatNumber(totalTransactions)}`);
      console.log(`  ${chalk.yellow('Avg Cost:')}           ~$${avgCostUSD}\n`);
    } else {
      console.log(chalk.red(`\n✗ Error: ${response.data.error}\n`));
    }
  } catch (error) {
    spinner.stop();
    console.log(chalk.red(`\n✗ Error: ${error.message}\n`));
    if (error.response?.data?.error) {
      console.log(chalk.red(`  ${error.response.data.error}\n`));
    }
  }
}

function generateCurlCommand(command, options = {}) {
  let payload = { action: command };
  
  if (options.page) payload.page = options.page;
  if (options.limit) payload.limit = options.limit;
  if (options.status) payload.status = options.status;
  
  const curlCmd = `curl -X POST "${API_BASE}/api/hermes/skills/minting" \\
  -H "Content-Type: application/json" \\
  -H "X-User-ID: ${USER_ID || 'YOUR_USER_ID'}" \\
  ${SESSION_TOKEN ? `-H "Authorization: Bearer ${SESSION_TOKEN}" \\\n  ` : ''}-d '${JSON.stringify(payload)}'`;
  
  console.log(chalk.cyan('\nEquivalent cURL command:\n'));
  console.log(chalk.gray(curlCmd));
  console.log('');
}

// CLI Setup
program
  .name('reagent')
  .description('CLI tool for ReAgent - Mint REAGENT tokens and manage your AI agent')
  .version('1.0.0');

program
  .command('balance')
  .alias('b')
  .description('Check your USD, ETH, and REAGENT balance')
  .option('--curl', 'Show equivalent cURL command')
  .action(async (options) => {
    if (options.curl) {
      generateCurlCommand('check_balance');
    } else {
      await checkBalance();
    }
  });

program
  .command('estimate')
  .alias('e')
  .description('Estimate minting cost')
  .option('--curl', 'Show equivalent cURL command')
  .action(async (options) => {
    if (options.curl) {
      generateCurlCommand('estimate_cost');
    } else {
      await estimateCost();
    }
  });

program
  .command('mint')
  .alias('m')
  .description('Mint 10,000 REAGENT tokens')
  .option('--curl', 'Show equivalent cURL command')
  .action(async (options) => {
    if (options.curl) {
      generateCurlCommand('mint_tokens');
    } else {
      await mintTokens();
    }
  });

program
  .command('history')
  .alias('h')
  .description('Get minting history')
  .option('-p, --page <number>', 'Page number', '1')
  .option('-l, --limit <number>', 'Items per page', '10')
  .option('-s, --status <status>', 'Filter by status (pending/confirmed/failed)')
  .option('--curl', 'Show equivalent cURL command')
  .action(async (options) => {
    if (options.curl) {
      generateCurlCommand('get_history', {
        page: parseInt(options.page),
        limit: parseInt(options.limit),
        status: options.status
      });
    } else {
      await getHistory({
        page: parseInt(options.page),
        limit: parseInt(options.limit),
        status: options.status
      });
    }
  });

program
  .command('stats')
  .alias('s')
  .description('Get global mining statistics')
  .option('--curl', 'Show equivalent cURL command')
  .action(async (options) => {
    if (options.curl) {
      generateCurlCommand('get_stats');
    } else {
      await getStats();
    }
  });

program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    console.log(chalk.cyan('\nReAgent CLI Configuration:\n'));
    console.log(`  ${chalk.yellow('API Base:')}     ${API_BASE}`);
    console.log(`  ${chalk.yellow('User ID:')}      ${USER_ID || chalk.red('Not set')}`);
    console.log(`  ${chalk.yellow('Session Token:')} ${SESSION_TOKEN ? chalk.green('Set') : chalk.red('Not set')}`);
    console.log('');
    console.log(chalk.gray('Set environment variables in .env file:'));
    console.log(chalk.gray('  REAGENT_API_BASE=https://reagent.eu.cc'));
    console.log(chalk.gray('  REAGENT_USER_ID=your_user_id'));
    console.log(chalk.gray('  REAGENT_SESSION_TOKEN=your_session_token'));
    console.log('');
  });

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
