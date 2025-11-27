# 🚀 Deployment Guide - Plakamdüştü.com

Bu doküman, projeyi uzak sunucuda ayağa kaldırmak için gerekli adımları içerir.

## 📋 Gereksinimler

- Node.js (v18 veya üzeri)
- npm veya yarn
- PM2 (Process Manager)
- Git

## 🔧 Kurulum Adımları

### 1. Sunucuya Bağlanın
```bash
ssh kullanici@sunucu-ip
```

### 2. Projeyi Klonlayın
```bash
git clone https://github.com/KULLANICI_ADI/REPO_ADI.git
cd plaka
```

### 3. PM2'yi Global Olarak Yükleyin
```bash
npm install -g pm2
npm install -g serve
```

### 4. Environment Variables Ayarlayın
```bash
cp .env.example .env
nano .env  # veya vi .env
```

`.env` dosyasını düzenleyin:
```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=http://sunucu-ip:3000
# veya domain kullanıyorsanız:
# CORS_ORIGIN=https://plakamdustu.com
```

### 5. Frontend API URL'ini Ayarlayın

`src/services/api.ts` dosyasında `API_BASE_URL` değişkenini sunucu adresinize göre güncelleyin:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://sunucu-ip:5000/api';
```

Veya `.env` dosyasına ekleyin:
```env
VITE_API_BASE_URL=http://sunucu-ip:5000/api
```

### 6. Deployment Script'ini Çalıştırın
```bash
chmod +x deploy.sh
./deploy.sh
```

Veya manuel olarak:

```bash
# Bağımlılıkları yükle
npm install
cd backend && npm install && cd ..

# Frontend'i build et
npm run build

# Klasörleri oluştur
mkdir -p logs backend/uploads

# PM2 ile başlat
pm2 start ecosystem.config.js
pm2 save
```

## 🔄 PM2 Komutları

```bash
# Durum kontrolü
pm2 status

# Logları görüntüle
pm2 logs

# Tüm servisleri yeniden başlat
pm2 restart all

# Tüm servisleri durdur
pm2 stop all

# Tüm servisleri sil
pm2 delete all

# Sistem başlangıcında otomatik başlatma
pm2 startup
pm2 save
```

## 🌐 Nginx Reverse Proxy (Opsiyonel)

Domain kullanıyorsanız, Nginx reverse proxy kurulumu:

```nginx
server {
    listen 80;
    server_name plakamdustu.com www.plakamdustu.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

## 🔍 Sorun Giderme

### Backend çalışmıyor
```bash
pm2 logs plaka-backend
cd backend && node src/server.js  # Manuel test
```

### Frontend çalışmıyor
```bash
pm2 logs plaka-frontend
npm run build  # Build'i kontrol et
```

### Port zaten kullanılıyor
```bash
# Port'u kontrol et
lsof -i :5000
lsof -i :3000

# Process'i sonlandır
kill -9 PID
```

### Veritabanı hatası
```bash
# Veritabanı dosyasını kontrol et
ls -la backend/plaka.db

# Gerekirse silip yeniden oluştur
rm backend/plaka.db
# Backend'i yeniden başlat, otomatik oluşturulacak
```

## 📝 Güncelleme

Yeni değişiklikleri deploy etmek için:

```bash
git pull origin main
npm install
cd backend && npm install && cd ..
npm run build
pm2 restart all
```

## 🔐 Güvenlik Notları

- `.env` dosyasını asla commit etmeyin
- Production'da `NODE_ENV=production` kullanın
- Firewall kurallarını kontrol edin
- SSL sertifikası kullanın (Let's Encrypt)

## 📞 Destek

Sorun yaşarsanız:
- PM2 loglarını kontrol edin: `pm2 logs`
- Backend loglarını kontrol edin: `tail -f logs/backend-error.log`
- Frontend loglarını kontrol edin: `tail -f logs/frontend-error.log`


