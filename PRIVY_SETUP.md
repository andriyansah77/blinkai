# Privy Authentication Setup

ReAgent sekarang menggunakan Privy untuk authentication yang lebih powerful dengan fitur:
- ✅ Social login (Google, Twitter, Discord, Email)
- ✅ Wallet connection (MetaMask, WalletConnect, Coinbase, dll)
- ✅ Embedded wallets (auto-created untuk users tanpa wallet)
- ✅ Multi-chain support (Tempo Network, Ethereum, dll)

## Setup Steps

### 1. Create Privy App

1. Buka [https://dashboard.privy.io](https://dashboard.privy.io)
2. Sign up / Login
3. Click "Create App"
4. Pilih nama app (contoh: "ReAgent")
5. Copy **App ID** dan **App Secret**

### 2. Configure Environment Variables

Tambahkan ke `.env`:

```bash
# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID="clxxx-your-app-id-here"
PRIVY_APP_SECRET="your-app-secret-here"
```

### 3. Configure Login Methods

Di Privy Dashboard:

1. Go to **Settings** → **Login Methods**
2. Enable yang Anda inginkan:
   - ✅ Email (recommended)
   - ✅ Google
   - ✅ Twitter
   - ✅ Discord
   - ✅ Wallet (MetaMask, WalletConnect, dll)

### 4. Configure Embedded Wallets

Di Privy Dashboard:

1. Go to **Settings** → **Embedded Wallets**
2. Enable **"Create wallet on login"**
3. Pilih **"For users without wallets"**
4. Save changes

### 5. Add Allowed Domains

Di Privy Dashboard:

1. Go to **Settings** → **Domains**
2. Add your domains:
   - `http://localhost:3000` (development)
   - `https://reagent.eu.cc` (production)
   - `https://mining.reagent.eu.cc` (subdomain)

### 6. Configure Tempo Network

Tempo Network sudah dikonfigurasi di `src/providers/privy-provider.tsx`:

```typescript
const tempoNetwork = {
  id: 4217,
  name: 'Tempo Network',
  rpcUrls: {
    default: { http: ['https://rpc.tempo.xyz'] },
  },
  // ...
};
```

## Features

### Auto-Generated Wallets

Privy akan otomatis membuat embedded wallet untuk users yang:
- Login dengan email/social
- Tidak punya wallet extension (MetaMask, dll)

Wallet ini:
- ✅ Fully functional untuk transactions
- ✅ Private key di-manage oleh Privy (secure)
- ✅ User bisa export private key kapan saja
- ✅ Support semua chains yang dikonfigurasi

### Multi-Login Methods

Users bisa login dengan:
1. **Email** - Passwordless magic link
2. **Google** - OAuth social login
3. **Twitter** - OAuth social login  
4. **Discord** - OAuth social login
5. **Wallet** - MetaMask, WalletConnect, Coinbase, dll

### Wallet Connection

Users dengan wallet bisa:
- Connect existing wallet (MetaMask, WalletConnect, dll)
- Switch between multiple wallets
- Add new wallets anytime

## Migration from NextAuth

### What Changed

1. **Authentication Provider**
   - ❌ NextAuth → ✅ Privy
   - Better Web3 integration
   - Embedded wallet support

2. **Session Management**
   - ❌ `useSession()` → ✅ `usePrivy()`
   - More features (wallet, user data, etc)

3. **Login Flow**
   - ❌ Email/password → ✅ Multiple methods
   - Social login, wallet, email magic link

### API Routes

Update API routes untuk use Privy authentication:

```typescript
import { getPrivyUser } from '@/lib/privy-server';

export async function GET(request: Request) {
  const user = await getPrivyUser(request);
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Your logic here
}
```

## Testing

### Local Development

1. Start dev server:
```bash
npm run dev
```

2. Open http://localhost:3000
3. Click "Sign In" atau "Sign Up"
4. Test different login methods:
   - Email magic link
   - Google OAuth
   - Wallet connection

### Production

1. Update `.env` dengan production Privy credentials
2. Add production domain di Privy Dashboard
3. Deploy:
```bash
npm run build
npm run deploy:vps
```

## Troubleshooting

### "App ID not found"
- Check `NEXT_PUBLIC_PRIVY_APP_ID` di `.env`
- Pastikan App ID benar dari Privy Dashboard

### "Domain not allowed"
- Add domain di Privy Dashboard → Settings → Domains
- Include protocol (http:// atau https://)

### Embedded wallet not created
- Check Privy Dashboard → Embedded Wallets
- Enable "Create wallet on login"
- Pilih "For users without wallets"

### Wallet connection failed
- Check network configuration di `privy-provider.tsx`
- Pastikan RPC URL correct
- Check user's wallet network

## Resources

- [Privy Documentation](https://docs.privy.io)
- [Privy Dashboard](https://dashboard.privy.io)
- [Privy React SDK](https://docs.privy.io/guide/react)
- [Wagmi Documentation](https://wagmi.sh)

## Support

Jika ada masalah:
1. Check Privy Dashboard logs
2. Check browser console
3. Check server logs
4. Contact Privy support: support@privy.io
