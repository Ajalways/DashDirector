# Deploy PulseBoardAI to Your Own Domain

## What You Need:
- Your domain name
- Hosting provider (VPS, cloud server, etc.)
- SSL certificate for HTTPS

## Production Build:
```bash
npm run build
```
This creates a `dist/` folder with:
- `dist/public/` - Frontend files
- `dist/index.js` - Backend server

## Server Requirements:
- Node.js 18+
- PostgreSQL database
- 512MB RAM minimum
- HTTPS/SSL certificate

## Environment Variables:
Create `.env` file:
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SESSION_SECRET=your-secret-key-here
ANTHROPIC_API_KEY=your-anthropic-key
CUSTOM_DOMAIN=yourdomain.com
PORT=3000
NODE_ENV=production
```

## Hosting Options:

### Option 1: VPS (DigitalOcean, Linode)
1. Upload files to server
2. Install dependencies: `npm install`
3. Run: `npm start`
4. Use PM2 for process management
5. Configure Nginx as reverse proxy

### Option 2: Cloud Platform
- **Vercel**: Connect GitHub repo
- **Railway**: Auto-deploy from GitHub
- **Render**: Deploy from repository

### Option 3: Traditional Web Host
1. Build locally: `npm run build`
2. Upload `dist/` folder contents
3. Point domain to server
4. Configure database connection

## Database Setup:
- Use managed PostgreSQL (AWS RDS, DigitalOcean Database)
- Or install PostgreSQL on your server
- Run: `npm run db:push` to create tables

## Your Domain Configuration:
1. Point A record to server IP
2. Configure SSL certificate
3. Set up subdomain for app (app.yourdomain.com)

Ready to deploy to your own infrastructure!