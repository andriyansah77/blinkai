#!/bin/bash

# Script to migrate all API routes from NextAuth to Privy
# This script replaces getServerSession with getPrivySession

echo "🔄 Migrating API routes from NextAuth to Privy..."

# Find all route.ts files in src/app/api
find blinkai/src/app/api -name "route.ts" -type f | while read -r file; do
  # Check if file contains getServerSession
  if grep -q "getServerSession" "$file"; then
    echo "📝 Migrating: $file"
    
    # Replace imports
    sed -i 's/import { getServerSession } from "next-auth";/\/\/ Migrated to Privy authentication/g' "$file"
    sed -i 's/import { authOptions } from "@\/lib\/auth";/import { getPrivySession } from "@\/lib\/privy-server";/g' "$file"
    
    # Replace function calls
    sed -i 's/const session = await getServerSession(authOptions);/const session = await getPrivySession(request);/g' "$file"
    sed -i 's/const session = await getServerSession(authOptions)/const session = await getPrivySession(request)/g' "$file"
    
    echo "✅ Migrated: $file"
  fi
done

echo "✨ Migration complete!"
