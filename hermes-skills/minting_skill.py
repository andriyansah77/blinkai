"""
ReAgent Minting Skill

This skill enables AI agents to mint REAGENT tokens on behalf of users.
It provides balance validation, cost estimation, and minting execution capabilities.

Skill Type: Proprietary (Auto-installed, cannot be uninstalled)
Platform: ReAgent
Token: REAGENT (TIP-20 on Tempo Network)
"""

import requests
import json
from typing import Dict, Any, Optional

class MintingSkill:
    """
    Minting skill for ReAgent AI agents.
    Enables automated token minting with balance validation and cost estimation.
    """
    
    def __init__(self, api_base_url: str = "http://localhost:3000", auth_token: Optional[str] = None):
        """
        Initialize the minting skill.
        
        Args:
            api_base_url: Base URL for ReAgent API
            auth_token: Authentication token for API requests
        """
        self.api_base_url = api_base_url.rstrip('/')
        self.auth_token = auth_token
        self.headers = {
            'Content-Type': 'application/json'
        }
        if auth_token:
            self.headers['Authorization'] = f'Bearer {auth_token}'
    
    def get_balance(self) -> Dict[str, Any]:
        """
        Get user's PATHUSD and REAGENT balance.
        
        Returns:
            Dict containing balance information
        """
        try:
            response = requests.get(
                f'{self.api_base_url}/api/wallet',
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()
            
            # Ensure we return pathusdBalance as the primary balance
            if data.get('success'):
                data['usdBalance'] = data.get('pathusdBalance', 0)
            
            return data
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to get balance: {str(e)}'
            }
    
    def estimate_minting_cost(self) -> Dict[str, Any]:
        """
        Estimate the cost of minting REAGENT tokens.
        
        Returns:
            Dict containing cost estimation
        """
        try:
            response = requests.get(
                f'{self.api_base_url}/api/mining/estimate',
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to estimate cost: {str(e)}'
            }
    
    def validate_balance(self, required_amount: float) -> bool:
        """
        Validate if user has sufficient balance for minting.
        
        Args:
            required_amount: Required USD amount
            
        Returns:
            True if balance is sufficient, False otherwise
        """
        balance_data = self.get_balance()
        if not balance_data.get('success'):
            return False
        
        usd_balance = balance_data.get('usdBalance', 0)
        return usd_balance >= required_amount
    
    def execute_mint(self, confirm: bool = True) -> Dict[str, Any]:
        """
        Execute manual minting operation.
        
        Args:
            confirm: Confirmation flag (must be True to proceed)
            
        Returns:
            Dict containing minting result
        """
        if not confirm:
            return {
                'success': False,
                'error': 'Minting requires explicit confirmation'
            }
        
        try:
            # First, estimate cost
            estimate = self.estimate_minting_cost()
            if not estimate.get('success'):
                return estimate
            
            total_cost = estimate.get('totalCostUsd', 0)
            
            # Validate balance
            if not self.validate_balance(total_cost):
                balance_data = self.get_balance()
                current_balance = balance_data.get('usdBalance', 0)
                return {
                    'success': False,
                    'error': f'Insufficient balance. Required: ${total_cost:.2f}, Available: ${current_balance:.2f}'
                }
            
            # Execute minting
            response = requests.post(
                f'{self.api_base_url}/api/mining/inscribe',
                headers=self.headers,
                json={'confirm': True}
            )
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to execute minting: {str(e)}'
            }
    
    def get_minting_history(self, page: int = 1, limit: int = 10, status: Optional[str] = None) -> Dict[str, Any]:
        """
        Get user's minting history.
        
        Args:
            page: Page number
            limit: Items per page
            status: Filter by status (pending, confirmed, failed)
            
        Returns:
            Dict containing minting history
        """
        try:
            params = {
                'page': page,
                'limit': limit
            }
            if status:
                params['status'] = status
            
            response = requests.get(
                f'{self.api_base_url}/api/mining/inscriptions',
                headers=self.headers,
                params=params
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to get history: {str(e)}'
            }
    
    def get_mining_stats(self) -> Dict[str, Any]:
        """
        Get global mining statistics.
        
        Returns:
            Dict containing mining statistics
        """
        try:
            response = requests.get(
                f'{self.api_base_url}/api/mining/stats',
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to get stats: {str(e)}'
            }
    
    def mint_with_feedback(self) -> str:
        """
        Execute minting with user-friendly feedback.
        This is the main method that AI agents should call.
        
        Returns:
            Human-readable feedback message
        """
        # Step 1: Get current balance
        balance_data = self.get_balance()
        if not balance_data.get('success'):
            return f"❌ Failed to check balance: {balance_data.get('error', 'Unknown error')}"
        
        pathusd_balance = balance_data.get('pathusdBalance', 0)
        usd_balance = balance_data.get('usdBalance', pathusd_balance)  # Fallback to pathusdBalance
        reagent_balance = balance_data.get('reagentBalance', 0)
        
        # Step 2: Estimate cost
        estimate = self.estimate_minting_cost()
        if not estimate.get('success'):
            return f"❌ Failed to estimate cost: {estimate.get('error', 'Unknown error')}"
        
        total_cost = estimate.get('totalCostUsd', 0)
        tokens_to_earn = estimate.get('tokensToEarn', 10000)
        
        # Step 3: Validate balance (use pathusdBalance)
        if pathusd_balance < total_cost:
            return (
                f"❌ Insufficient PATHUSD balance for minting.\n\n"
                f"💰 Current PATHUSD Balance: {pathusd_balance:.4f} PATHUSD\n"
                f"💵 Required: {total_cost:.4f} PATHUSD\n"
                f"📉 Shortfall: {(total_cost - pathusd_balance):.4f} PATHUSD\n\n"
                f"Please deposit more PATHUSD to your wallet to continue.\n"
                f"Note: PATHUSD is the native stablecoin on Tempo Network."
            )
        
        # Step 4: Execute minting
        result = self.execute_mint(confirm=True)
        
        if result.get('success'):
            tx_hash = result.get('txHash', 'N/A')
            tokens_earned = result.get('tokensEarned', tokens_to_earn)
            fee_paid = result.get('feeUsd', 0)
            gas_used = result.get('gasUsed', 0)
            
            return (
                f"✅ Minting successful!\n\n"
                f"🪙 Tokens Earned: {tokens_earned:,} REAGENT\n"
                f"💵 Fee Paid: {fee_paid:.4f} PATHUSD\n"
                f"⛽ Gas Used: {gas_used:.6f} ETH\n"
                f"🔗 Transaction: {tx_hash[:10]}...{tx_hash[-8:]}\n\n"
                f"💰 New PATHUSD Balance: {(pathusd_balance - total_cost):.4f} PATHUSD\n"
                f"🪙 Total REAGENT: {(reagent_balance + tokens_earned):,}\n\n"
                f"View on Explorer: https://explore.tempo.xyz/tx/{tx_hash}"
            )
        else:
            error_msg = result.get('error', {})
            if isinstance(error_msg, dict):
                error_msg = error_msg.get('message', 'Unknown error')
            
            return (
                f"❌ Minting failed: {error_msg}\n\n"
                f"Please try again or contact support if the issue persists."
            )


# Skill metadata for Hermes framework
SKILL_METADATA = {
    'name': 'Minting_Skill',
    'version': '1.0.0',
    'description': 'Mint REAGENT tokens on Tempo Network',
    'author': 'ReAgent Platform',
    'category': 'blockchain',
    'proprietary': True,  # Cannot be uninstalled
    'auto_install': True,  # Auto-installed on user registration
    'capabilities': [
        'check_balance',
        'estimate_cost',
        'execute_mint',
        'get_history',
        'get_stats'
    ],
    'required_permissions': [
        'wallet:read',
        'wallet:write',
        'mining:execute'
    ]
}


# Tool definitions for Hermes agents
TOOLS = [
    {
        'name': 'mint_reagent_tokens',
        'description': 'Mint REAGENT tokens for the user. Automatically checks balance and executes minting.',
        'parameters': {},
        'returns': 'Human-readable feedback about the minting operation',
        'function': lambda skill: skill.mint_with_feedback()
    },
    {
        'name': 'check_mining_balance',
        'description': 'Check user\'s USD and REAGENT token balance',
        'parameters': {},
        'returns': 'Balance information',
        'function': lambda skill: skill.get_balance()
    },
    {
        'name': 'estimate_minting_cost',
        'description': 'Estimate the cost of minting REAGENT tokens',
        'parameters': {},
        'returns': 'Cost estimation',
        'function': lambda skill: skill.estimate_minting_cost()
    },
    {
        'name': 'get_minting_history',
        'description': 'Get user\'s minting history',
        'parameters': {
            'page': 'Page number (default: 1)',
            'limit': 'Items per page (default: 10)',
            'status': 'Filter by status: pending, confirmed, failed (optional)'
        },
        'returns': 'Minting history',
        'function': lambda skill, **kwargs: skill.get_minting_history(**kwargs)
    },
    {
        'name': 'get_mining_stats',
        'description': 'Get global mining statistics',
        'parameters': {},
        'returns': 'Mining statistics',
        'function': lambda skill: skill.get_mining_stats()
    }
]


# Example usage for testing
if __name__ == '__main__':
    # Initialize skill
    skill = MintingSkill(
        api_base_url='http://localhost:3000',
        auth_token='your_auth_token_here'
    )
    
    # Test balance check
    print("Checking balance...")
    balance = skill.get_balance()
    print(json.dumps(balance, indent=2))
    
    # Test cost estimation
    print("\nEstimating cost...")
    estimate = skill.estimate_minting_cost()
    print(json.dumps(estimate, indent=2))
    
    # Test minting with feedback
    print("\nExecuting mint with feedback...")
    feedback = skill.mint_with_feedback()
    print(feedback)
