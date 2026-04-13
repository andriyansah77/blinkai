# ReAgent API - cURL Examples

Complete guide for using ReAgent API with cURL commands.

## Prerequisites

1. Get your User ID from ReAgent dashboard
2. Set environment variables:

```bash
export REAGENT_API="https://reagent.eu.cc"
export REAGENT_USER_ID="your_user_id_here"
```

## API Endpoint

All minting operations use the same endpoint:

```
POST https://reagent.eu.cc/api/hermes/skills/minting
```

## Authentication

Include your User ID in the request header:

```bash
-H "X-User-ID: YOUR_USER_ID"
```

## Commands

### 1. Check Balance

Check your USD, ETH, and REAGENT balance:

```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"check_balance"}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "usdBalance": "10.50",
    "ethBalance": "0.005",
    "reagentBalance": "50000",
    "walletAddress": "0x..."
  }
}
```

### 2. Estimate Minting Cost

Estimate the cost to mint 10,000 REAGENT tokens:

```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"estimate_cost"}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "estimatedGas": "150000",
    "estimatedCostETH": "0.0015",
    "estimatedCostUSD": "0.05"
  }
}
```

### 3. Mint Tokens

Mint 10,000 REAGENT tokens:

```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"mint_tokens"}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "amount": 10000,
    "costETH": "0.0015",
    "costUSD": "0.05",
    "status": "pending"
  }
}
```

### 4. Get Minting History

Get your minting transaction history:

**Basic:**

```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"get_history"}'
```

**With Pagination:**

```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"get_history","page":1,"limit":20}'
```

**Filter by Status:**

```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"get_history","status":"confirmed"}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "mints": [
      {
        "id": "mint_123",
        "amount": 10000,
        "txHash": "0xabc...",
        "status": "confirmed",
        "costETH": "0.0015",
        "costUSD": "0.05",
        "createdAt": "2026-04-14T10:30:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

### 5. Get Global Statistics

Get global mining statistics:

```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"get_stats"}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalMinted": "1000000",
    "totalUsers": 73,
    "totalTransactions": 150,
    "avgCostUSD": "0.05"
  }
}
```

## Automation Scripts

### Auto-Mint Script

Create a script to automatically mint tokens:

```bash
#!/bin/bash
# auto-mint.sh

REAGENT_API="https://reagent.eu.cc"
REAGENT_USER_ID="your_user_id"

# Check balance first
echo "Checking balance..."
BALANCE=$(curl -s -X POST "$REAGENT_API/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"action":"check_balance"}')

echo "$BALANCE" | jq '.'

# Estimate cost
echo -e "\nEstimating cost..."
ESTIMATE=$(curl -s -X POST "$REAGENT_API/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"action":"estimate_cost"}')

echo "$ESTIMATE" | jq '.'

# Mint tokens
echo -e "\nMinting tokens..."
MINT=$(curl -s -X POST "$REAGENT_API/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"action":"mint_tokens"}')

echo "$MINT" | jq '.'

# Get TX hash
TX_HASH=$(echo "$MINT" | jq -r '.data.txHash')
echo -e "\nTransaction: https://explore.tempo.xyz/tx/$TX_HASH"
```

Make it executable:

```bash
chmod +x auto-mint.sh
./auto-mint.sh
```

### Scheduled Minting with Cron

Mint tokens every day at 10 AM:

```bash
# Edit crontab
crontab -e

# Add this line
0 10 * * * /path/to/auto-mint.sh >> /var/log/reagent-mint.log 2>&1
```

### Monitor Balance Script

```bash
#!/bin/bash
# monitor-balance.sh

REAGENT_API="https://reagent.eu.cc"
REAGENT_USER_ID="your_user_id"

while true; do
  clear
  echo "=== ReAgent Balance Monitor ==="
  echo "Time: $(date)"
  echo ""
  
  curl -s -X POST "$REAGENT_API/api/hermes/skills/minting" \
    -H "Content-Type: application/json" \
    -H "X-User-ID: $REAGENT_USER_ID" \
    -d '{"action":"check_balance"}' | jq '.'
  
  echo ""
  echo "Refreshing in 30 seconds... (Ctrl+C to exit)"
  sleep 30
done
```

### Batch Minting Script

Mint multiple times with delay:

```bash
#!/bin/bash
# batch-mint.sh

REAGENT_API="https://reagent.eu.cc"
REAGENT_USER_ID="your_user_id"
MINT_COUNT=5
DELAY=60  # seconds between mints

for i in $(seq 1 $MINT_COUNT); do
  echo "=== Mint $i of $MINT_COUNT ==="
  
  curl -s -X POST "$REAGENT_API/api/hermes/skills/minting" \
    -H "Content-Type: application/json" \
    -H "X-User-ID: $REAGENT_USER_ID" \
    -d '{"action":"mint_tokens"}' | jq '.'
  
  if [ $i -lt $MINT_COUNT ]; then
    echo "Waiting $DELAY seconds..."
    sleep $DELAY
  fi
done

echo "=== Batch minting complete ==="
```

## Error Handling

### Check Response Status

```bash
RESPONSE=$(curl -s -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"check_balance"}')

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
  echo "Success!"
  echo "$RESPONSE" | jq '.data'
else
  echo "Error:"
  echo "$RESPONSE" | jq -r '.error'
fi
```

### Retry on Failure

```bash
#!/bin/bash
MAX_RETRIES=3
RETRY_DELAY=5

for i in $(seq 1 $MAX_RETRIES); do
  echo "Attempt $i of $MAX_RETRIES..."
  
  RESPONSE=$(curl -s -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
    -H "Content-Type: application/json" \
    -H "X-User-ID: YOUR_USER_ID" \
    -d '{"action":"mint_tokens"}')
  
  SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
  
  if [ "$SUCCESS" = "true" ]; then
    echo "Success!"
    echo "$RESPONSE" | jq '.'
    exit 0
  else
    echo "Failed: $(echo "$RESPONSE" | jq -r '.error')"
    if [ $i -lt $MAX_RETRIES ]; then
      echo "Retrying in $RETRY_DELAY seconds..."
      sleep $RETRY_DELAY
    fi
  fi
done

echo "All retries failed"
exit 1
```

## Integration Examples

### Node.js

```javascript
const axios = require('axios');

const REAGENT_API = 'https://reagent.eu.cc';
const REAGENT_USER_ID = 'your_user_id';

async function mintTokens() {
  try {
    const response = await axios.post(
      `${REAGENT_API}/api/hermes/skills/minting`,
      { action: 'mint_tokens' },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': REAGENT_USER_ID
        }
      }
    );
    
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

mintTokens();
```

### Python

```python
import requests

REAGENT_API = 'https://reagent.eu.cc'
REAGENT_USER_ID = 'your_user_id'

def mint_tokens():
    response = requests.post(
        f'{REAGENT_API}/api/hermes/skills/minting',
        json={'action': 'mint_tokens'},
        headers={
            'Content-Type': 'application/json',
            'X-User-ID': REAGENT_USER_ID
        }
    )
    
    if response.json()['success']:
        print('Success:', response.json())
    else:
        print('Error:', response.json()['error'])

mint_tokens()
```

### PHP

```php
<?php
$REAGENT_API = 'https://reagent.eu.cc';
$REAGENT_USER_ID = 'your_user_id';

$ch = curl_init("$REAGENT_API/api/hermes/skills/minting");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['action' => 'mint_tokens']));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    "X-User-ID: $REAGENT_USER_ID"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
if ($data['success']) {
    echo "Success: " . json_encode($data['data']);
} else {
    echo "Error: " . $data['error'];
}
?>
```

## Tips

1. **Always check balance before minting** to ensure you have enough ETH for gas
2. **Use estimate_cost** to know the exact cost before minting
3. **Store your User ID securely** - don't commit it to version control
4. **Use jq** for pretty JSON output: `curl ... | jq '.'`
5. **Add error handling** in production scripts
6. **Monitor transaction status** using the history command
7. **Set up alerts** for failed transactions

## Support

- Website: https://reagent.eu.cc
- GitHub: https://github.com/andriyansah77/blinkai
- Explorer: https://explore.tempo.xyz
