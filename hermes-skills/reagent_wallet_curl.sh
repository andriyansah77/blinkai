#!/bin/bash
# ReAgent Wallet Skill - cURL-based API wrapper
# Allows Hermes AI agents to execute wallet operations via HTTP API

set -e

# Configuration
API_BASE="${REAGENT_API_BASE:-http://localhost:3000}"
USER_ID="${REAGENT_USER_ID:-}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to make authenticated API call
call_api() {
  local action=$1
  shift
  local extra_data=""
  
  # Build JSON data based on action
  case "$action" in
    "check_balance"|"get_address"|"get_history")
      extra_data=""
      ;;
    "send_eth")
      local to=$1
      local amount=$2
      extra_data=", \"to\": \"$to\", \"amount\": \"$amount\""
      ;;
    "send_reagent")
      local to=$1
      local amount=$2
      extra_data=", \"to\": \"$to\", \"amount\": \"$amount\""
      ;;
  esac
  
  # Make API call
  local response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "X-User-ID: $USER_ID" \
    -d "{\"action\": \"$action\"$extra_data}" \
    "$API_BASE/api/hermes/skills/wallet")
  
  echo "$response"
}

# Parse and format JSON response
format_response() {
  local response=$1
  local action=$2
  
  # Check if response is valid JSON
  if ! echo "$response" | jq empty 2>/dev/null; then
    echo -e "${RED}Error: Invalid response from API${NC}"
    echo "$response"
    return 1
  fi
  
  # Check for success
  local success=$(echo "$response" | jq -r '.success')
  
  if [ "$success" != "true" ]; then
    local error=$(echo "$response" | jq -r '.error')
    echo -e "${RED}Error: $error${NC}"
    return 1
  fi
  
  # Format based on action
  case "$action" in
    "check_balance")
      local address=$(echo "$response" | jq -r '.data.address')
      local eth=$(echo "$response" | jq -r '.data.eth')
      local reagent=$(echo "$response" | jq -r '.data.reagent')
      local pathusd=$(echo "$response" | jq -r '.data.pathusd')
      
      echo -e "${GREEN}✓ Wallet Balance${NC}"
      echo -e "${BLUE}Address:${NC} $address"
      echo -e "${YELLOW}ETH:${NC} $eth"
      echo -e "${YELLOW}REAGENT:${NC} $reagent"
      echo -e "${YELLOW}PATHUSD:${NC} $pathusd"
      ;;
      
    "get_address")
      local address=$(echo "$response" | jq -r '.data.address')
      local created=$(echo "$response" | jq -r '.data.createdAt')
      
      echo -e "${GREEN}✓ Wallet Address${NC}"
      echo -e "${BLUE}Address:${NC} $address"
      echo -e "${BLUE}Created:${NC} $created"
      ;;
      
    "send_eth"|"send_reagent")
      local txHash=$(echo "$response" | jq -r '.data.txHash')
      local explorerUrl=$(echo "$response" | jq -r '.data.explorerUrl')
      local from=$(echo "$response" | jq -r '.data.from')
      local to=$(echo "$response" | jq -r '.data.to')
      local amount=$(echo "$response" | jq -r '.data.amount')
      
      echo -e "${GREEN}✓ Transaction Sent${NC}"
      echo -e "${BLUE}From:${NC} $from"
      echo -e "${BLUE}To:${NC} $to"
      echo -e "${YELLOW}Amount:${NC} $amount"
      echo -e "${BLUE}TX Hash:${NC} $txHash"
      echo -e "${BLUE}Explorer:${NC} $explorerUrl"
      ;;
      
    "get_history")
      local count=$(echo "$response" | jq -r '.data.count')
      echo -e "${GREEN}✓ Transaction History${NC}"
      echo -e "${BLUE}Total:${NC} $count transactions"
      echo "$response" | jq -r '.data.transactions'
      ;;
  esac
}

# Main command handler
case "$1" in
  "check_balance"|"balance")
    echo -e "${BLUE}Checking wallet balance...${NC}"
    response=$(call_api "check_balance")
    format_response "$response" "check_balance"
    ;;
    
  "get_address"|"address")
    echo -e "${BLUE}Getting wallet address...${NC}"
    response=$(call_api "get_address")
    format_response "$response" "get_address"
    ;;
    
  "send_eth")
    if [ -z "$2" ] || [ -z "$3" ]; then
      echo -e "${RED}Usage: $0 send_eth <to_address> <amount>${NC}"
      exit 1
    fi
    echo -e "${BLUE}Sending ETH...${NC}"
    response=$(call_api "send_eth" "$2" "$3")
    format_response "$response" "send_eth"
    ;;
    
  "send_reagent"|"send")
    if [ -z "$2" ] || [ -z "$3" ]; then
      echo -e "${RED}Usage: $0 send_reagent <to_address> <amount>${NC}"
      exit 1
    fi
    echo -e "${BLUE}Sending REAGENT...${NC}"
    response=$(call_api "send_reagent" "$2" "$3")
    format_response "$response" "send_reagent"
    ;;
    
  "history")
    echo -e "${BLUE}Getting transaction history...${NC}"
    response=$(call_api "get_history")
    format_response "$response" "get_history"
    ;;
    
  *)
    echo -e "${YELLOW}ReAgent Wallet Skill${NC}"
    echo ""
    echo "Usage:"
    echo "  $0 check_balance              - Check wallet balance"
    echo "  $0 get_address                - Get wallet address"
    echo "  $0 send_eth <to> <amount>     - Send ETH"
    echo "  $0 send_reagent <to> <amount> - Send REAGENT tokens"
    echo "  $0 history                    - Get transaction history"
    echo ""
    echo "Environment Variables:"
    echo "  REAGENT_USER_ID  - User ID (required)"
    echo "  REAGENT_API_BASE - API base URL (default: http://localhost:3000)"
    exit 1
    ;;
esac
