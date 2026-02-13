#!/bin/bash
# Quick deployment script - Run this after git pull

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/anypart.lk || exit 1

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup database
echo "🗄️  Setting up database..."
chmod +x setup-database.sh
./setup-database.sh

# Build application
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "🔄 Restarting application..."
pm2 restart anypart-app

# Show logs
echo "📋 Application logs:"
pm2 logs anypart-app --lines 20

echo "✅ Deployment complete!"
