# Quick Domain Setup: reagent.eu.cc

## 🚀 One-Command Setup

```bash
cd /root/blinkai && chmod +x scripts/setup-domain-ssl.sh && sudo ./scripts/setup-domain-ssl.sh
```

## ⚠️ Before Running: Configure DNS

### DNS Settings

| Type | Name | Value |
|------|------|-------|
| A | @ | 159.65.141.68 |

### Verify DNS

```bash
dig reagent.eu.cc
# Should show: 159.65.141.68
```

## ✅ What Gets Installed

- Nginx (reverse proxy)
- Certbot (SSL certificates)
- Let's Encrypt SSL certificate
- Auto-renewal cron job
- Security headers
- HTTP to HTTPS redirect

## 🔒 After Setup

Your site will be accessible at:
- **https://reagent.eu.cc** ✅
- http://reagent.eu.cc → redirects to HTTPS

## 📋 Quick Commands

```bash
# Check SSL certificate
sudo certbot certificates

# Check Nginx status
sudo systemctl status nginx

# Check app status
pm2 status

# View logs
tail -f /var/log/nginx/reagent_error.log
pm2 logs reagent

# Restart everything
sudo systemctl restart nginx
pm2 restart reagent
```

## 🔧 Troubleshooting

### DNS not resolving?
```bash
# Wait 5-10 minutes, then check
dig reagent.eu.cc
nslookup reagent.eu.cc
```

### SSL failed?
```bash
# Retry manually
sudo certbot certonly --standalone -d reagent.eu.cc
```

### 502 Bad Gateway?
```bash
# Restart app
pm2 restart reagent
```

## 📝 Files Modified

- `/etc/nginx/sites-available/reagent.eu.cc`
- `/root/blinkai/.env` (NEXTAUTH_URL, NEXT_PUBLIC_APP_URL)

## 🎯 Success Indicators

- ✅ https://reagent.eu.cc loads
- ✅ 🔒 Padlock icon in browser
- ✅ HTTP redirects to HTTPS
- ✅ Certificate from Let's Encrypt
- ✅ Auto-renewal enabled

---

**Total setup time: ~5 minutes** (after DNS propagation)
