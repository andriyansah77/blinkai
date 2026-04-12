#!/bin/bash
# Update all user profiles with guidance-based TOOLS.md and SOUL.md
# This script updates the AI agent behavior to guide users instead of executing directly

echo "🔄 Updating user profiles with guidance-based approach..."

# Source files
SOURCE_TOOLS="/root/blinkai/hermes-profiles/TOOLS.md"
SOURCE_SOUL="/root/blinkai/hermes-profiles/SOUL.md"

# Check if source files exist
if [ ! -f "$SOURCE_TOOLS" ]; then
    echo "❌ Error: TOOLS.md not found at $SOURCE_TOOLS"
    exit 1
fi

if [ ! -f "$SOURCE_SOUL" ]; then
    echo "❌ Error: SOUL.md not found at $SOURCE_SOUL"
    exit 1
fi

# Get all user profiles
PROFILES_DIR="/root/.hermes/profiles"

if [ ! -d "$PROFILES_DIR" ]; then
    echo "❌ Error: Profiles directory not found at $PROFILES_DIR"
    exit 1
fi

# Counter
updated=0
failed=0

# Iterate through all user profiles
for profile_dir in "$PROFILES_DIR"/user-*; do
    if [ -d "$profile_dir" ]; then
        profile_name=$(basename "$profile_dir")
        echo ""
        echo "📝 Updating profile: $profile_name"
        
        # Copy TOOLS.md
        if cp "$SOURCE_TOOLS" "$profile_dir/TOOLS.md"; then
            echo "  ✅ TOOLS.md updated"
        else
            echo "  ❌ Failed to update TOOLS.md"
            ((failed++))
            continue
        fi
        
        # Copy SOUL.md
        if cp "$SOURCE_SOUL" "$profile_dir/SOUL.md"; then
            echo "  ✅ SOUL.md updated"
        else
            echo "  ❌ Failed to update SOUL.md"
            ((failed++))
            continue
        fi
        
        ((updated++))
        echo "  ✅ Profile updated successfully"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Update Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Profiles updated: $updated"
echo "❌ Failed: $failed"
echo ""

if [ $updated -gt 0 ]; then
    echo "🎉 User profiles updated successfully!"
    echo ""
    echo "Changes applied:"
    echo "  • AI agents now guide users through web interface"
    echo "  • Removed direct minting execution"
    echo "  • Updated response templates for guidance"
    echo "  • Simplified conversation initialization"
    echo ""
    echo "Users will now receive step-by-step guidance instead of direct execution."
else
    echo "⚠️  No profiles were updated"
fi
