import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";

export async function POST(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { command } = await request.json();
    if (!command) {
      return NextResponse.json({ error: "Command is required" }, { status: 400 });
    }

    const userId = session.user.email;
    const commandParts = command.trim().split(' ');
    const mainCommand = commandParts[0];
    const subCommand = commandParts[1];
    const args = commandParts.slice(2);

    let result: { success: boolean; output: string; error: string };

    try {
      switch (mainCommand.toLowerCase()) {
        case '/help':
        case 'help':
          result = {
            success: true,
            output: `Available Commands:
==================

/help - Show this help message
/mine [amount] - Auto mine REAGENT tokens (1-10)
/balance - Check wallet balance
/wallet - Show wallet information

Examples:
---------
/mine 5 - Mine 5 REAGENT tokens
/balance - Check your balance
/wallet - Show wallet address and info`,
            error: ''
          };
          break;

        case '/mine':
        case 'mine':
          const amount = parseInt(subCommand || '1');
          
          if (isNaN(amount) || amount < 1 || amount > 10) {
            result = {
              success: false,
              output: '',
              error: 'Invalid amount. Please specify a number between 1 and 10.\nUsage: /mine [amount]\nExample: /mine 5'
            };
            break;
          }

          try {
            let miningOutput = `⛏️ Starting auto mining for ${amount} REAGENT token${amount > 1 ? 's' : ''}...\n\n`;
            
            // Execute mining via simple-mint API
            for (let i = 0; i < amount; i++) {
              const mineResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/mining/simple-mint`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Cookie': request.headers.get('cookie') || ''
                },
                body: JSON.stringify({
                  type: 'auto'
                }),
              });

              if (!mineResponse.ok) {
                const error = await mineResponse.json();
                throw new Error(error.error || 'Mining failed');
              }

              const mineResult = await mineResponse.json();

              if (!mineResult.success) {
                throw new Error(mineResult.error || 'Failed to mint');
              }

              const txHash = mineResult.txHash || 'N/A';
              miningOutput += `✅ Mint ${i + 1}/${amount}: Transaction submitted\n`;
              miningOutput += `   TX Hash: ${txHash.slice(0, 10)}...${txHash.slice(-8)}\n`;
              miningOutput += `   Tokens: ${mineResult.tokensEarned || '10000'} REAGENT\n\n`;

              // Wait 2 seconds between mints
              if (i < amount - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }

            miningOutput += `\n🎉 Mining complete! Minted ${amount * 10000} REAGENT tokens.\n\n`;
            miningOutput += `Transactions are being confirmed on the blockchain. Check your balance in a few minutes.`;

            result = {
              success: true,
              output: miningOutput,
              error: ''
            };
          } catch (error: any) {
            result = {
              success: false,
              output: '',
              error: `Mining failed: ${error.message}\n\nUsage: /mine [amount]\nExample: /mine 5 (mints 5 times, earning 50,000 REAGENT)`
            };
          }
          break;

        case '/balance':
        case 'balance':
          try {
            const balanceResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/wallet/balance`, {
              method: 'GET',
              headers: {
                'Cookie': request.headers.get('cookie') || '',
                'Authorization': request.headers.get('authorization') || '',
                'X-User-ID': userId
              }
            });

            if (!balanceResponse.ok) {
              throw new Error('Failed to fetch balance');
            }

            const balanceData = await balanceResponse.json();

            if (!balanceData.success) {
              throw new Error(balanceData.error || 'Failed to get balance');
            }

            result = {
              success: true,
              output: `💰 Wallet Balance
==================

Address: ${balanceData.address}
REAGENT: ${balanceData.reagentBalance} tokens
PATHUSD: ${balanceData.pathusdBalance} tokens

Last Updated: ${new Date(balanceData.lastBalanceUpdate).toLocaleString()}`,
              error: ''
            };
          } catch (error: any) {
            result = {
              success: false,
              output: '',
              error: `Failed to get balance: ${error.message}`
            };
          }
          break;

        case '/wallet':
        case 'wallet':
          try {
            const walletResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/wallet/info`, {
              method: 'GET',
              headers: {
                'Cookie': request.headers.get('cookie') || '',
                'Authorization': request.headers.get('authorization') || '',
                'X-User-ID': userId
              }
            });

            if (!walletResponse.ok) {
              throw new Error('Failed to fetch wallet info');
            }

            const walletData = await walletResponse.json();

            if (!walletData.success) {
              throw new Error(walletData.error || 'Failed to get wallet info');
            }

            result = {
              success: true,
              output: `🔐 Wallet Information
==================

Address: ${walletData.address}
Network: ${walletData.network}

Balances:
- REAGENT: ${walletData.reagentBalance} tokens
- PATHUSD: ${walletData.pathusdBalance} tokens

Created: ${new Date(walletData.createdAt).toLocaleString()}
Last Updated: ${new Date(walletData.lastBalanceUpdate).toLocaleString()}`,
              error: ''
            };
          } catch (error: any) {
            result = {
              success: false,
              output: '',
              error: `Failed to get wallet info: ${error.message}`
            };
          }
          break;
    
        default:
          result = {
            success: false,
            output: '',
            error: `Unknown command: ${mainCommand}. Type '/help' for available commands.`
          };
      }
    } catch (error) {
      result = {
        success: false,
        output: '',
        error: `Command execution failed: ${error}`
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Hermes command error:", error);
    return NextResponse.json(
      { error: "Failed to execute command" },
      { status: 500 }
    );
  }
}