#!/bin/bash

# Plakamdüştü.com Deployment Script

echo "🚀 Starting deployment..."

# 1. Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# 2. Build frontend
echo "🏗️ Building frontend..."
npm run build

# 3. Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p backend/uploads

# 4. Set permissions
echo "🔐 Setting permissions..."
chmod -R 755 backend/uploads

# 5. Start with PM2
echo "🔄 Starting services with PM2..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo "✅ Deployment completed!"
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs"


