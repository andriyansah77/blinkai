#!/bin/bash

# Deploy Wallet Integration to VPS
# This script uploads wallet files and updates user profiles

set -e

echo "🚀 Starting Wallet Integration Deployment..."
echo ""

# VPS Configuration
VPS_HOST="root@159.65.141.68"
VPS_APP_DIR="/root/blinkai"

# Step 1: Create data directory on VPS
echo "📁 Step 1: Creating data directory..."
ssh ${VPS_HOST} "mkdir -p ${VPS_APP_DIR}/data && chmod 700 ${VPS_APP_DIR}/data"
echo "✅ Data directory created"
echo ""

# Step 2: Upload wallet manager
echo "📤 Step 2: Uploading wallet manager..."
ssh ${VPS_HOST} "mkdir -p ${VPS_APP_DIR}/src/lib/wallet"
scp blinkai/src/lib/wallet/file-wallet-manager.ts ${VPS_HOST}:${VPS_APP_DIR}/src/lib/wallet/file-wallet-manager.ts
echo "✅ Wallet manager uploaded"
echo ""

# Step 3: Upload wallet API endpoint
echo "📤 Step 3: Uploading wallet API endpoint..."
ssh ${VPS_HOST} "mkdir -p ${VPS_APP_DIR}/src/app/api/hermes/skills/wallet"
scp blinkai/src/app/api/hermes/skills/wallet/route.ts ${VPS_HOST}:${VPS_APP_DIR}/src/app/api/hermes/skills/wallet/route.ts
echo "✅ Wallet API endpoint uploaded"
echo ""

# Step 4: Upload wallet shell script
echo "📤 Step 4: Uploading wallet shell script..."
scp blinkai/hermes-skills/reagent_wallet_curl.sh ${VPS_HOST}:${VPS_APP_DIR}/hermes-skills/reagent_wallet_curl.sh
ssh ${VPS_HOST} "chmod +x ${VPS_APP_DIR}/hermes-skills/reagent_wallet_curl.sh"
echo "✅ Wallet shell script uploaded and made executable"
echo ""

# Step 5: Upload updated TOOLS.md
echo "📤 Step 5: Uploading updated TOOLS.md..."
scp blinkai/hermes-profiles/TOOLS.md ${VPS_HOST}:${VPS_APP_DIR}/hermes-profiles/TOOLS.md
echo "✅ TOOLS.md uploaded"
echo ""

# Step 6: Update all user profiles
echo "📝 Step 6: Updating user profiles..."
ssh ${VPS_HOST} << 'ENDSSH'
#!/bin/bash

echo "  → Updating user profiles in /root/.hermes/profiles/..."

# Count profiles
PROFILE_COUNT=$(find /root/.hermes/profiles -maxdepth 1 -type d -name "user-*" 2>/dev/null | wc -l)
echo "  → Found ${PROFILE_COUNT} user profiles"

# Update each profile
UPDATED=0
for profile_dir in /root/.hermes/profiles/user-*; do
  if [ -d "$profile_dir" ]; then
    profile_name=$(basename "$profile_dir")
    
    # Copy TOOLS.md
    if cp /root/blinkai/hermes-profiles/TOOLS.md "$profile_dir/TOOLS.md" 2>/dev/null; then
      echo "    ✓ Updated TOOLS.md for $profile_name"
      UPDATED=$((UPDATED + 1))
    else
      echo "    ✗ Failed to update TOOLS.md for $profile_name"
    fi
  fi
done

echo ""
echo "  → Updated ${UPDATED} user profiles"

ENDSSH

echo "✅ User profiles updated"
echo ""

# Step 7: Rebuild application
echo "🔨 Step 7: Rebuilding application..."
ssh ${VPS_HOST} << 'ENDSSH'
#!/bin/bash

cd /root/blinkai

echo "  → Running npm run build..."
npm run build

echo ""
echo "✅ Build completed successfully!"

ENDSSH

echo ""

# Step 8: Restart PM2
echo "🔄 Step 8: Restarting PM2 application..."
ssh ${VPS_HOST} << 'ENDSSH'
#!/bin/bash

echo "  → Restarting reagent application..."
pm2 restart reagent

echo "  → Waiting for application to start..."
sleep 5

echo "  → Checking PM2 status..."
pm2 status reagent

ENDSSH

echo ""
echo "✅ Application restarted successfully!"
echo ""

# Step 9: Verify wallet script
echo "🔍 Step 9: Verifying wallet script..."
ssh ${VPS_HOST} << 'ENDSSH'
#!/bin/bash

SCRIPT_PATH="/root/blinkai/hermes-skills/reagent_wallet_curl.sh"

if [ -f "$SCRIPT_PATH" ]; then
  echo "  ✓ Wallet script exists"
  
  if [ -x "$SCRIPT_PATH" ]; then
    echo "  ✓ Wallet script is executable"
  else
    echo "  → Making script executable..."
    chmod +x "$SCRIPT_PATH"
    echo "  ✓ Script is now executable"
  fi
else
  echo "  ✗ Wallet script not found at $SCRIPT_PATH"
fi

ENDSSH

echo ""
echo "✅ Verification complete!"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Wallet Integration Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Deployed Files:"
echo "   • src/lib/wallet/file-wallet-manager.ts"
echo "   • src/app/api/hermes/skills/wallet/route.ts"
echo "   • hermes-skills/reagent_wallet_curl.sh"
echo "   • hermes-profiles/TOOLS.md (updated)"
echo ""
echo "✅ User Profiles Updated:"
echo "   • All user profiles in /root/.hermes/profiles/user-*/"
echo "   • TOOLS.md with wallet commands"
echo ""
echo "✅ Application:"
echo "   • Rebuilt with npm run build"
echo "   • Restarted with PM2"
echo ""
echo "🧪 Test Commands:"
echo "   # Check balance"
echo "   bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh check_balance"
echo ""
echo "   # Get address"
echo "   bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh get_address"
echo ""
echo "🌐 Application URL: https://reagent.eu.cc"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
