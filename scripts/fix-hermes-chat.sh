#!/bin/bash

# Fix Hermes Chat 502/504 Errors
# Run this script on VPS to fix Hermes integration issues

set -e

echo "=== Fixing Hermes Chat Issues ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Hermes CLI
echo -e "${YELLOW}Step 1: Checking Hermes CLI...${NC}"
if command -v hermes &> /dev/null; then
    echo -e "${GREEN}✓ Hermes CLI found${NC}"
    hermes --version
else
    echo -e "${RED}✗ Hermes CLI not found${NC}"
    echo "Installing Hermes CLI..."
    curl -fsSL https://raw.githubusercontent.com/hermes-hq/hermes/main/install.sh | bash
fi
echo ""

# Step 2: Kill stuck Hermes processes
echo -e "${YELLOW}Step 2: Killing stuck Hermes processes...${NC}"
if pgrep -f "hermes" > /dev/null; then
    echo "Found running Hermes processes, killing..."
    pkill -f "hermes" || true
    sleep 2
    echo -e "${GREEN}✓ Processes killed${NC}"
else
    echo -e "${GREEN}✓ No stuck processes found${NC}"
fi
echo ""

# Step 3: Check Hermes profiles
echo -e "${YELLOW}Step 3: Checking Hermes profiles...${NC}"
if [ -d "/root/.hermes/profiles" ]; then
    echo "Profiles directory exists"
    ls -la /root/.hermes/profiles/ || true
else
    echo "Creating profiles directory..."
    mkdir -p /root/.hermes/profiles
fi

# Create default profile if not exists
if [ ! -d "/root/.hermes/profiles/default" ]; then
    echo "Creating default profile..."
    hermes profiles create default || true
fi
echo -e "${GREEN}✓ Profiles checked${NC}"
echo ""

# Step 4: Install auto mining skill
echo -e "${YELLOW}Step 4: Installing auto mining skill...${NC}"
if [ -f "/root/reagent/hermes-skills/auto_mining_skill.py" ]; then
    echo "Copying skill files..."
    cp /root/reagent/hermes-skills/auto_mining_skill.py /root/.hermes/skills/ || true
    cp /root/reagent/hermes-skills/auto_mining_skill.json /root/.hermes/skills/ || true
    chmod +x /root/.hermes/skills/auto_mining_skill.py
    echo -e "${GREEN}✓ Skill files copied${NC}"
    ls -la /root/.hermes/skills/auto_mining* || true
else
    echo -e "${RED}✗ Skill files not found in /root/reagent/hermes-skills/${NC}"
fi
echo ""

# Step 5: Check Python dependencies
echo -e "${YELLOW}Step 5: Checking Python dependencies...${NC}"
python3 -c "import requests" 2>/dev/null && echo -e "${GREEN}✓ requests module installed${NC}" || {
    echo "Installing requests module..."
    pip3 install requests
}
echo ""

# Step 6: Restart application
echo -e "${YELLOW}Step 6: Restarting application...${NC}"
cd /root/reagent
pm2 restart reagent
sleep 3
pm2 status reagent
echo -e "${GREEN}✓ Application restarted${NC}"
echo ""

# Step 7: Test skill (if API key provided)
if [ ! -z "$REAGENT_API_KEY" ]; then
    echo -e "${YELLOW}Step 7: Testing skill...${NC}"
    export REAGENT_PLATFORM_URL="https://reagent.eu.cc"
    python3 /root/.hermes/skills/auto_mining_skill.py check_balance || {
        echo -e "${RED}✗ Skill test failed${NC}"
        echo "Make sure REAGENT_API_KEY is valid"
    }
    echo ""
else
    echo -e "${YELLOW}Step 7: Skipping skill test (no API key)${NC}"
    echo "To test skill, run:"
    echo "  export REAGENT_API_KEY='rgt_your_key'"
    echo "  export REAGENT_PLATFORM_URL='https://reagent.eu.cc'"
    echo "  python3 /root/.hermes/skills/auto_mining_skill.py check_balance"
    echo ""
fi

# Summary
echo -e "${GREEN}=== Fix Complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. Open https://reagent.eu.cc/mining in browser"
echo "2. Hard refresh (Ctrl + Shift + R)"
echo "3. Copy API key from 'AI Agent Auto Mining' section"
echo "4. Test skill with: python3 /root/.hermes/skills/auto_mining_skill.py check_balance"
echo ""
echo "Check logs with:"
echo "  pm2 logs reagent --lines 100"
echo ""
