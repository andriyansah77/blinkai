# ✅ Database Reset Complete

## Status: CLEAN DATABASE READY FOR TESTING

**Date**: April 16, 2026  
**Database**: PostgreSQL  
**Status**: ✅ Fresh & Clean

## What Was Done

### 1. ✅ Database Dropped & Recreated
```sql
DROP DATABASE IF EXISTS reagent;
CREATE DATABASE reagent;
GRANT ALL PRIVILEGES ON DATABASE reagent TO reagent;
```

### 2. ✅ Permissions Fixed
```sql
GRANT ALL ON SCHEMA public TO reagent;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO reagent;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO reagent;
```

### 3. ✅ Schema Pushed
```bash
npx prisma db push --accept-data-loss
```

All tables created fresh:
- User
- Account
- Session
- VerificationToken
- Wallet
- Agent
- Skill
- Job
- Message
- Channel
- Project
- Inscription
- MiningStats
- ApiKey

### 4. ✅ Application Rebuilt
```bash
rm -rf .next
npm run build
pm2 restart reagent
```

## Current State

✅ Database: Empty & Clean  
✅ No users registered  
✅ No wallets created  
✅ No inscriptions  
✅ No mining history  
✅ Fresh start for testing  

## Ready for Testing

### Test Checklist

#### 1. User Registration & Authentication
- [ ] Sign up dengan email
- [ ] Sign up dengan Google
- [ ] Sign up dengan Twitter
- [ ] Sign up dengan Discord
- [ ] Sign up dengan Wallet
- [ ] Verify embedded wallet auto-created

#### 2. Wallet Functionality
- [ ] Check wallet address generated
- [ ] View wallet balance (should be 0)
- [ ] Export private key
- [ ] Import wallet

#### 3. Onboarding Flow
- [ ] Complete onboarding steps
- [ ] Set username
- [ ] Choose agent type
- [ ] Configure preferences

#### 4. Dashboard Access
- [ ] Access main dashboard
- [ ] View agent status
- [ ] Check credits balance
- [ ] Navigate all sections

#### 5. Mining Functionality
- [ ] Access mining page
- [ ] View mining stats (should be 0)
- [ ] Check balance requirements
- [ ] Estimate minting cost
- [ ] (Optional) Test minting if wallet funded

#### 6. Agent Features
- [ ] Create new agent
- [ ] Configure agent settings
- [ ] Test agent skills
- [ ] View agent history

## Test URLs

- **Main**: https://reagent.eu.cc
- **Sign Up**: https://reagent.eu.cc/sign-up
- **Sign In**: https://reagent.eu.cc/sign-in
- **Dashboard**: https://reagent.eu.cc/dashboard
- **Mining**: https://reagent.eu.cc/mining
- **Onboarding**: https://reagent.eu.cc/onboarding

## Database Connection Info

```bash
# Connect to database
ssh root@188.166.247.252
sudo -u postgres psql -d reagent

# Check tables
\dt

# Check users (should be empty)
SELECT * FROM "User";

# Check wallets (should be empty)
SELECT * FROM "Wallet";

# Check inscriptions (should be empty)
SELECT * FROM "Inscription";
```

## Quick Commands

### View Database
```bash
ssh root@188.166.247.252 "sudo -u postgres psql -d reagent -c 'SELECT COUNT(*) FROM \"User\";'"
```

### Reset Database Again (if needed)
```bash
ssh root@188.166.247.252 << 'EOF'
sudo -u postgres psql -c 'DROP DATABASE IF EXISTS reagent;'
sudo -u postgres psql -c 'CREATE DATABASE reagent;'
sudo -u postgres psql -c 'GRANT ALL PRIVILEGES ON DATABASE reagent TO reagent;'
sudo -u postgres psql -d reagent -c 'GRANT ALL ON SCHEMA public TO reagent;'
cd /root/reagent
npx prisma db push --accept-data-loss
rm -rf .next
npm run build
pm2 restart reagent
EOF
```

### Check Application Logs
```bash
ssh root@188.166.247.252 "pm2 logs reagent --lines 50"
```

### Monitor Database Activity
```bash
ssh root@188.166.247.252 "sudo -u postgres psql -d reagent -c 'SELECT * FROM pg_stat_activity;'"
```

## Testing Tips

### 1. Test with Fresh Browser
- Use incognito/private mode
- Or clear all cookies/cache
- Hard refresh: Ctrl+Shift+R

### 2. Test Multiple Auth Methods
- Try each login method separately
- Verify embedded wallet created for each
- Check wallet addresses are unique

### 3. Monitor Logs During Testing
```bash
# In separate terminal
ssh root@188.166.247.252 "pm2 logs reagent --lines 0"
```

### 4. Check Database After Each Action
```bash
# Count users
ssh root@188.166.247.252 "sudo -u postgres psql -d reagent -c 'SELECT COUNT(*) FROM \"User\";'"

# View latest user
ssh root@188.166.247.252 "sudo -u postgres psql -d reagent -c 'SELECT id, email, name, \"createdAt\" FROM \"User\" ORDER BY \"createdAt\" DESC LIMIT 1;'"
```

## Expected Behavior

### First User Registration
1. User signs up via Privy
2. Privy creates embedded wallet automatically
3. User record created in database
4. Wallet record created with encrypted private key
5. Redirect to onboarding
6. Complete onboarding steps
7. Redirect to dashboard

### Wallet Creation
- Wallet address: 0x... (42 characters)
- Private key: Encrypted with AES-256
- Initial balance: 0 ETH, 0 REAGENT, 0 PATHUSD
- Network: Tempo (Chain ID: 4217)

### Mining Page
- Shows 0 balance initially
- Displays deposit instructions
- Shows global mining stats (should be 0)
- Minting disabled until wallet funded

## Troubleshooting

### User Can't Sign Up
1. Check Privy dashboard domains are HTTPS
2. Clear browser cache
3. Check PM2 logs for errors
4. Verify database connection

### Wallet Not Created
1. Check Privy embedded wallet settings
2. Verify wallet creation code in onboarding
3. Check database for wallet record
4. Review application logs

### Database Connection Error
```bash
# Check PostgreSQL status
ssh root@188.166.247.252 "systemctl status postgresql"

# Test connection
ssh root@188.166.247.252 "sudo -u postgres psql -d reagent -c 'SELECT 1;'"
```

### Application Not Responding
```bash
# Check PM2 status
ssh root@188.166.247.252 "pm2 status"

# Restart if needed
ssh root@188.166.247.252 "pm2 restart reagent"
```

## Post-Testing

After testing, you can:

1. **Keep test data**: Leave as is for demo
2. **Reset again**: Run reset commands above
3. **Backup test data**: 
   ```bash
   ssh root@188.166.247.252 "sudo -u postgres pg_dump reagent > /root/reagent-test-backup.sql"
   ```

## Notes

- Database is PostgreSQL (not SQLite anymore)
- All old migration history removed
- Fresh schema pushed
- Application rebuilt with clean cache
- Ready for production testing

---

**Status**: ✅ READY FOR TESTING  
**Database**: ✅ CLEAN  
**Application**: ✅ RUNNING  
**SSL**: ✅ ACTIVE
