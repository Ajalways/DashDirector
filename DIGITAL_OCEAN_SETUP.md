# Deploy PulseBoardAI to Digital Ocean

## Step 1: Create Digital Ocean Droplet
1. **Size**: Basic $12/month (2GB RAM, 1 CPU) minimum
2. **OS**: Ubuntu 22.04 LTS
3. **Add your SSH key**
4. **Enable monitoring**

## Step 2: Create Managed Database
1. Go to Databases → Create Database
2. **Engine**: PostgreSQL 15
3. **Size**: Basic $15/month (1GB RAM)
4. **Region**: Same as your droplet
5. **Save connection details**

## Step 3: Server Setup Commands
```bash
# Connect to your droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx
apt install nginx -y

# Create app directory
mkdir -p /var/www/pulseboardai
cd /var/www/pulseboardai
```

## Step 4: Upload Your Code
```bash
# On your local machine, create deployment package
npm run build
tar -czf pulseboardai.tar.gz dist/ package.json package-lock.json

# Upload to server (replace YOUR_IP)
scp pulseboardai.tar.gz root@YOUR_IP:/var/www/pulseboardai/

# On server, extract and install
cd /var/www/pulseboardai
tar -xzf pulseboardai.tar.gz
npm install --production
```

## Step 5: Environment Configuration
Create `/var/www/pulseboardai/.env`:
```bash
DATABASE_URL=postgresql://username:password@your-db-host:25060/defaultdb?sslmode=require
SESSION_SECRET=your-super-secret-key-here
ANTHROPIC_API_KEY=your-anthropic-key
CUSTOM_DOMAIN=yourdomain.com
PORT=3000
NODE_ENV=production
```

## Step 6: PM2 Process Management
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'pulseboardai',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 7: Nginx Configuration
Create `/etc/nginx/sites-available/pulseboardai`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/pulseboardai /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## Step 8: SSL Certificate (Free)
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 9: Database Setup
```bash
# Connect to your app directory
cd /var/www/pulseboardai

# Push database schema
npm run db:push
```

## Step 10: Firewall Configuration
```bash
# Configure UFW firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

## Monitoring & Maintenance
```bash
# Check application status
pm2 status
pm2 logs pulseboardai

# Monitor system resources
htop

# Update application (future deployments)
pm2 stop pulseboardai
# Upload new files
pm2 restart pulseboardai
```

## Domain Configuration
1. Point your domain's A record to your droplet IP
2. Add www CNAME pointing to your domain
3. SSL will auto-renew via certbot

## Monthly Costs:
- Droplet: $12/month
- Database: $15/month  
- **Total: $27/month**

Your PulseBoardAI will be live at your domain with enterprise-grade hosting!