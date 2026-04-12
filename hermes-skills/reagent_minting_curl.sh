#!/bin/bash
# ReAgent Minting Skill - cURL-based API wrapper
# Allows Hermes AI agents to execute minting operations via HTTP API

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
    local action="$1"
    shift
    
    # Build JSON payload
    local payload="{\"action\":\"$action\""
    
    # Add additional parameters
    while [[ $# -gt 0 ]]; do
        case $1 in
            --page)
                payload="$payload,\"page\":$2"
                shift 2
                ;;
            --limit)
                payload="$payload,\"limit\":$2"
                shift 2
                ;;
            --status)
                payload="$payload,\"status\":\"$2\""
                shift 2
                ;;
            *)
                shift
                ;;
        esac
    done
    
    payload="$payload}"
    
    # Make API call with user context
    local response=$(curl -s -X POST "$API_BASE/api/hermes/skills/minting" \
        -H "Content-Type: application/json" \
        -H "X-User-ID: $USER_ID" \
        -d "$payload" 2>/dev/null)
    
    # Check if response is valid JSON
    if ! echo "$response" | jq empty 2>/dev/null; then
        echo -e "${RED}Error: Invalid API response${NC}"
        echo "$response"
        return 1
    fi
    
    # Check success status
    local success=$(echo "$response" | jq -r '.success // false')
    
    if [ "$success" = "true" ]; then
        # Extract and display message
        local message=$(echo "$response" | jq -r '.message // ""')
        if [ -n "$message" ]; then
            echo -e "$message"
        else
            # Fallback: pretty print the response
            echo "$response" | jq -r '.'
        fi
        return 0
    else
        # Display error
        local error=$(echo "$response" | jq -r '.error // "Unknown error"')
        echo -e "${RED}Error: $error${NC}"
        return 1
    fi
}

# Command dispatcher
case "${1:-help}" in
    check_balance|balance)
        echo -e "${BLUE}Checking your mining balance...${NC}"
        echo ""
        call_api "check_balance"
        ;;
        
    estimate_cost|estimate)
        echo -e "${BLUE}Estimating minting cost...${NC}"
        echo ""
        call_api "estimate_cost"
        ;;
        
    mint|mint_tokens)
        echo -e "${YELLOW}⚠️  Minting 10,000 REAGENT tokens...${NC}"
        echo ""
        call_api "mint_tokens"
        ;;
        
    history)
        shift
        echo -e "${BLUE}Fetching minting history...${NC}"
        echo ""
        call_api "get_history" "$@"
        ;;
        
    stats)
        echo -e "${BLUE}Fetching global mining statistics...${NC}"
        echo ""
        call_api "get_stats"
        ;;
        
    help|--help|-h)
        echo -e "${GREEN}ReAgent Minting Skill${NC}"
        echo ""
        echo "Usage: reagent_minting_curl.sh <command> [options]"
        echo ""
        echo "Commands:"
        echo "  ${GREEN}check_balance${NC}    Check USD and REAGENT balance"
        echo "  ${GREEN}estimate_cost${NC}    Estimate minting cost"
        echo "  ${GREEN}mint${NC}             Mint 10,000 REAGENT tokens"
        echo "  ${GREEN}history${NC}          Get minting history"
        echo "  ${GREEN}stats${NC}            Get global mining statistics"
        echo ""
        echo "Options for 'history':"
        echo "  --page <n>       Page number (default: 1)"
        echo "  --limit <n>      Items per page (default: 10)"
        echo "  --status <s>     Filter by status (pending/confirmed/failed)"
        echo ""
        echo "Examples:"
        echo "  reagent_minting_curl.sh check_balance"
        echo "  reagent_minting_curl.sh mint"
        echo "  reagent_minting_curl.sh history --page 1 --limit 5"
        echo "  reagent_minting_curl.sh stats"
        echo ""
        echo "Environment Variables:"
        echo "  REAGENT_API_BASE    API base URL (default: http://localhost:3000)"
        echo "  REAGENT_USER_ID     User ID for authentication (required)"
        ;;
        
    *)
        echo -e "${RED}Error: Unknown command '$1'${NC}"
        echo "Run 'reagent_minting_curl.sh help' for usage information"
        exit 1
        ;;
esac
