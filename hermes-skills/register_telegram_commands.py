#!/usr/bin/env python3
"""
Register Telegram Bot Commands
Run this script to register slash commands with your Telegram bot
"""

import os
import sys
import requests
from telegram_commands_skill import TelegramCommandsSkill

def register_commands(bot_token: str) -> bool:
    """Register commands with Telegram Bot API"""
    
    print("🤖 Registering Telegram Bot Commands...\n")
    
    # Initialize skill
    skill = TelegramCommandsSkill()
    
    # Get commands
    commands = skill.get_telegram_commands()
    
    print("Commands to register:")
    for cmd in commands:
        print(f"  /{cmd['command']} - {cmd['description']}")
    print()
    
    # Register with Telegram
    try:
        url = f"https://api.telegram.org/bot{bot_token}/setMyCommands"
        response = requests.post(
            url,
            json={"commands": commands},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('ok'):
                print("✅ Commands registered successfully!\n")
                
                # Get bot info
                bot_info_url = f"https://api.telegram.org/bot{bot_token}/getMe"
                bot_info_response = requests.get(bot_info_url, timeout=10)
                
                if bot_info_response.status_code == 200:
                    bot_info = bot_info_response.json()
                    if bot_info.get('ok'):
                        bot_data = bot_info.get('result', {})
                        print(f"Bot: {bot_data.get('first_name')} (@{bot_data.get('username')})")
                        print(f"ID: {bot_data.get('id')}\n")
                
                print("Next steps:")
                print("1. Open Telegram and search for your bot")
                print("2. Type / to see the commands")
                print("3. Test with /start")
                
                return True
            else:
                print(f"❌ Failed: {result.get('description')}")
                return False
        else:
            print(f"❌ HTTP error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    """Main function"""
    
    # Get bot token from environment or argument
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    
    if not bot_token and len(sys.argv) > 1:
        bot_token = sys.argv[1]
    
    if not bot_token:
        print("❌ Error: Bot token not provided\n")
        print("Usage:")
        print("  python register_telegram_commands.py YOUR_BOT_TOKEN")
        print("  or")
        print("  export TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN")
        print("  python register_telegram_commands.py")
        print("\nGet your bot token from @BotFather on Telegram")
        sys.exit(1)
    
    # Register commands
    success = register_commands(bot_token)
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
