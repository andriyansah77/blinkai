# ReAgent CLI - Testing Guide

Guide untuk testing dan verifikasi ReAgent CLI tool.

## 🧪 Local Testing

### 1. Setup Development Environment

```bash
# Navigate to CLI package
cd packages/reagent-cli

# Install dependencies
npm install

# Link package locally
npm link

# Verify link
which reagent
```

### 2. Configure Test Environment

```bash
# Create .env file
cat > .env << EOF
REAGENT_API_BASE=https://reagent.eu.cc
REAGENT_USER_ID=test_user_id
EOF

# Or set environment variables
export REAGENT_API_BASE=https://reagent.eu.cc
export REAGENT_USER_ID=test_user_id
```

### 3. Test Commands

```bash
# Test config display
reagent config

# Expected output:
# ReAgent CLI Configuration:
#   API Base:     https://reagent.eu.cc
#   User ID:      test_user_id
#   Session Token: Not set
```

## 🔍 Command Testing

### Test Balance Command

```bash
# Test balance
reagent balance

# Test with alias
reagent b

# Test cURL generation
reagent balance --curl
```

**Expected Output:**
```
✓ Balance Retrieved

Wallet Address:
  0x...

Balances:
  USD Balance:     $10.50
  ETH Balance:     0.005 ETH
  REAGENT Balance: 50,000 REAGENT
```

### Test Estimate Command

```bash
# Test estimate
reagent estimate

# Test with alias
reagent e

# Test cURL generation
reagent estimate --curl
```

**Expected Output:**
```
✓ Cost Estimation

Minting 10,000 REAGENT tokens:
  Estimated Gas: 150,000 units
  Estimated Cost: 0.0015 ETH (~$0.05)
```

### Test Mint Command

```bash
# Test mint
reagent mint

# Test with alias
reagent m

# Test cURL generation
reagent mint --curl
```

**Expected Output:**
```
✓ Minting Successful!

Transaction Details:
  Amount:      10,000 REAGENT
  Cost:        0.0015 ETH (~$0.05)
  TX Hash:     0xabc123...
  Explorer:    https://explore.tempo.xyz/tx/0xabc123...
```

### Test History Command

```bash
# Test basic history
reagent history

# Test with pagination
reagent history --page 2 --limit 20

# Test with status filter
reagent history --status confirmed

# Test with alias
reagent h

# Test cURL generation
reagent history --curl
```

**Expected Output:**
```
✓ Minting History (Page 1, Total: 5)

1. 4/14/2026, 10:30:00 AM
   Amount: 10,000 REAGENT
   Status: ✓ Confirmed
   Cost: 0.0015 ETH (~$0.05)
   TX: 0xabc123...
```

### Test Stats Command

```bash
# Test stats
reagent stats

# Test with alias
reagent s

# Test cURL generation
reagent stats --curl
```

**Expected Output:**
```
✓ Global Mining Statistics

Network Stats:
  Total Minted:       1,000,000 REAGENT
  Total Users:        73
  Total Transactions: 150
  Avg Cost:           ~$0.05
```

## 🧩 Integration Testing

### Test with NPX

```bash
# Unlink local package
npm unlink -g @reagent/cli

# Test with npx (simulating first-time user)
npx @reagent/cli balance
npx @reagent/cli mint
```

### Test Error Handling

```bash
# Test without User ID
unset REAGENT_USER_ID
reagent balance

# Expected: Error message about missing User ID

# Test with invalid User ID
export REAGENT_USER_ID="invalid_id"
reagent balance

# Expected: API error message

# Test with invalid API base
export REAGENT_API_BASE="https://invalid-url.com"
reagent balance

# Expected: Connection error
```

### Test cURL Generation

```bash
# Generate cURL for all commands
reagent balance --curl > test-balance.sh
reagent estimate --curl > test-estimate.sh
reagent mint --curl > test-mint.sh
reagent history --curl > test-history.sh
reagent stats --curl > test-stats.sh

# Make executable
chmod +x test-*.sh

# Test execution
./test-balance.sh
```

## 📝 Manual Test Checklist

### Installation Tests
- [ ] `npm install` works without errors
- [ ] `npm link` creates global command
- [ ] `which reagent` shows correct path
- [ ] `reagent --version` shows version
- [ ] `reagent --help` shows help text

### Command Tests
- [ ] `reagent balance` works
- [ ] `reagent estimate` works
- [ ] `reagent mint` works
- [ ] `reagent history` works
- [ ] `reagent stats` works
- [ ] `reagent config` works

### Alias Tests
- [ ] `reagent b` works (balance)
- [ ] `reagent e` works (estimate)
- [ ] `reagent m` works (mint)
- [ ] `reagent h` works (history)
- [ ] `reagent s` works (stats)

### Option Tests
- [ ] `reagent history --page 2` works
- [ ] `reagent history --limit 20` works
- [ ] `reagent history --status confirmed` works
- [ ] `reagent balance --curl` generates cURL
- [ ] `reagent mint --curl` generates cURL

### Error Handling Tests
- [ ] Missing User ID shows error
- [ ] Invalid User ID shows error
- [ ] Network error shows error
- [ ] API error shows error message
- [ ] Invalid command shows help

### Output Tests
- [ ] Colors display correctly
- [ ] Spinners work
- [ ] Numbers formatted correctly
- [ ] Dates formatted correctly
- [ ] JSON responses parsed correctly

### Environment Tests
- [ ] `.env` file loaded correctly
- [ ] Environment variables override `.env`
- [ ] Missing `.env` uses defaults
- [ ] `REAGENT_API_BASE` works
- [ ] `REAGENT_USER_ID` works
- [ ] `REAGENT_SESSION_TOKEN` works

## 🔬 Automated Testing

### Create Test Script

```bash
#!/bin/bash
# test-cli.sh

echo "=== ReAgent CLI Test Suite ==="
echo ""

# Test 1: Config
echo "Test 1: Config"
reagent config
echo ""

# Test 2: Balance
echo "Test 2: Balance"
reagent balance
echo ""

# Test 3: Estimate
echo "Test 3: Estimate"
reagent estimate
echo ""

# Test 4: History
echo "Test 4: History"
reagent history --limit 5
echo ""

# Test 5: Stats
echo "Test 5: Stats"
reagent stats
echo ""

# Test 6: cURL Generation
echo "Test 6: cURL Generation"
reagent balance --curl
echo ""

echo "=== All Tests Complete ==="
```

Run tests:
```bash
chmod +x test-cli.sh
./test-cli.sh
```

## 🐛 Debugging

### Enable Debug Mode

```bash
# Add debug logging to index.js
DEBUG=* reagent balance

# Or use verbose mode
reagent balance --verbose
```

### Check API Responses

```bash
# Use curl to test API directly
curl -v -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"check_balance"}'
```

### Test with Different Environments

```bash
# Test with localhost
export REAGENT_API_BASE=http://localhost:3000
reagent balance

# Test with staging
export REAGENT_API_BASE=https://staging.reagent.eu.cc
reagent balance

# Test with production
export REAGENT_API_BASE=https://reagent.eu.cc
reagent balance
```

## 📊 Performance Testing

### Response Time Test

```bash
#!/bin/bash
# performance-test.sh

echo "Testing response times..."

for i in {1..10}; do
  echo -n "Test $i: "
  time reagent balance > /dev/null 2>&1
done
```

### Load Test

```bash
#!/bin/bash
# load-test.sh

echo "Running load test..."

for i in {1..100}; do
  reagent balance &
done

wait
echo "Load test complete"
```

## ✅ Validation Checklist

### Before Publishing
- [ ] All commands work correctly
- [ ] All aliases work
- [ ] All options work
- [ ] Error handling works
- [ ] cURL generation works
- [ ] Documentation is complete
- [ ] Examples are tested
- [ ] Dependencies are correct
- [ ] Version number is set
- [ ] License is included
- [ ] README is complete
- [ ] .gitignore is correct
- [ ] .env.example is included

### After Publishing
- [ ] Package installs via npm
- [ ] Package works via npx
- [ ] Global install works
- [ ] All commands work
- [ ] Documentation is accessible
- [ ] Examples work
- [ ] Issues are tracked
- [ ] Updates are planned

## 🔧 Troubleshooting Common Issues

### Issue: Command not found

```bash
# Solution 1: Reinstall
npm unlink -g @reagent/cli
npm link

# Solution 2: Check PATH
echo $PATH
which reagent

# Solution 3: Use npx
npx @reagent/cli balance
```

### Issue: Module not found

```bash
# Solution: Install dependencies
cd packages/reagent-cli
npm install
```

### Issue: Permission denied

```bash
# Solution: Fix permissions
chmod +x index.js

# Or use sudo for global install
sudo npm install -g @reagent/cli
```

### Issue: API connection failed

```bash
# Solution 1: Check API base
reagent config

# Solution 2: Test API directly
curl https://reagent.eu.cc/api/health

# Solution 3: Check network
ping reagent.eu.cc
```

### Issue: Invalid User ID

```bash
# Solution: Get User ID from dashboard
# 1. Login to https://reagent.eu.cc
# 2. Go to Settings
# 3. Copy User ID
# 4. Set environment variable
export REAGENT_USER_ID="your_user_id"
```

## 📈 Success Metrics

### Test Coverage
- [ ] 100% of commands tested
- [ ] 100% of aliases tested
- [ ] 100% of options tested
- [ ] 100% of error cases tested
- [ ] 100% of integrations tested

### Performance
- [ ] Response time < 2 seconds
- [ ] Startup time < 1 second
- [ ] Memory usage < 50MB
- [ ] CPU usage < 10%

### Quality
- [ ] No errors in normal usage
- [ ] Clear error messages
- [ ] Helpful documentation
- [ ] Easy to use
- [ ] Reliable results

## 🎯 Next Steps

1. Run all tests
2. Fix any issues
3. Update documentation
4. Publish to NPM
5. Announce release
6. Monitor usage
7. Collect feedback
8. Plan updates

---

**Testing Status:** Ready for testing
**Last Updated:** 2026-04-14
