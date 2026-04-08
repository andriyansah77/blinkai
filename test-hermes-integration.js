#!/usr/bin/env node

/**
 * Test script to verify Hermes integration on VPS
 */

const { spawn } = require('child_process');

async function testHermesIntegration() {
  console.log('🧪 Testing Hermes Integration on VPS...\n');

  // Test 1: Check environment variable
  const envAvailable = process.env.HERMES_CLI_AVAILABLE === 'true';
  console.log(`✅ Environment HERMES_CLI_AVAILABLE: ${envAvailable}`);

  // Test 2: Check if Hermes CLI is accessible with sudo su
  console.log('🔍 Testing Hermes CLI access with sudo su...');
  
  try {
    const hermesProcess = spawn('sudo', ['su', '-c', 'hermes --version'], {
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
    });

  } catch (err) {
    console.log('❌ Error testing Hermes CLI:', err.message);
  }

  // Test 3: Check if wrapper can detect Hermes
  console.log('\n🔍 Testing Hermes CLI Wrapper...');
  
  try {
    const { HermesCliWrapper } = require('./src/lib/hermes-cli-wrapper');
    const wrapper = new HermesCliWrapper();
    
    const isInstalled = await wrapper.isHermesInstalled();
    console.log(`✅ Hermes CLI Wrapper detection: ${isInstalled}`);
    
  } catch (err) {
    console.log('❌ Error testing wrapper:', err.message);
  }

  console.log('\n🎉 Hermes integration test completed!');
}

// Run the test
testHermesIntegration().catch(console.error);