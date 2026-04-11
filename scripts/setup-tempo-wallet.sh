#!/bin/bash
# Setup Tempo Wallet CLI for automated deployment

echo "🚀 Setting up Tempo Wallet CLI"
echo ""

# Check if tempo CLI is installed
if ! command -v tempo &> /dev/null; then
    echo "📦 Installing Tempo CLI..."
    curl -L https://tempo.xyz/install | bash
    
    # Add to PATH for current session
    export PATH="$HOME/.tempo/bin:$PATH"
    
    echo "✅ Tempo CLI installed"
else
    echo "✅ Tempo CLI already installed"
fi

# Check tempo version
echo ""
echo "📋 Tempo CLI version:"
tempo --version

# Login to Tempo Wallet
echo ""
echo "🔐 Logging in to Tempo Wallet..."
echo "   This will open a browser window for authentication"
tempo wallet login

# Check wallet status
echo ""
echo "💰 Wallet status:"
tempo wallet status

# Get wallet address
echo ""
echo "📍 Wallet address:"
tempo wallet address

echo ""
echo "✅ Tempo Wallet setup complete!"
echo ""
echo "Next steps:"
echo "  1. Fund your wallet with test tokens"
echo "  2. Run deployment: npm run reagent:deploy:tempo"
