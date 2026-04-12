# Quick Deployment: AI Agent Minting Fix

## One-Command Deployment

Run this on your VPS to deploy the fix:

```bash
cd /root/blinkai && \
chmod +x scripts/update-user-profiles-guidance.sh && \
./scripts/update-user-profiles-guidance.sh
```

## What This Does

1. Updates all user profiles with new TOOLS.md
2. Updates all user profiles with new SOUL.md
3. Shows summary of updated profiles

## Expected Output

```
🔄 Updating user profiles with guidance-based approach...

📝 Updating profile: user-[ID1]
  ✅ TOOLS.md updated
  ✅ SOUL.md updated
  ✅ Profile updated successfully

📝 Updating profile: user-[ID2]
  ✅ TOOLS.md updated
  ✅ SOUL.md updated
  ✅ Profile updated successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Update Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Profiles updated: 9
❌ Failed: 0

🎉 User profiles updated successfully!

Changes applied:
  • AI agents now guide users through web interface
  • Removed direct minting execution
  • Updated response templates for guidance
  • Simplified conversation initialization

Users will now receive step-by-step guidance instead of direct execution.
```

## Verify Deployment

Test with any user account:

1. Log in to http://159.65.141.68:3000
2. Go to Dashboard → Chat
3. Ask: "Can you mint tokens for me?"
4. Expected: AI provides step-by-step guidance (not error)

## Quick Test Commands

```bash
# Check if files were updated
ls -lh /root/.hermes/profiles/user-*/TOOLS.md
ls -lh /root/.hermes/profiles/user-*/SOUL.md

# View a sample profile
head -50 /root/.hermes/profiles/user-*/TOOLS.md | head -50

# Count updated profiles
ls -d /root/.hermes/profiles/user-* | wc -l
```

## Rollback (If Needed)

```bash
cd /root/blinkai
git checkout HEAD~1 hermes-profiles/TOOLS.md
git checkout HEAD~1 hermes-profiles/SOUL.md
./scripts/update-user-profiles.sh
```

## Status

- ✅ Files ready for deployment
- ✅ Script tested and working
- ✅ Documentation complete
- ⏳ Awaiting deployment on VPS

## Next Steps

1. Upload files to VPS (if not already there)
2. Run the one-command deployment
3. Test with a user account
4. Verify AI provides guidance instead of errors
5. Monitor user feedback

---

**Ready to deploy!** 🚀
