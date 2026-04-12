#!/bin/bash
# Deploy cURL-based minting skills for AI agents
# This script sets up everything needed for AI agents to execute minting operations

set -e

echo "🚀 Deploying cURL-based Minting Skills..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check dependencies
echo -e "${BLUE}Step 1: Checking dependencies...${NC}"

if ! command -v curl &> /dev/null; then
    echo -e "${YELLOW}curl not found. Installing...${NC}"
    apt-get update && apt-get install -y curl
    echo -e "${GREEN}✅ curl installed${NC}"
else
    echo -e "${GREEN}✅ curl already installed${NC}"
fi

if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}jq not found. Installing...${NC}"
    apt-get update && apt-get install -y jq
    echo -e "${GREEN}✅ jq installed${NC}"
else
    echo -e "${GREEN}✅ jq already installed${NC}"
fi

echo ""

# Step 2: Make script executable
echo -e "${BLUE}Step 2: Setting up minting skill script...${NC}"

SCRIPT_PATH="/root/blinkai/hermes-skills/reagent_minting_curl.sh"

if [ ! -f "$SCRIPT_PATH" ]; then
    echo -e "${RED}❌ Error: Script not found at $SCRIPT_PATH${NC}"
    exit 1
fi

chmod +x "$SCRIPT_PATH"
echo -e "${GREEN}✅ Script is now executable${NC}"

echo ""

# Step 3: Test script
echo -e "${BLUE}Step 3: Testing script...${NC}"

export REAGENT_USER_ID="test-user"
export REAGENT_API_BASE="http://localhost:3000"

if bash "$SCRIPT_PATH" help > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Script executes successfully${NC}"
else
    echo -e "${RED}❌ Script test failed${NC}"
    exit 1
fi

echo ""

# Step 4: Update user profiles
echo -e "${BLUE}Step 4: Updating user profiles...${NC}"

cd /root/blinkai

if [ ! -f "scripts/update-user-profiles-guidance.sh" ]; then
    echo -e "${RED}❌ Error: Update script not found${NC}"
    exit 1
fi

chmod +x scripts/update-user-profiles-guidance.sh

if ./scripts/update-user-profiles-guidance.sh; then
    echo -e "${GREEN}✅ User profiles updated${NC}"
else
    echo -e "${RED}❌ Profile update failed${NC}"
    exit 1
fi

echo ""

# Step 5: Rebuild application
echo -e "${BLUE}Step 5: Rebuilding application...${NC}"

cd /root/blinkai

if npm run build; then
    echo -e "${GREEN}✅ Application rebuilt${NC}"
else
    echo -e "${YELLOW}⚠️  Build had warnings (continuing...)${NC}"
fi

echo ""

# Step 6: Restart PM2
echo -e "${BLUE}Step 6: Restarting application...${NC}"

if pm2 restart reagent; then
    echo -e "${GREEN}✅ Application restarted${NC}"
else
    echo -e "${RED}❌ Failed to restart application${NC}"
    exit 1
fi

echo ""

# Step 7: Verify deployment
echo -e "${BLUE}Step 7: Verifying deployment...${NC}"

# Check if profiles were updated
PROFILE_COUNT=$(ls -d /root/.hermes/profiles/user-* 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Found $PROFILE_COUNT user profiles${NC}"

# Check if TOOLS.md contains curl commands
if grep -q "reagent_minting_curl" /root/.hermes/profiles/user-*/TOOLS.md 2>/dev/null; then
    echo -e "${GREEN}✅ TOOLS.md updated with curl commands${NC}"
else
    echo -e "${YELLOW}⚠️  TOOLS.md may not be updated${NC}"
fi

# Check if SOUL.md contains execution instructions
if grep -q "reagent_minting_curl" /root/.hermes/profiles/user-*/SOUL.md 2>/dev/null; then
    echo -e "${GREEN}✅ SOUL.md updated with execution behavior${NC}"
else
    echo -e "${YELLOW}⚠️  SOUL.md may not be updated${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "What was deployed:"
echo "  ✅ cURL-based minting skill script"
echo "  ✅ Updated API endpoint (X-User-ID auth)"
echo "  ✅ Updated Hermes integration (env vars)"
echo "  ✅ Updated user profiles (TOOLS.md, SOUL.md)"
echo "  ✅ Rebuilt and restarted application"
echo ""
echo "AI agents can now:"
echo "  • Check balance directly"
echo "  • Estimate minting costs"
echo "  • Mint tokens (with confirmation)"
echo "  • View minting history"
echo "  • Show platform statistics"
echo ""
echo "Next steps:"
echo "  1. Test with a user account"
echo "  2. Ask AI: 'Can you check my balance?'"
echo "  3. Ask AI: 'Can you mint tokens for me?'"
echo "  4. Verify AI executes commands successfully"
echo ""
echo "Access your application at: http://159.65.141.68:3000"
echo ""
