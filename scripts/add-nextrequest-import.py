#!/usr/bin/env python3
"""
Add NextRequest import to files that need it
"""

import os
import re
from pathlib import Path

def add_nextrequest_import(filepath):
    """Add NextRequest import if needed"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Check if file uses NextRequest but doesn't import it
        if 'NextRequest' in content and 'import { NextRequest' not in content and 'import type { NextRequest' not in content:
            # Find the NextResponse import line
            if 'import { NextResponse } from' in content:
                # Add NextRequest to existing import
                content = re.sub(
                    r'import\s+{\s*NextResponse\s*}\s+from\s+["\']next/server["\'];?',
                    'import { NextRequest, NextResponse } from "next/server";',
                    content
                )
            elif 'import type { NextResponse } from' in content:
                # Add NextRequest to existing type import
                content = re.sub(
                    r'import\s+type\s+{\s*NextResponse\s*}\s+from\s+["\']next/server["\'];?',
                    'import type { NextRequest, NextResponse } from "next/server";',
                    content
                )
            else:
                # Add new import at the top
                lines = content.split('\n')
                # Find first import line
                for i, line in enumerate(lines):
                    if line.startswith('import '):
                        lines.insert(i, 'import { NextRequest, NextResponse } from "next/server";')
                        break
                content = '\n'.join(lines)
        
        # Only write if content changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
    except Exception as e:
        print(f"❌ Error fixing {filepath}: {e}")
        return False

def main():
    """Main function"""
    print("🔄 Adding NextRequest imports...")
    
    # Find all route.ts files in src/app/api
    api_dir = Path('blinkai/src/app/api')
    if not api_dir.exists():
        print(f"❌ API directory not found: {api_dir}")
        return
    
    route_files = list(api_dir.rglob('route.ts'))
    print(f"📁 Found {len(route_files)} route files")
    
    fixed_count = 0
    for route_file in route_files:
        if add_nextrequest_import(route_file):
            print(f"✅ Fixed: {route_file}")
            fixed_count += 1
    
    print(f"\n✨ Fixed {fixed_count} files")

if __name__ == '__main__':
    main()
