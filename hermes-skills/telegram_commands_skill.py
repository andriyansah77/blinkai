"""
Telegram Slash Commands Skill for Hermes
Handles /mine and other slash commands in Telegram bot
"""

import os
import json
import requests
from typing import Dict, Any, Optional

# Platform configuration
PLATFORM_URL = os.getenv('PLATFORM_URL', 'https://reagent.eu.cc')
PLATFORM_API_KEY = os.getenv('PLATFORM_API_KEY', '')

class TelegramCommandsSkill:
    """Handle Telegram slash commands"""
    
    def __init__(self):
        self.name = "telegram_commands"
        self.description = "Handle Telegram slash commands like /mine, /balance, /wallet"
        self.version = "1.0.0"
        
    def is_command(self, message: str) -> bool:
        """Check if message is a slash command"""
        return message.strip().startswith('/')
    
    def parse_command(self, message: str) -> tuple[str, list[str]]:
        """Parse command and arguments"""
        parts = message.strip().split()
        command = parts[0].lower()
        args = parts[1:] if len(parts) > 1 else []
        return command, args
    
    def get_user_session(self, telegram_user_id: str) -> Optional[Dict[str, Any]]:
        """Get user session from platform using Telegram user ID"""
        try:
            # Call platform API to get user by telegram ID
            response = requests.get(
                f"{PLATFORM_URL}/api/telegram/user",
                params={"telegram_id": telegram_user_id},
                headers={
                    "Authorization": f"Bearer {PLATFORM_API_KEY}",
                    "Content-Type": "application/json"
                },
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Failed to get user session: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"Error getting user session: {e}")
            return None
    
    def handle_mine_command(self, user_id: str, args: list[str]) -> str:
        """Handle /mine command - uses same API as webchat"""
        try:
            # Parse amount (default 1)
            amount = 1
            if args and args[0].isdigit():
                amount = int(args[0])
                if amount < 1 or amount > 10:
                    return "❌ Amount must be between 1 and 10"
            
            # Track results
            successful_mints = 0
            failed_mints = 0
            total_tokens = 0
            last_tx_hash = None
            error_message = None
            
            # Mine multiple times if amount > 1
            for i in range(amount):
                try:
                    # Call simple-mint API (same as webchat)
                    response = requests.post(
                        f"{PLATFORM_URL}/api/mining/simple-mint",
                        headers={
                            "Authorization": f"Bearer {PLATFORM_API_KEY}",
                            "Content-Type": "application/json",
                            "X-User-ID": user_id
                        },
                        json={"type": "auto"},  # Auto mining via bot
                        timeout=30
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        if result.get('success'):
                            successful_mints += 1
                            tokens = result.get('tokensEarned', 10000)
                            total_tokens += tokens
                            last_tx_hash = result.get('txHash')
                        else:
                            failed_mints += 1
                            error_message = result.get('error', 'Unknown error')
                    else:
                        failed_mints += 1
                        error_message = f"Server error ({response.status_code})"
                        
                except Exception as e:
                    failed_mints += 1
                    error_message = str(e)
            
            # Build response message
            if successful_mints > 0:
                message = f"""✅ Mining completed!

🎉 Successful: {successful_mints}/{amount}
🪙 Total earned: {total_tokens:,} REAGENT
"""
                if last_tx_hash:
                    message += f"""📝 Last TX: {last_tx_hash[:10]}...{last_tx_hash[-8:]}
🔗 Explorer: https://explore.tempo.xyz/tx/{last_tx_hash}
"""
                
                if failed_mints > 0:
                    message += f"\n⚠️ Failed: {failed_mints} (Reason: {error_message})"
                
                return message
            else:
                return f"❌ All mining attempts failed: {error_message}"
                
        except Exception as e:
            return f"❌ Mining failed: {str(e)}\n\nUsage: /mine [amount]\nExample: /mine 5"
    
    def handle_balance_command(self, user_id: str) -> str:
        """Handle /balance command"""
        try:
            response = requests.get(
                f"{PLATFORM_URL}/api/wallet/balance",
                headers={
                    "Authorization": f"Bearer {PLATFORM_API_KEY}",
                    "X-User-ID": user_id
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                reagent = data.get('reagentBalance', '0')
                pathusd = data.get('pathusdBalance', '0')
                address = data.get('address', 'N/A')
                
                return f"""💰 Your Balance

🪙 REAGENT: {reagent}
💵 PATHUSD: {pathusd}

📍 Wallet: {address[:10]}...{address[-8:]}
🔗 View: https://explore.tempo.xyz/address/{address}
"""
            else:
                return "❌ Failed to get balance"
                
        except Exception as e:
            return f"❌ Error: {str(e)}"
    
    def handle_wallet_command(self, user_id: str) -> str:
        """Handle /wallet command"""
        try:
            response = requests.get(
                f"{PLATFORM_URL}/api/wallet/info",
                headers={
                    "Authorization": f"Bearer {PLATFORM_API_KEY}",
                    "X-User-ID": user_id
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                address = data.get('address', 'N/A')
                network = data.get('network', 'tempo')
                created = data.get('createdAt', 'N/A')
                
                return f"""👛 Your Wallet

📍 Address: {address}
🌐 Network: {network.upper()}
📅 Created: {created[:10]}

🔗 Explorer: https://explore.tempo.xyz/address/{address}

⚠️ Keep your wallet safe!
"""
            else:
                return "❌ Failed to get wallet info"
                
        except Exception as e:
            return f"❌ Error: {str(e)}"
    
    def handle_help_command(self) -> str:
        """Handle /help command"""
        return """🤖 ReAgent Bot Commands

⛏️ Mining:
/mine [amount] - Mine REAGENT tokens (1-10)
Example: /mine 5

💰 Wallet:
/balance - Check your balance
/wallet - View wallet info

ℹ️ Info:
/help - Show this help message
/start - Start using the bot

📚 Learn more: https://reagent.eu.cc
"""
    
    def handle_start_command(self, telegram_user_id: str) -> str:
        """Handle /start command"""
        return f"""👋 Welcome to ReAgent!

I'm your AI-powered mining assistant on Tempo Network.

🎯 Quick Start:
1. Your wallet is automatically created
2. Use /mine to start mining REAGENT tokens
3. Use /balance to check your balance

💡 Need help? Use /help

Let's start mining! ⛏️
"""
    
    def handle_command(self, message: str, telegram_user_id: str, user_id: Optional[str] = None) -> str:
        """Main command handler"""
        
        # Check if it's a command
        if not self.is_command(message):
            return None  # Not a command, let normal chat flow handle it
        
        # Parse command
        command, args = self.parse_command(message)
        
        # Handle commands that don't need user session
        if command == '/help':
            return self.handle_help_command()
        
        if command == '/start':
            return self.handle_start_command(telegram_user_id)
        
        # For other commands, we need user session
        if not user_id:
            # Try to get user session from Telegram ID
            session = self.get_user_session(telegram_user_id)
            if not session:
                return """❌ Account not linked

Please visit https://reagent.eu.cc and:
1. Sign up / Login
2. Go to Dashboard → Channels
3. Connect your Telegram bot
4. Link your account with /start

Then try again!
"""
            user_id = session.get('userId')
        
        # Handle commands that need user session
        if command == '/mine':
            return self.handle_mine_command(user_id, args)
        
        elif command == '/balance':
            return self.handle_balance_command(user_id)
        
        elif command == '/wallet':
            return self.handle_wallet_command(user_id)
        
        else:
            return f"❌ Unknown command: {command}\n\nUse /help to see available commands."


# Skill metadata for Hermes
SKILL_METADATA = {
    "name": "telegram_commands",
    "version": "1.0.0",
    "description": "Handle Telegram slash commands like /mine, /balance, /wallet",
    "author": "ReAgent Team",
    "commands": [
        "/mine [amount] - Mine REAGENT tokens",
        "/balance - Check balance",
        "/wallet - View wallet info",
        "/help - Show help",
        "/start - Start bot"
    ]
}


# Main execution for testing
if __name__ == "__main__":
    skill = TelegramCommandsSkill()
    
    # Test commands
    test_user_id = "test_user_123"
    test_telegram_id = "telegram_123"
    
    print("Testing /help:")
    print(skill.handle_command("/help", test_telegram_id))
    print("\n" + "="*50 + "\n")
    
    print("Testing /start:")
    print(skill.handle_command("/start", test_telegram_id))
    print("\n" + "="*50 + "\n")
    
    print("Testing /mine:")
    print(skill.handle_command("/mine 3", test_telegram_id, test_user_id))
