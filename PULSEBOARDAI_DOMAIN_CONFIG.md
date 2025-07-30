# PulseBoardAI.com Domain Configuration

## DNS Setup for pulseboardai.com

### Required DNS Records

#### 1. Main Domain (pulseboardai.com)
```
Type: A
Host: @ (or leave blank)
Value: [Your Replit Deployment IP]
TTL: 300 seconds
```

#### 2. WWW Subdomain 
```
Type: CNAME
Host: www
Value: pulseboardai.com
TTL: 300 seconds
```

#### 3. App Subdomain (for the main application)
```
Type: CNAME
Host: app
Value: [your-repl-name].[username].replit.app
TTL: 300 seconds
```

#### 4. Wildcard for Multi-Tenant Subdomains
```
Type: CNAME
Host: *
Value: [your-repl-name].[username].replit.app
TTL: 300 seconds
```

### Environment Variables for Replit

Set these in your Replit project:

```bash
CUSTOM_DOMAIN=pulseboardai.com
REPLIT_DOMAINS=pulseboardai.com,app.pulseboardai.com,*.pulseboardai.com
ALLOWED_ORIGINS=https://pulseboardai.com,https://app.pulseboardai.com,https://www.pulseboardai.com
ISSUER_URL=https://replit.com/oidc
```

### Domain Structure

#### Main Website (Marketing/Landing)
- **URL**: `https://pulseboardai.com`
- **Purpose**: Marketing site, pricing, features
- **Redirects to**: App subdomain for signup/login

#### Application Platform
- **URL**: `https://app.pulseboardai.com`
- **Purpose**: Main SaaS application
- **Features**: Dashboard, analytics, business intelligence

#### Customer Subdomains (White-label)
- **URL**: `https://[customer].pulseboardai.com`
- **Purpose**: Branded customer environments
- **Examples**: 
  - `acme.pulseboardai.com` 
  - `techcorp.pulseboardai.com`
  - `startup123.pulseboardai.com`

### Authentication Flow

1. **Landing Page**: `pulseboardai.com` → "Sign Up" button
2. **Redirect**: `app.pulseboardai.com/signup` 
3. **Account Creation**: Replit Auth handles signup
4. **Tenant Creation**: Automatic tenant setup
5. **Subdomain Assignment**: `[company].pulseboardai.com`

### SSL Certificate

Replit automatically provides SSL certificates for:
- `pulseboardai.com`
- `*.pulseboardai.com` (wildcard for all subdomains)

Certificate provisioning takes 5-15 minutes after DNS propagation.

### Testing Your Setup

#### 1. DNS Propagation
```bash
dig pulseboardai.com
dig app.pulseboardai.com
dig test.pulseboardai.com
```

#### 2. Application Health
```bash
curl https://app.pulseboardai.com/api/health
curl https://app.pulseboardai.com/api/domain-info
```

#### 3. Authentication
- Visit: `https://app.pulseboardai.com/api/login`
- Should redirect to Replit Auth
- Callback should return to your domain

### Migration Steps

#### Phase 1: DNS Setup (Day 1)
1. Configure DNS records
2. Set environment variables
3. Wait for propagation (1-24 hours)

#### Phase 2: Testing (Day 2)
1. Verify SSL certificates
2. Test authentication flow
3. Confirm subdomain routing

#### Phase 3: Go Live (Day 3)
1. Update marketing materials
2. Configure monitoring
3. Set up analytics tracking

### Multi-Tenant Customer Onboarding

#### New Customer Signup Flow:
1. Customer visits `pulseboardai.com`
2. Clicks "Get Started" → redirects to `app.pulseboardai.com`
3. Completes Replit Auth signup
4. System creates:
   - New tenant record
   - Customer subdomain: `[company].pulseboardai.com`
   - Initial admin user
   - Default branding/settings

#### Customer Access:
- **Admin Access**: `[company].pulseboardai.com/admin`
- **User Access**: `[company].pulseboardai.com`
- **API Access**: `[company].pulseboardai.com/api/*`

### Monitoring & Analytics

#### Domain Performance
- Monitor DNS resolution times
- Track SSL certificate expiry
- Monitor subdomain creation rate

#### Customer Usage
- Track active subdomains
- Monitor authentication success rates
- Measure tenant activity levels

### Security Considerations

#### Domain Security
- HTTPS enforced on all subdomains
- HSTS headers for security
- CORS properly configured

#### Tenant Isolation
- Database-level tenant separation
- Subdomain-based routing
- Session isolation per tenant

### Support & Troubleshooting

#### Common Issues
1. **DNS not propagating**: Wait 24-48 hours, check TTL settings
2. **SSL certificate issues**: Contact Replit support after 1 hour
3. **Authentication failures**: Verify REPLIT_DOMAINS configuration
4. **Subdomain not resolving**: Check wildcard CNAME record

#### Getting Help
- DNS Tools: dnschecker.org, whatsmydns.net
- SSL Tools: ssllabs.com/ssltest
- Replit Support: For deployment-specific issues

### Next Steps After Domain Setup

1. **Marketing Site**: Create landing page at pulseboardai.com
2. **Customer Onboarding**: Automated tenant creation flow
3. **Billing Integration**: Stripe setup for subscriptions
4. **Custom Branding**: Per-tenant logo/color customization
5. **Analytics**: Customer usage tracking and insights