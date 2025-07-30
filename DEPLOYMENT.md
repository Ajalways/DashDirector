# PulseBoardAI Deployment Guide for Digital Ocean

## Prerequisites

- Digital Ocean account with a droplet (Ubuntu 20.04 LTS recommended)
- Domain name pointed to your droplet's IP address
- SSL certificate (Let's Encrypt recommended)

## Production Environment Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
```

### 2. Database Setup

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE pulseboardai;
CREATE USER pulseboardai_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pulseboardai TO pulseboardai_user;
\q
```

### 3. Application Deployment

```bash
# Clone your repository
git clone your-repo-url /var/www/pulseboardai
cd /var/www/pulseboardai

# Install dependencies
npm install

# Build the application
npm run build

# Set proper permissions
sudo chown -R www-data:www-data /var/www/pulseboardai
sudo chmod -R 755 /var/www/pulseboardai
```

### 4. Environment Configuration

Create `/var/www/pulseboardai/.env`:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://pulseboardai_user:your_secure_password@localhost:5432/pulseboardai
SESSION_SECRET=your_very_secure_session_secret_key_here
REPLIT_DOMAINS=yourdomain.com
ISSUER_URL=https://replit.com/oidc
REPL_ID=your_repl_id
```

### 5. SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 6. Nginx Configuration

Create `/etc/nginx/sites-available/pulseboardai`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static files
    location /assets/ {
        alias /var/www/pulseboardai/dist/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /uploads/ {
        alias /var/www/pulseboardai/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # API and application
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/pulseboardai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. PM2 Process Management

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'pulseboardai',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/pulseboardai-error.log',
    out_file: '/var/log/pm2/pulseboardai-out.log',
    log_file: '/var/log/pm2/pulseboardai-combined.log',
    time: true
  }]
};
```

Start the application:
```bash
# Run database migrations
npm run db:push

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 8. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 9. Monitoring and Logs

```bash
# View application logs
pm2 logs pulseboardai

# Monitor processes
pm2 monit

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Security Considerations

1. **Database Security**: Use strong passwords and restrict database access
2. **Session Security**: Use a cryptographically secure session secret
3. **File Uploads**: Ensure proper validation and storage limits
4. **Regular Updates**: Keep system and dependencies updated
5. **Backup Strategy**: Regular database and file backups

## Maintenance

### Updating the Application

```bash
cd /var/www/pulseboardai
git pull origin main
npm install
npm run build
npm run db:push
pm2 restart pulseboardai
```

### Database Backup

```bash
# Create backup
pg_dump -U pulseboardai_user -h localhost pulseboardai > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -U pulseboardai_user -h localhost pulseboardai < backup_file.sql
```

## Performance Optimization

1. **Database Indexing**: Ensure proper indexes on frequently queried columns
2. **Caching**: Consider Redis for session storage and caching
3. **CDN**: Use a CDN for static assets
4. **Image Optimization**: Optimize uploaded logos and images
5. **Database Connection Pooling**: Already configured with Neon serverless

## Troubleshooting

- Check PM2 logs: `pm2 logs pulseboardai`
- Check Nginx status: `sudo systemctl status nginx`
- Check PostgreSQL status: `sudo systemctl status postgresql`
- Test SSL: `openssl s_client -connect yourdomain.com:443`
- Check disk space: `df -h`
- Monitor memory: `free -h`