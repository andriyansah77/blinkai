#!/usr/bin/env node

/**
 * Test script untuk Hermes CLI connection
 * Verifikasi bahwa Hermes CLI sudah ter-install dan berfungsi
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testHermesConnection() {
  console.log('🔍 Testing Hermes CLI connection...\n');

  const tests = [
    {
      name: 'Hermes CLI Installation',
      command: 'hermes --version',
      description: 'Check if Hermes CLI is installed and accessible'
    },
    {
      name: 'Hermes Configuration',
      command: 'hermes config check',
      description: 'Verify Hermes configuration is valid'
    },
    {
      name: 'Available Models',
      command: 'hermes model list',
      description: 'List configured AI models'
    },
    {
      name: 'Doctor Check',
      command: 'hermes doctor',
      description: 'Run Hermes diagnostics'
    },
    {
      name: 'Quick Chat Test',
      command: 'hermes chat -q "Hello, this is a test message" --no-memory',
      description: 'Test basic chat functionality'
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    console.log(`📋 ${test.name}`);
    console.log(`   ${test.description}`);
    
    try {
      const result = await execAsync(test.command);
      console.log(`   ✅ PASSED`);
      
      // Show output for some tests
      if (test.name.includes('Version') || test.name.includes('Chat')) {
        const output = result.stdout.trim();
        if (output) {
          console.log(`   📄 Output: ${output.substring(0, 100)}${output.length > 100 ? '...' : ''}`);
        }
      }
      
      passedTests++;
    } catch (error) {
      console.log(`   ❌ FAILED`);
      console.log(`   📄 Error: ${error.message}`);
      
      // Provide specific help for common issues
      if (test.name.includes('Installation')) {
        console.log(`   💡 Fix: Install Hermes CLI with:`);
        console.log(`      curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash`);
      } else if (test.name.includes('Configuration')) {
        console.log(`   💡 Fix: Configure Hermes with: hermes model`);
      } else if (test.name.includes('Models')) {
        console.log(`   💡 Fix: Set API key with: hermes config set OPENROUTER_API_KEY your-key`);
      }
    }
    
    console.log('');
  }

  // Summary
  console.log('📊 Test Summary:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Hermes CLI is ready to use.');
    console.log('✅ ReAgent can now use Hermes framework features:');
    console.log('   - Learning & Memory');
    console.log('   - Skills Development');
    console.log('   - Advanced Agent Capabilities');
  } else if (passedTests > 0) {
    console.log('\n⚠️  Some tests failed. Hermes CLI is partially working.');
    console.log('🔄 ReAgent will use available features and fallback for others.');
  } else {
    console.log('\n❌ All tests failed. Hermes CLI is not working.');
    console.log('🔄 ReAgent will fallback to standard AI responses.');
  }

  console.log('\n🚀 Start ReAgent with: npm run dev');
  console.log('🔗 Test API: http://localhost:3001/api/hermes/test');
}

// Run the test
testHermesConnection().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});