# Domain & SSL Setup Guide

## Domain: reagent.eu.cc

### Prerequisites

1. **DNS Configuration** (MUST be done first!)
2. **Root access** to VPS
3. **Port 80 and 443** open

---

## Step 1: Configure DNS

Before running the setup script, configure your DNS:

### DNS Records Required

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 159.65.141.68 | 300 |
| A | www | 159.65.141.68 | 300 |

### How to Configure (eu.cc)

1. Go to your DNS provider (eu.cc control panel)
2. Add A record:
   - **Type**: A
   - **Name**: @ (or leave blank for root domain)
   - **Value**: 159.65.141.68
   - **TTL**: 300 (or Auto)

3. Add www subdomain (optional):
   - **Type**: A
   - **Name**: www
   - **Value**: 159.65.141.68
   - **TTL**: 300

4. Save changes

### Verify DNS Propagation

Wait 5-10 minutes, then check:

```bash
# Check DNS resolution
dig reagent.eu.cc

# Should show:
# reagent.eu.cc.  300  IN  A  159.65.141.68

# Alternative check
nslookup reagent.eu.cc

# Or use online tool
# https://dnschecker.org/#A/reagent.eu.cc
```

---

## Step 2: Run Setup Script

Once DNS is configured and propagated:

```bash
cd /root/blinkai
chmod +x scripts/setup-domain-ssl.sh
sudo ./scripts/setup-domain-ssl.sh
```

### What the Script Does

1. ✅ Installs Nginx
2. ✅ Installs Certbot
3. ✅ Creates Nginx configuration
4. ✅ Waits for DNS confirmation
5. ✅ Obtains SSL certificate from Let's Encrypt
6. ✅ Configures HTTPS with security headers
7. ✅ Sets up HTTP to HTTPS redirect
8. ✅ Enables SSL auto-renewal
9. ✅ Updates .env file
10. ✅ Rebuilds and restarts application

### Expected Output

```
🌐 Setting up domain and SSL for ReAgent Platform
Domain: reagent.eu.cc

Step 1: Installing Nginx...
✅ Nginx installed

Step 2: Installing Certbot...
✅ Certbot installed

Step 3: Creating Nginx configuration...
✅ Nginx configuration created

Step 4: Enabling site...
✅ Nginx configuration is valid
✅ Nginx reloaded

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  IMPORTANT: DNS Configuration Required
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Domain: reagent.eu.cc
Type: A Record
Value: 159.65.141.68

Press Enter once DNS is configured and propagated...

Step 5: Obtaining SSL certificate...
✅ SSL certificate obtained

Step 6: Updating Nginx configuration with SSL...
✅ Nginx configuration updated with SSL
✅ Nginx started and enabled

Step 7: Setting up SSL auto-renewal...
✅ SSL auto-renewal configured

Step 8: Updating .env file...
✅ .env file updated

Step 9: Restarting application...
✅ Application rebuilt
✅ Application restarted

Step 10: Configuring firewall...
✅ Firewall configured

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Domain and SSL Setup Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your ReAgent Platform is now accessible at:
https://reagent.eu.cc
```

---

## Step 3: Verify Setup

### Test HTTPS Access

```bash
# Test from command line
curl -I https://reagent.eu.cc

# Should return: HTTP/2 200
```

### Test in Browser

1. Open: https://reagent.eu.cc
2. Check for 🔒 padlock icon
3. Click padlock → Certificate should show "Let's Encrypt"

### Test HTTP Redirect

1. Open: http://reagent.eu.cc
2. Should automatically redirect to https://reagent.eu.cc

---

## Troubleshooting

### Issue: DNS not resolving

```bash
# Check DNS
dig reagent.eu.cc

# If no result, wait longer (up to 24 hours for full propagation)
# Or check DNS configuration at your provider
```

### Issue: SSL certificate failed

```bash
# Check if port 80 is accessible
curl -I http://reagent.eu.cc

# Check Nginx logs
tail -f /var/log/nginx/reagent_error.log

# Retry certificate manually
sudo certbot certonly --standalone -d reagent.eu.cc
```

### Issue: 502 Bad Gateway

```bash
# Check if app is running
pm2 status

# Restart app
pm2 restart reagent

# Check app logs
pm2 logs reagent
```

### Issue: Mixed content warnings

Update any hardcoded HTTP URLs in your code to use HTTPS or relative URLs.

---

## SSL Certificate Management

### Check Certificate Status

```bash
sudo certbot certificates
```

### Manual Renewal

```bash
sudo certbot renew
```

### Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

### Certificate Location

- Certificate: `/etc/letsencrypt/live/reagent.eu.cc/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/reagent.eu.cc/privkey.pem`
- Chain: `/etc/letsencrypt/live/reagent.eu.cc/chain.pem`

---

## Nginx Management

### Check Status

```bash
sudo systemctl status nginx
```

### Restart Nginx

```bash
sudo systemctl restart nginx
```

### Test Configuration

```bash
sudo nginx -t
```

### View Logs

```bash
# Access log
tail -f /var/log/nginx/reagent_access.log

# Error log
tail -f /var/log/nginx/reagent_error.log
```

### Configuration Files

- Main config: `/etc/nginx/sites-available/reagent.eu.cc`
- Enabled: `/etc/nginx/sites-enabled/reagent.eu.cc`

---

## Security Features

### Enabled Security Headers

- ✅ **HSTS**: Forces HTTPS for 1 year
- ✅ **X-Frame-Options**: Prevents clickjacking
- ✅ **X-Content-Type-Options**: Prevents MIME sniffing
- ✅ **X-XSS-Protection**: XSS filter
- ✅ **Referrer-Policy**: Controls referrer information

### SSL Configuration

- ✅ **TLS 1.2 and 1.3** only
- ✅ **Strong cipher suites**
- ✅ **SSL session caching**
- ✅ **OCSP stapling**

### Test Security

Check your SSL configuration:
- https://www.ssllabs.com/ssltest/analyze.html?d=reagent.eu.cc

---

## Environment Variables

After setup, your `.env` file will be updated:

```bash
NEXTAUTH_URL=https://reagent.eu.cc
NEXT_PUBLIC_APP_URL=https://reagent.eu.cc
```

If you need to update manually:

```bash
nano /root/blinkai/.env

# Update these lines:
NEXTAUTH_URL=https://reagent.eu.cc
NEXT_PUBLIC_APP_URL=https://reagent.eu.cc

# Save and rebuild
cd /root/blinkai
npm run build
pm2 restart reagent
```

---

## Firewall Configuration

### UFW (Ubuntu Firewall)

```bash
# Allow Nginx Full (HTTP + HTTPS)
sudo ufw allow 'Nginx Full'

# Remove HTTP only rule
sudo ufw delete allow 'Nginx HTTP'

# Check status
sudo ufw status
```

### Required Ports

- **80** (HTTP) - For Let's Encrypt validation and redirect
- **443** (HTTPS) - For secure traffic
- **22** (SSH) - For server access

---

## Maintenance

### Auto-Renewal

Certbot automatically renews certificates. Check renewal timer:

```bash
sudo systemctl status certbot.timer
```

### Manual Checks

Run these monthly:

```bash
# Check certificate expiry
sudo certbot certificates

# Test renewal process
sudo certbot renew --dry-run

# Check Nginx configuration
sudo nginx -t

# Check application status
pm2 status
```

---

## Rollback

If you need to revert to IP-based access:

```bash
# Disable SSL site
sudo rm /etc/nginx/sites-enabled/reagent.eu.cc

# Restore default or create simple config
sudo nano /etc/nginx/sites-available/default

# Restart Nginx
sudo systemctl restart nginx

# Update .env
nano /root/blinkai/.env
# Change URLs back to http://159.65.141.68:3000

# Rebuild
cd /root/blinkai
npm run build
pm2 restart reagent
```

---

## Support

### Useful Links

- Let's Encrypt: https://letsencrypt.org/
- Certbot: https://certbot.eff.org/
- Nginx Docs: https://nginx.org/en/docs/
- SSL Test: https://www.ssllabs.com/ssltest/

### Common Commands

```bash
# Check everything
sudo systemctl status nginx
pm2 status
sudo certbot certificates

# Restart everything
sudo systemctl restart nginx
pm2 restart reagent

# View all logs
tail -f /var/log/nginx/reagent_error.log
pm2 logs reagent
```

---

**Ready to setup!** 🚀

1. Configure DNS first
2. Wait for propagation (5-10 minutes)
3. Run the setup script
4. Access https://reagent.eu.cc
