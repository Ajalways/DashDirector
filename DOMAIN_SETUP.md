# Domain Setup Guide for PulseBoardAI

## Connecting Your Existing Domain

### Step 1: DNS Configuration

#### For Main Domain (e.g., yourdomain.com)
1. **A Record**: Point your domain to your Replit deployment IP
   ```
   Type: A
   Host: @
   Value: [Your Replit Deployment IP]
   TTL: 300 (5 minutes)
   ```

2. **CNAME Record for www**: 
   ```
   Type: CNAME
   Host: www
   Value: yourdomain.com
   TTL: 300
   ```

#### For Subdomain Setup (e.g., app.yourdomain.com)
```
Type: CNAME
Host: app
Value: [your-repl-name].[username].replit.app
TTL: 300
```

#### For Multi-Tenant Subdomains (e.g., client1.yourdomain.com)
```
Type: CNAME
Host: *
Value: [your-repl-name].[username].replit.app
TTL: 300
```

### Step 2: Application Configuration

#### Environment Variables to Set:
```
CUSTOM_DOMAIN=yourdomain.com
REPLIT_DOMAINS=yourdomain.com,app.yourdomain.com,*.yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### Step 3: SSL Certificate
- Replit automatically provides SSL certificates for custom domains
- Certificate provisioning may take 5-15 minutes after DNS propagation
- Verify HTTPS is working: `https://yourdomain.com`

### Step 4: Update Replit Auth Configuration
The application will automatically handle the domain in the Replit Auth callback URLs.

## Domain Types Supported

### 1. Single Domain
- **Example**: `pulseboard.com`
- **Use Case**: Single company installation
- **Configuration**: Point A record to Replit IP

### 2. Subdomain for App
- **Example**: `app.pulseboard.com`
- **Use Case**: Separate app from marketing site
- **Configuration**: CNAME to Replit deployment

### 3. Multi-Tenant Subdomains
- **Example**: `client1.pulseboard.com`, `client2.pulseboard.com`
- **Use Case**: White-label multi-tenant setup
- **Configuration**: Wildcard CNAME (`*`)

## Testing Your Domain Setup

### 1. DNS Propagation Check
```bash
dig yourdomain.com
nslookup yourdomain.com
```

### 2. Application Health Check
Visit: `https://yourdomain.com/api/health`
Expected response: `{"status": "ok", "domain": "yourdomain.com"}`

### 3. Authentication Test
1. Visit: `https://yourdomain.com/api/login`
2. Should redirect to Replit Auth with correct callback URL

## Common Issues & Solutions

### DNS Not Propagating
- **Wait Time**: DNS changes can take 24-48 hours globally
- **Check**: Use DNS checker tools online
- **Solution**: Clear DNS cache or try different DNS servers

### SSL Certificate Issues
- **Symptom**: Browser shows "Not Secure" warning
- **Wait Time**: SSL provisioning takes 5-15 minutes
- **Solution**: Contact Replit support if still failing after 1 hour

### Authentication Redirect Issues
- **Symptom**: Auth callback fails or redirects to wrong domain
- **Check**: Verify `REPLIT_DOMAINS` environment variable
- **Solution**: Ensure your domain is in the allowed domains list

### Multi-Tenant Subdomain Issues
- **Symptom**: Subdomains not resolving to correct tenant
- **Check**: Wildcard CNAME record (`*`)
- **Solution**: Verify tenant subdomain configuration in database

## Security Considerations

### 1. HTTPS Only
- Always use HTTPS in production
- Configure HSTS headers for security
- Redirect HTTP to HTTPS automatically

### 2. CORS Configuration
- Update allowed origins for your domain
- Test cross-origin requests work properly

### 3. Session Security
- Verify secure cookies work with your domain
- Test session persistence across page reloads

## Post-Setup Checklist

- [ ] DNS A/CNAME records configured
- [ ] Environment variables updated
- [ ] SSL certificate active (HTTPS working)
- [ ] Authentication flow working
- [ ] Multi-tenant subdomains resolving (if applicable)
- [ ] All application features functional on new domain
- [ ] Performance testing completed
- [ ] Monitoring alerts updated with new domain

## Getting Your Replit Deployment Details

1. **Find Your Replit App URL**: 
   - Look at the current URL: `https://[repl-name].[username].replit.app`
   
2. **Get Deployment IP** (if needed):
   - Run: `nslookup [repl-name].[username].replit.app`
   - Use the returned IP address in A records

## Support

If you encounter issues:
1. Check DNS propagation: https://dnschecker.org
2. Verify SSL status: https://www.ssllabs.com/ssltest/
3. Test authentication flow
4. Check Replit deployment logs for errors

For complex multi-tenant setups or enterprise domains, consider consulting with a DNS/domain expert.