#!/usr/bin/env python3
"""
Fix POST/PUT/DELETE methods that don't have request parameter
"""

import os
import re
from pathlib import Path

def fix_method(filepath):
    """Fix methods to include request parameter"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix POST methods without request parameter
        content = re.sub(
            r'export async function POST\(\)\s*{',
            'export async function POST(request: NextRequest) {',
            content
        )
        
        # Fix PUT methods without request parameter
        content = re.sub(
            r'export async function PUT\(\)\s*{',
            'export async function PUT(request: NextRequest) {',
            content
        )
        
        # Fix DELETE methods without request parameter
        content = re.sub(
            r'export async function DELETE\(\)\s*{',
            'export async function DELETE(request: NextRequest) {',
            content
        )
        
        # Fix PATCH methods without request parameter
        content = re.sub(
            r'export async function PATCH\(\)\s*{',
            'export async function PATCH(request: NextRequest) {',
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
    print("🔄 Fixing HTTP methods...")
    
    # Find all route.ts files in src/app/api
    api_dir = Path('blinkai/src/app/api')
    if not api_dir.exists():
        print(f"❌ API directory not found: {api_dir}")
        return
    
    route_files = list(api_dir.rglob('route.ts'))
    print(f"📁 Found {len(route_files)} route files")
    
    fixed_count = 0
    for route_file in route_files:
        if fix_method(route_file):
            print(f"✅ Fixed: {route_file}")
            fixed_count += 1
    
    print(f"\n✨ Fixed {fixed_count} files")

if __name__ == '__main__':
    main()
