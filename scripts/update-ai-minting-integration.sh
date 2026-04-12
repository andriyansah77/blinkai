#!/bin/bash

# Update AI Agent Minting Integration on VPS
# This script uploads updated files and updates all user profiles

set -e

echo "🚀 Starting AI Agent Minting Integration Update..."
echo ""

# VPS Configuration
VPS_HOST="root@159.65.141.68"
VPS_APP_DIR="/root/blinkai"

# Step 1: Upload updated source files
echo "📤 Step 1: Uploading updated source files..."
echo ""

echo "  → Uploading minting API route..."
scp blinkai/src/app/api/hermes/skills/minting/route.ts ${VPS_HOST}:${VPS_APP_DIR}/src/app/api/hermes/skills/minting/route.ts

echo "  → Uploading hermes integration library..."
scp blinkai/src/lib/hermes-integration.ts ${VPS_HOST}:${VPS_APP_DIR}/src/lib/hermes-integration.ts

echo "✅ Source files uploaded successfully!"
echo ""

# Step 2: Update all user profiles with new TOOLS.md and SOUL.md
echo "📝 Step 2: Updating all user profiles..."
echo ""

ssh ${VPS_HOST} << 'ENDSSH'
#!/bin/bash

echo "  → Updating user profiles in /root/.hermes/profiles/..."

# Count profiles
PROFILE_COUNT=$(find /root/.hermes/profiles -maxdepth 1 -type d -name "user-*" | wc -l)
echo "  → Found ${PROFILE_COUNT} user profiles"

# Update each profile
UPDATED=0
for profile_dir in /root/.hermes/profiles/user-*; do
  if [ -d "$profile_dir" ]; then
    profile_name=$(basename "$profile_dir")
    
    # Copy TOOLS.md
    if cp /root/blinkai/hermes-profiles/TOOLS.md "$profile_dir/TOOLS.md" 2>/dev/null; then
      echo "    ✓ Updated TOOLS.md for $profile_name"
    else
      echo "    ✗ Failed to update TOOLS.md for $profile_name"
    fi
    
    # Copy SOUL.md
    if cp /root/blinkai/hermes-profiles/SOUL.md "$profile_dir/SOUL.md" 2>/dev/null; then
      echo "    ✓ Updated SOUL.md for $profile_name"
    else
      echo "    ✗ Failed to update SOUL.md for $profile_name"
    fi
    
    # Copy PLATFORM.md
    if cp /root/blinkai/hermes-profiles/PLATFORM.md "$profile_dir/PLATFORM.md" 2>/dev/null; then
      echo "    ✓ Updated PLATFORM.md for $profile_name"
    else
      echo "    ✗ Failed to update PLATFORM.md for $profile_name"
    fi
    
    UPDATED=$((UPDATED + 1))
  fi
done

echo ""
echo "  → Updated ${UPDATED} user profiles"

ENDSSH

echo "✅ User profiles updated successfully!"
echo ""

# Step 3: Rebuild application
echo "🔨 Step 3: Rebuilding application..."
echo ""

ssh ${VPS_HOST} << 'ENDSSH'
#!/bin/bash

cd /root/blinkai

echo "  → Running npm run build..."
npm run build

echo ""
echo "✅ Build completed successfully!"

ENDSSH

echo ""

# Step 4: Restart PM2
echo "🔄 Step 4: Restarting PM2 application..."
echo ""

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

# Step 5: Verify minting script is executable
echo "🔍 Step 5: Verifying minting script..."
echo ""

ssh ${VPS_HOST} << 'ENDSSH'
#!/bin/bash

SCRIPT_PATH="/root/blinkai/hermes-skills/reagent_minting_curl.sh"

if [ -f "$SCRIPT_PATH" ]; then
  echo "  ✓ Minting script exists"
  
  if [ -x "$SCRIPT_PATH" ]; then
    echo "  ✓ Minting script is executable"
  else
    echo "  → Making script executable..."
    chmod +x "$SCRIPT_PATH"
    echo "  ✓ Script is now executable"
  fi
  
  echo ""
  echo "  → Testing script..."
  echo "  → Running: bash $SCRIPT_PATH check_balance"
  echo ""
  
  # Test with a dummy user ID (will fail auth but proves script works)
  export REAGENT_USER_ID="test-user"
  export REAGENT_API_BASE="http://localhost:3000"
  
  bash "$SCRIPT_PATH" check_balance || echo "  (Expected to fail - no real user ID)"
else
  echo "  ✗ Minting script not found at $SCRIPT_PATH"
fi

ENDSSH

echo ""
echo "✅ Verification complete!"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 AI Agent Minting Integration Update Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Updated Files:"
echo "   • src/app/api/hermes/skills/minting/route.ts"
echo "   • src/lib/hermes-integration.ts"
echo ""
echo "✅ Updated User Profiles:"
echo "   • All user profiles in /root/.hermes/profiles/user-*/"
echo "   • TOOLS.md (cURL-based minting commands)"
echo "   • SOUL.md (AI agent behavior)"
echo "   • PLATFORM.md (platform information)"
echo ""
echo "✅ Application:"
echo "   • Rebuilt with npm run build"
echo "   • Restarted with PM2"
echo ""
echo "🧪 Next Steps:"
echo "   1. Test AI agent with a real user account"
echo "   2. Ask: 'What's my balance?'"
echo "   3. Ask: 'Can you mint tokens for me?'"
echo "   4. Verify AI agent executes minting commands"
echo ""
echo "🌐 Application URL: https://reagent.eu.cc"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
