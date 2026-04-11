#!/bin/bash

# Update all existing user profiles with latest profile files

echo "Updating user profiles with latest PLATFORM.md, TOOLS.md, and SOUL.md..."

SOURCE_DIR="/root/blinkai/hermes-profiles"
PROFILES_DIR="/root/.hermes/profiles"

# Check if source files exist
if [ ! -f "$SOURCE_DIR/PLATFORM.md" ] || [ ! -f "$SOURCE_DIR/TOOLS.md" ] || [ ! -f "$SOURCE_DIR/SOUL.md" ]; then
    echo "Error: Source profile files not found in $SOURCE_DIR"
    exit 1
fi

# Count profiles
PROFILE_COUNT=$(ls -d $PROFILES_DIR/user-* 2>/dev/null | wc -l)

if [ $PROFILE_COUNT -eq 0 ]; then
    echo "No user profiles found in $PROFILES_DIR"
    exit 0
fi

echo "Found $PROFILE_COUNT user profiles"
echo ""

# Update each profile
UPDATED=0
FAILED=0

for profile in $PROFILES_DIR/user-*; do
    if [ -d "$profile" ]; then
        PROFILE_NAME=$(basename "$profile")
        echo "Updating $PROFILE_NAME..."
        
        # Copy PLATFORM.md
        if cp "$SOURCE_DIR/PLATFORM.md" "$profile/PLATFORM.md"; then
            echo "  ✓ PLATFORM.md copied"
        else
            echo "  ✗ PLATFORM.md failed"
            ((FAILED++))
            continue
        fi
        
        # Copy TOOLS.md
        if cp "$SOURCE_DIR/TOOLS.md" "$profile/TOOLS.md"; then
            echo "  ✓ TOOLS.md copied"
        else
            echo "  ✗ TOOLS.md failed"
            ((FAILED++))
            continue
        fi
        
        # Copy SOUL.md
        if cp "$SOURCE_DIR/SOUL.md" "$profile/SOUL.md"; then
            echo "  ✓ SOUL.md copied"
        else
            echo "  ✗ SOUL.md failed"
            ((FAILED++))
            continue
        fi
        
        ((UPDATED++))
        echo "  ✅ $PROFILE_NAME updated successfully"
        echo ""
    fi
done

echo "========================================="
echo "Update Complete!"
echo "  Total profiles: $PROFILE_COUNT"
echo "  Successfully updated: $UPDATED"
echo "  Failed: $FAILED"
echo "========================================="

exit 0
