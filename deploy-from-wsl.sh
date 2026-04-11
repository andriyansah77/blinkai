#!/bin/bash

# REAGENT Token Deployment Script for WSL/Linux
# This script deploys REAGENT token to Tempo mainnet using Tempo CLI

set -e

echo "🚀 REAGENT Token Production Deployment (WSL/Linux)"
echo ""
echo "⚠️  WARNING: Deploying to TEMPO MAINNET with REAL tokens!"
echo ""

# Load Tempo CLI environment
if [ -f "$HOME/.tempo/env" ]; then
    source "$HOME/.tempo/env"
fi

# Check if tempo command is available
if ! command -v tempo &> /dev/null; then
    echo "❌ Tempo CLI not found in PATH"
    echo ""
    echo "Please run:"
    echo "  source ~/.tempo/env"
    echo "  OR"
    echo "  export PATH=\"\$HOME/.tempo/bin:\$PATH\""
    exit 1
fi

echo "✅ Tempo CLI found: $(tempo --version)"
echo ""

# Run the deployment script
echo "🚀 Starting deployment..."
echo ""

npm run reagent:deploy:production
