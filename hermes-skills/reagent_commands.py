#!/usr/bin/env python3
"""
ReAgent Commands Skill
Direct API integration for Telegram bot
"""

import os
import json
import requests
from typing import Dict, Any

# Get credentials from environment
REAGENT_API_KEY = os.getenv('REAGENT_API_KEY', os.getenv('PLATFORM_API_KEY', ''))
REAGENT_USER_ID = os.getenv('REAGENT_USER_ID', '')
REAGENT_API_BASE = os.getenv('REAGENT_API_BASE', 'https://reagent.eu.cc')

def call_reagent_api(command: str) -> Dict[str, Any]:
    """
    Call ReAgent API with command
    """
    url = f"{REAGENT_API_BASE}/api/hermes/commands"
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {REAGENT_API_KEY}',
        'X-User-ID': REAGENT_USER_ID
    }
    
    payload = {
        'command': command
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'error': f'API call failed: {str(e)}'
        }

def check_balance() -> str:
    """
    Check wallet balance
    """
    result = call_reagent_api('/balance')
    
    if result.get('success'):
        return result.get('output', 'Balance retrieved successfully')
    else:
        return f"❌ Failed to check balance: {result.get('error', 'Unknown error')}"

def mine_tokens(amount: int = 1) -> str:
    """
    Mine REAGENT tokens
    """
    if amount < 1 or amount > 10:
        return "❌ Invalid amount. Please specify 1-10 tokens."
    
    result = call_reagent_api(f'/mine {amount}')
    
    if result.get('success'):
        return result.get('output', 'Mining started successfully')
    else:
        return f"❌ Mining failed: {result.get('error', 'Unknown error')}"

def show_wallet() -> str:
    """
    Show wallet information
    """
    result = call_reagent_api('/wallet')
    
    if result.get('success'):
        return result.get('output', 'Wallet info retrieved successfully')
    else:
        return f"❌ Failed to get wallet info: {result.get('error', 'Unknown error')}"

def show_help() -> str:
    """
    Show help message
    """
    result = call_reagent_api('/help')
    
    if result.get('success'):
        return result.get('output', 'Help retrieved successfully')
    else:
        # Fallback help message
        return """Available Commands:
==================

/help - Show this help message
/mine [amount] - Auto mine REAGENT tokens (1-10)
/balance - Check wallet balance
/wallet - Show wallet information

Examples:
---------
/mine 5 - Mine 5 REAGENT tokens
/balance - Check your balance
/wallet - Show wallet address and info"""

# Main function for Hermes skill
def main(user_message: str) -> str:
    """
    Main entry point for Hermes skill
    """
    message = user_message.lower().strip()
    
    # Check for balance request
    if any(word in message for word in ['balance', 'saldo', 'check balance', 'cek saldo']):
        return check_balance()
    
    # Check for mining request
    if any(word in message for word in ['mine', 'mining', 'mint', 'minting']):
        # Extract amount if specified
        words = message.split()
        amount = 1
        for word in words:
            if word.isdigit():
                amount = int(word)
                break
        return mine_tokens(amount)
    
    # Check for wallet request
    if any(word in message for word in ['wallet', 'address', 'alamat']):
        return show_wallet()
    
    # Check for help request
    if any(word in message for word in ['help', 'bantuan', 'command', 'perintah']):
        return show_help()
    
    # Default: show help
    return show_help()

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        user_input = ' '.join(sys.argv[1:])
        print(main(user_input))
    else:
        print("Usage: python reagent_commands.py <message>")
