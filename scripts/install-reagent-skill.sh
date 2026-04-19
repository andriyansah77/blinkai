#!/bin/bash

# Install ReAgent Commands Skill for all Hermes profiles
# This script copies the skill files and installs them for each user

set -e

echo "🚀 Installing ReAgent Commands Skill..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SKILLS_SOURCE="$PROJECT_ROOT/hermes-skills"
HERMES_SKILLS_DIR="/root/.hermes/skills"
HERMES_PROFILES_DIR="/root/.hermes/profiles"

# Check if Hermes is installed
if ! command -v hermes &> /dev/null; then
    echo -e "${RED}❌ Hermes CLI not found!${NC}"
    echo "Please install Hermes first: pip install hermes-agent"
    exit 1
fi

echo -e "${GREEN}✓${NC} Hermes CLI found"

# Create Hermes skills directory if it doesn't exist
mkdir -p "$HERMES_SKILLS_DIR"
echo -e "${GREEN}✓${NC} Skills directory ready: $HERMES_SKILLS_DIR"

# Copy skill files to Hermes skills directory
echo ""
echo "📦 Copying skill files..."

if [ -f "$SKILLS_SOURCE/reagent_commands.py" ]; then
    cp "$SKILLS_SOURCE/reagent_commands.py" "$HERMES_SKILLS_DIR/"
    chmod +x "$HERMES_SKILLS_DIR/reagent_commands.py"
    echo -e "${GREEN}✓${NC} Copied reagent_commands.py"
else
    echo -e "${RED}❌ reagent_commands.py not found!${NC}"
    exit 1
fi

if [ -f "$SKILLS_SOURCE/reagent_commands.json" ]; then
    cp "$SKILLS_SOURCE/reagent_commands.json" "$HERMES_SKILLS_DIR/"
    echo -e "${GREEN}✓${NC} Copied reagent_commands.json"
else
    echo -e "${YELLOW}⚠${NC}  reagent_commands.json not found (optional)"
fi

# Install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
pip3 install requests &> /dev/null || true
echo -e "${GREEN}✓${NC} Python dependencies installed"

# Find all user profiles
echo ""
echo "👥 Finding user profiles..."

if [ ! -d "$HERMES_PROFILES_DIR" ]; then
    echo -e "${YELLOW}⚠${NC}  No Hermes profiles found at $HERMES_PROFILES_DIR"
    echo "Profiles will be created when users add Telegram channels"
    exit 0
fi

PROFILE_COUNT=0
INSTALLED_COUNT=0
FAILED_COUNT=0

for profile_dir in "$HERMES_PROFILES_DIR"/user-*; do
    if [ -d "$profile_dir" ]; then
        profile_name=$(basename "$profile_dir")
        PROFILE_COUNT=$((PROFILE_COUNT + 1))
        
        echo ""
        echo -e "${YELLOW}Installing for profile: $profile_name${NC}"
        
        # Check if profile has .env file with ReAgent credentials
        if [ -f "$profile_dir/.env" ]; then
            if grep -q "REAGENT_API_KEY" "$profile_dir/.env"; then
                echo -e "${GREEN}✓${NC} ReAgent credentials found"
            else
                echo -e "${YELLOW}⚠${NC}  ReAgent credentials not found in .env"
                echo "   Credentials will be added when user reconnects Telegram channel"
            fi
        else
            echo -e "${YELLOW}⚠${NC}  No .env file found"
        fi
        
        # Install skill for this profile
        echo "   Installing skill..."
        
        if hermes --profile "$profile_name" skills install reagent_commands &> /dev/null; then
            echo -e "${GREEN}✓${NC} Skill installed successfully"
            INSTALLED_COUNT=$((INSTALLED_COUNT + 1))
            
            # Restart gateway if running
            echo "   Restarting gateway..."
            if hermes --profile "$profile_name" gateway restart &> /dev/null; then
                echo -e "${GREEN}✓${NC} Gateway restarted"
            else
                echo -e "${YELLOW}⚠${NC}  Gateway not running (will start when needed)"
            fi
        else
            echo -e "${RED}✗${NC} Failed to install skill"
            FAILED_COUNT=$((FAILED_COUNT + 1))
        fi
    fi
done

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "   Profiles found: $PROFILE_COUNT"
echo "   Successfully installed: $INSTALLED_COUNT"
echo "   Failed: $FAILED_COUNT"
echo ""

if [ $INSTALLED_COUNT -gt 0 ]; then
    echo -e "${GREEN}🎉 ReAgent Commands skill is now available!${NC}"
    echo ""
    echo "Users can now:"
    echo "  • Check balance: 'Check my balance'"
    echo "  • Mine tokens: 'Mine 5 tokens'"
    echo "  • View wallet: 'Show my wallet'"
    echo "  • Get help: 'Help'"
    echo ""
fi

if [ $PROFILE_COUNT -eq 0 ]; then
    echo -e "${YELLOW}ℹ${NC}  No user profiles found yet."
    echo "Skill will be auto-installed when users add Telegram channels."
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
