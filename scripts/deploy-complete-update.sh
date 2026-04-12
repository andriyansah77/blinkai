#!/bin/bash

# Complete Deployment Script
# Deploys wallet integration, updates onboarding, and migrates existing users

set -e

echo "🚀 Starting Complete Deployment..."
echo ""

# VPS Configuration
VPS_HOST="root@159.65.141.68"
VPS_APP_DIR="/root/blinkai"

# Step 1: Upload updated files
echo "📤 Step 1: Uploading updated files..."
echo ""

# Registration with file wallet support
echo "  → Uploading updated registration..."
scp blinkai/src/app/api/auth/register/route.ts ${VPS_HOST}:${VPS_APP_DIR}/src/app/api/auth/register/route.ts

# Onboarding with real wallet data
echo "  → Uploading updated onboarding..."
scp blinkai/src/app/onboarding/page.tsx ${VPS_HOST}:${VPS_APP_DIR}/src/app/onboarding/page.tsx

# Migration script
echo "  → Uploading migration script..."
scp blinkai/scripts/migrate-existing-users-wallets.ts ${VPS_HOST}:${VPS_APP_DIR}/scripts/migrate-existing-users-wallets.ts

echo "✅ Files uploaded"
echo ""

# Step 2: Rebuild application
echo "🔨 Step 2: Rebuilding application..."
ssh ${VPS_HOST} 'cd /root/blinkai && npm run build'
echo "✅ Build completed"
echo ""

# Step 3: Run migration for existing users
echo "🔄 Step 3: Migrating existing users to file-based wallets..."
ssh ${VPS_HOST} << 'ENDSSH'
#!/bin/bash

cd /root/blinkai

echo "  → Running migration script..."
npx tsx scripts/migrate-existing-users-wallets.ts

echo ""
echo "✅ Migration completed"

ENDSSH

echo ""

# Step 4: Restart PM2
echo "🔄 Step 4: Restarting application..."
ssh ${VPS_HOST} 'pm2 restart reagent && sleep 3 && pm2 status'
echo "✅ Application restarted"
echo ""

# Step 5: Verify
echo "🔍 Step 5: Verifying deployment..."
ssh ${VPS_HOST} << 'ENDSSH'
#!/bin/bash

echo "  → Checking data directory..."
if [ -d "/root/blinkai/data" ]; then
  echo "  ✓ Data directory exists"
  
  if [ -f "/root/blinkai/data/wallets.json" ]; then
    echo "  ✓ Wallets file exists"
    WALLET_COUNT=$(cat /root/blinkai/data/wallets.json | jq 'keys | length')
    echo "  ✓ File-based wallets: $WALLET_COUNT"
  else
    echo "  ⚠️  Wallets file not found (will be created on first use)"
  fi
else
  echo "  ✗ Data directory not found"
fi

echo ""
echo "  → Checking wallet scripts..."
if [ -x "/root/blinkai/hermes-skills/reagent_wallet_curl.sh" ]; then
  echo "  ✓ Wallet script is executable"
else
  echo "  ✗ Wallet script not executable"
fi

if [ -x "/root/blinkai/hermes-skills/reagent_minting_curl.sh" ]; then
  echo "  ✓ Minting script is executable"
else
  echo "  ✗ Minting script not executable"
fi

ENDSSH

echo ""
echo "✅ Verification complete"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Complete Deployment Finished!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Updated Components:"
echo "   • Registration - Auto-creates file-based wallets"
echo "   • Onboarding - Shows real wallet data"
echo "   • Existing Users - Migrated to file-based wallets"
echo ""
echo "✅ Features:"
echo "   • New users get file-based wallet automatically"
echo "   • Existing users migrated to file-based wallets"
echo "   • AI agent can manage wallets (send, receive, check balance)"
echo "   • Real-time balance from blockchain"
echo "   • Onboarding shows actual wallet information"
echo ""
echo "🌐 Application URL: https://reagent.eu.cc"
echo ""
echo "🧪 Test:"
echo "   1. Register new user → Check wallet is created"
echo "   2. Login existing user → Check wallet migrated"
echo "   3. Chat with AI → Ask 'What's my wallet balance?'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
