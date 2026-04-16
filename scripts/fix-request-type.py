#!/usr/bin/env python3
"""
Fix Request type to NextRequest
"""

import os
import re
from pathlib import Path

def fix_request_type(filepath):
    """Fix Request type to NextRequest"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix function parameters: request: Request -> request: NextRequest
        content = re.sub(
            r'\(request:\s*Request\)',
            '(request: NextRequest)',
            content
        )
        
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
    print("🔄 Fixing Request type to NextRequest...")
    
    # Find all route.ts files in src/app/api
    api_dir = Path('blinkai/src/app/api')
    if not api_dir.exists():
        print(f"❌ API directory not found: {api_dir}")
        return
    
    route_files = list(api_dir.rglob('route.ts'))
    print(f"📁 Found {len(route_files)} route files")
    
    fixed_count = 0
    for route_file in route_files:
        if fix_request_type(route_file):
            print(f"✅ Fixed: {route_file}")
            fixed_count += 1
    
    print(f"\n✨ Fixed {fixed_count} files")

if __name__ == '__main__':
    main()
