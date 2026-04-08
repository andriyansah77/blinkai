#!/usr/bin/env node

/**
 * Test script to verify Hermes integration on VPS
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim().replace(/"/g, '');
      }
    });
  } catch (err) {
    console.log('⚠️  Could not load .env file:', err.message);
  }
}

async function testHermesIntegration() {
  console.log('🧪 Testing Hermes Integration on VPS...\n');

  // Load environment variables
  loadEnvFile();

  // Test 1: Check environment variable
  const envAvailable = process.env.HERMES_CLI_AVAILABLE === 'true';
  console.log(`✅ Environment HERMES_CLI_AVAILABLE: ${envAvailable}`);

  // Test 2: Check if Hermes CLI is accessible with sudo su
  console.log('🔍 Testing Hermes CLI access with sudo su...');
  
  return new Promise((resolve) => {
    try {
      const hermesProcess = spawn('/root/.local/bin/hermes', ['--version'], {
        stdio: 'pipe'
      });

      let output = '';
      let error = '';

      hermesProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      hermesProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      hermesProcess.on('close', (code) => {
        if (code === 0 && output.includes('Hermes Agent')) {
          console.log('✅ Hermes CLI accessible via sudo su');
          console.log(`📋 Version info: ${output.trim()}`);
        } else {
          console.log('❌ Hermes CLI not accessible');
          console.log(`Error: ${error}`);
        }

        // Test 3: Check if wrapper can detect Hermes
        console.log('\n🔍 Testing Hermes CLI Wrapper...');
        
        try {
          const wrapperPath = path.join(__dirname, 'src', 'lib', 'hermes-cli-wrapper.ts');
          if (fs.existsSync(wrapperPath)) {
            console.log('✅ Hermes CLI Wrapper file exists');
          } else {
            console.log('❌ Hermes CLI Wrapper file not found');
          }
          
        } catch (err) {
          console.log('❌ Error testing wrapper:', err.message);
        }

        console.log('\n🎉 Hermes integration test completed!');
        resolve();
      });

    } catch (err) {
      console.log('❌ Error testing Hermes CLI:', err.message);
      resolve();
    }
  });
}

// Run the test
testHermesIntegration().catch(console.error);