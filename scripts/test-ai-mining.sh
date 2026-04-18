#!/bin/bash

# Test AI Agent Auto Mining
# Run this script on VPS after deployment

set -e

echo "=== Testing AI Agent Auto Mining ==="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if API key is set
if [ -z "$REAGENT_API_KEY" ]; then
    echo -e "${RED}Error: REAGENT_API_KEY not set${NC}"
    echo ""
    echo "Please set your API key:"
    echo "  1. Open https://reagent.eu.cc/mining"
    echo "  2. Copy API key from 'AI Agent Auto Mining' section"
    echo "  3. Run: export REAGENT_API_KEY='rgt_your_key'"
    echo ""
    exit 1
fi

# Set platform URL
export REAGENT_PLATFORM_URL="https://reagent.eu.cc"

echo -e "${GREEN}✓ API key is set${NC}"
echo "API Key: ${REAGENT_API_KEY:0:12}...${REAGENT_API_KEY: -8}"
echo ""

# Test 1: Check if skill file exists
echo -e "${YELLOW}Test 1: Checking skill file...${NC}"
if [ -f "/root/.hermes/skills/auto_mining_skill.py" ]; then
    echo -e "${GREEN}✓ Skill file exists${NC}"
else
    echo -e "${RED}✗ Skill file not found${NC}"
    echo "Run: bash /root/reagent/scripts/fix-hermes-chat.sh"
    exit 1
fi
echo ""

# Test 2: Check balance
echo -e "${YELLOW}Test 2: Checking balance...${NC}"
BALANCE_OUTPUT=$(python3 /root/.hermes/skills/auto_mining_skill.py check_balance 2>&1)
BALANCE_EXIT_CODE=$?

if [ $BALANCE_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Balance check successful${NC}"
    echo "$BALANCE_OUTPUT" | python3 -m json.tool 2>/dev/null || echo "$BALANCE_OUTPUT"
    
    # Parse balance to check if can mint
    CAN_MINT=$(echo "$BALANCE_OUTPUT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('can_mint', False))" 2>/dev/null || echo "false")
    
    if [ "$CAN_MINT" = "True" ]; then
        echo -e "${GREEN}✓ Sufficient balance for minting${NC}"
    else
        echo -e "${YELLOW}⚠ Insufficient balance for minting${NC}"
        echo "You need at least 0.5 PATHUSD to mint"
    fi
else
    echo -e "${RED}✗ Balance check failed${NC}"
    echo "$BALANCE_OUTPUT"
    exit 1
fi
echo ""

# Test 3: Get mining status
echo -e "${YELLOW}Test 3: Getting mining status...${NC}"
STATUS_OUTPUT=$(python3 /root/.hermes/skills/auto_mining_skill.py get_status 2>&1)
STATUS_EXIT_CODE=$?

if [ $STATUS_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Status check successful${NC}"
    echo "$STATUS_OUTPUT" | python3 -m json.tool 2>/dev/null || echo "$STATUS_OUTPUT"
else
    echo -e "${YELLOW}⚠ Status check failed (this is optional)${NC}"
    echo "$STATUS_OUTPUT"
fi
echo ""

# Test 4: Test minting (optional, only if user confirms)
echo -e "${YELLOW}Test 4: Test minting (optional)${NC}"
read -p "Do you want to test minting 1 REAGENT token? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting minting test..."
    MINT_OUTPUT=$(python3 /root/.hermes/skills/auto_mining_skill.py start_mining 1 2>&1)
    MINT_EXIT_CODE=$?
    
    if [ $MINT_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✓ Minting test successful${NC}"
        echo "$MINT_OUTPUT" | python3 -m json.tool 2>/dev/null || echo "$MINT_OUTPUT"
    else
        echo -e "${RED}✗ Minting test failed${NC}"
        echo "$MINT_OUTPUT"
    fi
else
    echo "Skipping minting test"
fi
echo ""

# Summary
echo -e "${GREEN}=== Test Summary ===${NC}"
echo ""
echo "✓ Skill installation: OK"
echo "✓ API authentication: OK"
echo "✓ Balance check: OK"
echo ""
echo "Your AI agent is ready to use!"
echo ""
echo "Try these commands in Hermes chat:"
echo "  - 'Check my REAGENT balance'"
echo "  - 'Start mining REAGENT'"
echo "  - 'Mint 3 REAGENT tokens'"
echo ""
