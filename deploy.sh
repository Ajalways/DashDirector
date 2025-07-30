#!/bin/bash

# PulseBoardAI Digital Ocean Deployment Script
# Run this script to build and prepare for deployment

echo "🚀 Building PulseBoardAI for production..."

# Build the application
npm run build

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf pulseboardai-deployment.tar.gz \
  dist/ \
  package.json \
  package-lock.json \
  ecosystem.config.js \
  .env.example

echo "✅ Deployment package created: pulseboardai-deployment.tar.gz"
echo ""
echo "📋 Next steps:"
echo "1. Upload pulseboardai-deployment.tar.gz to your Digital Ocean droplet"
echo "2. Extract: tar -xzf pulseboardai-deployment.tar.gz"
echo "3. Install dependencies: npm install --production"
echo "4. Configure environment variables in .env"
echo "5. Start with PM2: pm2 start ecosystem.config.js"
echo ""
echo "💡 See DIGITAL_OCEAN_SETUP.md for complete deployment guide"