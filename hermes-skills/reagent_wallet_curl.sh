#!/bin/bash

# ReAgent Wallet Skill - cURL Implementation
# Provides wallet management capabilities for AI agents
# Version: 1.0.0

# Configuration
API_BASE="${REAGENT_API_BASE:-http://localhost:3000}"
USER_ID="${REAGENT_USER_ID}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if required tools are installed
check_dependencies() {
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}Error: curl is not installed${NC}"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}Error: jq is not installed${NC}"
        exit 1
    fi
}

# Function to check balance
check_balance() {
    echo -e "${BLUE}Checking wallet balance...${NC}"
    
    response=$(curl -s -X GET "${API_BASE}/api/wallet" \
        -H "Content-Type: application/json" \
        -H "X-User-ID: ${USER_ID}")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to connect to API${NC}"
        return 1
    fi
    
    success=$(echo "$response" | jq -r '.success')
    
    if [ "$success" = "true" ]; then
        address=$(echo "$response" | jq -r '.address')
        eth_balance=$(echo "$response" | jq -r '.ethBalance // 0')
        reagent_balance=$(echo "$response" | jq -r '.reagentBalance // 0')
        pathusd_balance=$(echo "$response" | jq -r '.pathusdBalance // 0')
        
        echo -e "${GREEN}✓ Wallet Balance${NC}"
        echo "Address: $address"
        echo "ETH: $eth_balance"
        echo "REAGENT: $reagent_balance"
        echo "PATHUSD: $pathusd_balance"
    else
        error=$(echo "$response" | jq -r '.error.message // "Unknown error"')
        echo -e "${RED}Error: $error${NC}"
        return 1
    fi
}

# Function to get wallet address
get_address() {
    echo -e "${BLUE}Getting wallet address...${NC}"
    
    response=$(curl -s -X GET "${API_BASE}/api/wallet" \
        -H "Content-Type: application/json" \
        -H "X-User-ID: ${USER_ID}")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to connect to API${NC}"
        return 1
    fi
    
    success=$(echo "$response" | jq -r '.success')
    
    if [ "$success" = "true" ]; then
        address=$(echo "$response" | jq -r '.address')
        created=$(echo "$response" | jq -r '.createdAt // "Unknown"')
        
        echo -e "${GREEN}✓ Wallet Address${NC}"
        echo "Address: $address"
        echo "Created: $created"
    else
        error=$(echo "$response" | jq -r '.error.message // "Unknown error"')
        echo -e "${RED}Error: $error${NC}"
        return 1
    fi
}

# Function to send ETH
send_eth() {
    local to_address="$1"
    local amount="$2"
    
    if [ -z "$to_address" ] || [ -z "$amount" ]; then
        echo -e "${RED}Error: Missing parameters${NC}"
        echo "Usage: $0 send_eth <to_address> <amount>"
        return 1
    fi
    
    echo -e "${BLUE}Sending $amount ETH to $to_address...${NC}"
    
    response=$(curl -s -X POST "${API_BASE}/api/wallet/send" \
        -H "Content-Type: application/json" \
        -H "X-User-ID: ${USER_ID}" \
        -d "{\"to\":\"$to_address\",\"amount\":\"$amount\",\"token\":\"ETH\"}")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to connect to API${NC}"
        return 1
    fi
    
    success=$(echo "$response" | jq -r '.success')
    
    if [ "$success" = "true" ]; then
        tx_hash=$(echo "$response" | jq -r '.txHash')
        from=$(echo "$response" | jq -r '.from')
        
        echo -e "${GREEN}✓ Transaction Sent${NC}"
        echo "From: $from"
        echo "To: $to_address"
        echo "Amount: $amount ETH"
        echo "TX Hash: $tx_hash"
        echo "Explorer: https://explore.tempo.xyz/tx/$tx_hash"
    else
        error=$(echo "$response" | jq -r '.error.message // "Unknown error"')
        echo -e "${RED}Error: $error${NC}"
        return 1
    fi
}

# Function to send REAGENT tokens
send_reagent() {
    local to_address="$1"
    local amount="$2"
    
    if [ -z "$to_address" ] || [ -z "$amount" ]; then
        echo -e "${RED}Error: Missing parameters${NC}"
        echo "Usage: $0 send_reagent <to_address> <amount>"
        return 1
    fi
    
    echo -e "${BLUE}Sending $amount REAGENT to $to_address...${NC}"
    
    response=$(curl -s -X POST "${API_BASE}/api/wallet/send" \
        -H "Content-Type: application/json" \
        -H "X-User-ID: ${USER_ID}" \
        -d "{\"to\":\"$to_address\",\"amount\":\"$amount\",\"token\":\"REAGENT\"}")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to connect to API${NC}"
        return 1
    fi
    
    success=$(echo "$response" | jq -r '.success')
    
    if [ "$success" = "true" ]; then
        tx_hash=$(echo "$response" | jq -r '.txHash')
        from=$(echo "$response" | jq -r '.from')
        
        echo -e "${GREEN}✓ Transaction Sent${NC}"
        echo "From: $from"
        echo "To: $to_address"
        echo "Amount: $amount REAGENT"
        echo "TX Hash: $tx_hash"
        echo "Explorer: https://explore.tempo.xyz/tx/$tx_hash"
    else
        error=$(echo "$response" | jq -r '.error.message // "Unknown error"')
        echo -e "${RED}Error: $error${NC}"
        return 1
    fi
}

# Function to get transaction history
get_history() {
    echo -e "${BLUE}Getting transaction history...${NC}"
    
    response=$(curl -s -X GET "${API_BASE}/api/wallet/history" \
        -H "Content-Type: application/json" \
        -H "X-User-ID: ${USER_ID}")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to connect to API${NC}"
        return 1
    fi
    
    success=$(echo "$response" | jq -r '.success')
    
    if [ "$success" = "true" ]; then
        echo -e "${GREEN}✓ Transaction History${NC}"
        echo "$response" | jq -r '.transactions[] | "[\(.timestamp)] \(.type) - \(.amount) \(.token) - TX: \(.txHash)"'
    else
        error=$(echo "$response" | jq -r '.error.message // "Unknown error"')
        echo -e "${RED}Error: $error${NC}"
        return 1
    fi
}

# Main script
check_dependencies

case "$1" in
    check_balance)
        check_balance
        ;;
    get_address)
        get_address
        ;;
    send_eth)
        send_eth "$2" "$3"
        ;;
    send_reagent)
        send_reagent "$2" "$3"
        ;;
    history)
        get_history
        ;;
    *)
        echo "ReAgent Wallet Skill - cURL Implementation"
        echo ""
        echo "Usage: $0 <command> [options]"
        echo ""
        echo "Commands:"
        echo "  check_balance              Check wallet balance"
        echo "  get_address                Get wallet address"
        echo "  send_eth <to> <amount>     Send ETH to address"
        echo "  send_reagent <to> <amount> Send REAGENT tokens to address"
        echo "  history                    Get transaction history"
        echo ""
        echo "Environment Variables:"
        echo "  REAGENT_USER_ID    User ID (required)"
        echo "  REAGENT_API_BASE   API base URL (default: http://localhost:3000)"
        exit 1
        ;;
esac
