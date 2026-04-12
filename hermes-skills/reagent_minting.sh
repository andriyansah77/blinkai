#!/bin/bash
# ReAgent Minting Skill - Shell Script Wrapper
# This script provides minting capabilities to Hermes AI agents via HTTP API

ACTION="$1"
shift

# API endpoint
API_BASE="http://localhost:3000/api/hermes/skills/minting"

# Get session token from environment (set by Hermes)
SESSION_TOKEN="${REAGENT_SESSION_TOKEN:-}"

# Function to make API call
call_api() {
    local action="$1"
    shift
    
    # Build JSON payload
    local payload="{\"action\":\"$action\""
    
    # Add additional parameters if provided
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
    
    # Make HTTP request using curl
    response=$(curl -s -X POST "$API_BASE" \
        -H "Content-Type: application/json" \
        -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
        -d "$payload")
    
    # Extract message field from JSON response
    message=$(echo "$response" | grep -o '"message":"[^"]*"' | sed 's/"message":"//;s/"$//' | sed 's/\\n/\n/g')
    
    # If message exists, print it
    if [ -n "$message" ]; then
        echo "$message"
    else
        # Otherwise print the full response
        echo "$response"
    fi
}

# Main command dispatcher
case "$ACTION" in
    check_balance|balance)
        call_api "check_balance"
        ;;
    estimate_cost|estimate)
        call_api "estimate_cost"
        ;;
    mint|mint_tokens)
        call_api "mint_tokens"
        ;;
    history)
        call_api "get_history" "$@"
        ;;
    stats)
        call_api "get_stats"
        ;;
    help|--help|-h)
        echo "ReAgent Minting Skill"
        echo ""
        echo "Usage: reagent_minting.sh <command> [options]"
        echo ""
        echo "Commands:"
        echo "  check_balance    Check USD and REAGENT balance"
        echo "  estimate_cost    Estimate minting cost"
        echo "  mint             Mint 10,000 REAGENT tokens"
        echo "  history          Get minting history"
        echo "  stats            Get global mining statistics"
        echo ""
        echo "Options for 'history':"
        echo "  --page <n>       Page number (default: 1)"
        echo "  --limit <n>      Items per page (default: 10)"
        echo "  --status <s>     Filter by status (pending/confirmed/failed)"
        echo ""
        echo "Examples:"
        echo "  reagent_minting.sh check_balance"
        echo "  reagent_minting.sh mint"
        echo "  reagent_minting.sh history --page 1 --limit 5"
        ;;
    *)
        echo "Error: Unknown command '$ACTION'"
        echo "Run 'reagent_minting.sh help' for usage information"
        exit 1
        ;;
esac
