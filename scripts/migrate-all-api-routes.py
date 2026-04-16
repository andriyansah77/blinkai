#!/usr/bin/env python3
"""
Script to migrate all API routes from NextAuth to Privy authentication
"""

import os
import re
from pathlib import Path

def migrate_file(filepath):
    """Migrate a single file from NextAuth to Privy"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if file needs migration
        if 'getServerSession' not in content:
            return False
        
        original_content = content
        
        # Replace imports
        content = re.sub(
            r'import\s+{\s*getServerSession\s*}\s+from\s+["\']next-auth["\'];?\s*\n',
            '',
            content
        )
        content = re.sub(
            r'import\s+{\s*authOptions\s*}\s+from\s+["\']@/lib/auth["\'];?\s*\n',
            'import { getPrivySession } from "@/lib/privy-server";\n',
            content
        )
        
        # Replace function calls
        content = re.sub(
            r'const\s+session\s*=\s*await\s+getServerSession\(authOptions\);?',
            'const session = await getPrivySession(request);',
            content
        )
        content = re.sub(
            r'const\s+session\s*=\s*await\s+getServerSession\(authOptions\)',
            'const session = await getPrivySession(request)',
            content
        )
        
        # Only write if content changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
    except Exception as e:
        print(f"❌ Error migrating {filepath}: {e}")
        return False

def main():
    """Main migration function"""
    print("🔄 Starting API routes migration from NextAuth to Privy...")
    
    # Find all route.ts files in src/app/api
    api_dir = Path('blinkai/src/app/api')
    if not api_dir.exists():
        print(f"❌ API directory not found: {api_dir}")
        return
    
    route_files = list(api_dir.rglob('route.ts'))
    print(f"📁 Found {len(route_files)} route files")
    
    migrated_count = 0
    for route_file in route_files:
        if migrate_file(route_file):
            print(f"✅ Migrated: {route_file}")
            migrated_count += 1
        else:
            print(f"⏭️  Skipped: {route_file}")
    
    print(f"\n✨ Migration complete! Migrated {migrated_count}/{len(route_files)} files")

if __name__ == '__main__':
    main()
