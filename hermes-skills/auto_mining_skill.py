#!/usr/bin/env python3
"""
Auto Mining Skill for ReAgent
Allows AI agent to automatically mint REAGENT tokens on behalf of user
"""

import os
import sys
import json
import requests
from typing import Dict, Any, Optional

# Get platform URL from environment
PLATFORM_URL = os.getenv('REAGENT_PLATFORM_URL', 'https://reagent.eu.cc')

def get_user_wallet(api_key: str) -> Optional[Dict[str, Any]]:
    """Get user's wallet information"""
    try:
        response = requests.get(
            f"{PLATFORM_URL}/api/wallet",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error fetching wallet: {response.status_code}", file=sys.stderr)
            return None
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return None

def check_balance(api_key: str) -> Dict[str, Any]:
    """Check user's PATHUSD balance"""
    wallet = get_user_wallet(api_key)
    if not wallet:
        return {
            "success": False,
            "error": "Failed to fetch wallet information"
        }
    
    pathusd_balance = float(wallet.get('pathusdBalance', 0))
    reagent_balance = float(wallet.get('reagentBalance', 0))
    
    return {
        "success": True,
        "pathusd_balance": pathusd_balance,
        "reagent_balance": reagent_balance,
        "wallet_address": wallet.get('address'),
        "can_mint": pathusd_balance >= 0.5  # Minimum for auto minting
    }

def start_auto_mining(api_key: str, count: int = 1) -> Dict[str, Any]:
    """
    Start automatic mining/minting of REAGENT tokens
    
    Args:
        api_key: User's API key for authentication
        count: Number of minting operations to perform (default: 1)
    
    Returns:
        Dict with success status and details
    """
    # Check balance first
    balance_check = check_balance(api_key)
    if not balance_check.get('success'):
        return balance_check
    
    if not balance_check.get('can_mint'):
        return {
            "success": False,
            "error": f"Insufficient PATHUSD balance. Current: {balance_check.get('pathusd_balance', 0)}, Required: 0.5"
        }
    
    results = []
    successful = 0
    failed = 0
    
    for i in range(count):
        try:
            print(f"Starting minting operation {i+1}/{count}...", file=sys.stderr)
            
            response = requests.post(
                f"{PLATFORM_URL}/api/mining/inscribe",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "confirm": True,
                    "forceClientSigning": False  # Use server-side if available
                },
                timeout=60
            )
            
            result = response.json()
            
            if response.status_code == 200 and result.get('success'):
                successful += 1
                results.append({
                    "operation": i + 1,
                    "success": True,
                    "tokens_earned": result.get('tokensEarned', '10000'),
                    "tx_hash": result.get('txHash'),
                    "inscription_id": result.get('inscriptionId')
                })
                print(f"✓ Minting {i+1} successful: {result.get('tokensEarned', '10000')} REAGENT", file=sys.stderr)
            else:
                failed += 1
                error_msg = result.get('error', {}).get('message', 'Unknown error')
                results.append({
                    "operation": i + 1,
                    "success": False,
                    "error": error_msg
                })
                print(f"✗ Minting {i+1} failed: {error_msg}", file=sys.stderr)
                
                # Stop if rate limited
                if result.get('error', {}).get('code') == 'RATE_LIMIT_EXCEEDED':
                    print("Rate limit reached, stopping...", file=sys.stderr)
                    break
                    
        except Exception as e:
            failed += 1
            results.append({
                "operation": i + 1,
                "success": False,
                "error": str(e)
            })
            print(f"✗ Minting {i+1} error: {str(e)}", file=sys.stderr)
    
    return {
        "success": successful > 0,
        "total_operations": count,
        "successful": successful,
        "failed": failed,
        "total_tokens_earned": successful * 10000,
        "results": results
    }

def get_mining_status(api_key: str) -> Dict[str, Any]:
    """Get current mining status and history"""
    try:
        response = requests.get(
            f"{PLATFORM_URL}/api/mining/status",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            return {
                "success": False,
                "error": f"Failed to fetch status: {response.status_code}"
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def main():
    """Main entry point for the skill"""
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: auto_mining_skill.py <command> [args]",
            "commands": {
                "check_balance": "Check PATHUSD and REAGENT balance",
                "start_mining": "Start auto mining (optional: count=N)",
                "get_status": "Get mining status and history"
            }
        }))
        sys.exit(1)
    
    command = sys.argv[1]
    
    # Get API key from environment
    api_key = os.getenv('REAGENT_API_KEY')
    if not api_key:
        print(json.dumps({
            "success": False,
            "error": "REAGENT_API_KEY environment variable not set"
        }))
        sys.exit(1)
    
    # Execute command
    if command == "check_balance":
        result = check_balance(api_key)
    elif command == "start_mining":
        count = 1
        if len(sys.argv) > 2:
            try:
                count = int(sys.argv[2])
            except ValueError:
                count = 1
        result = start_auto_mining(api_key, count)
    elif command == "get_status":
        result = get_mining_status(api_key)
    else:
        result = {
            "success": False,
            "error": f"Unknown command: {command}"
        }
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
