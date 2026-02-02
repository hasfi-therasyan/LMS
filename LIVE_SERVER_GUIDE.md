# Cara Melihat Live Server LMS

## 🚀 Quick Start

### 1. Jalankan Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend akan running di: **http://localhost:3001**

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend akan running di: **http://localhost:3000**

### 2. Buka di Browser

Buka browser dan akses:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/health

## 📍 URL yang Tersedia

### Frontend (Next.js)
- **Home/Login:** http://localhost:3000
- **Login Page:** http://localhost:3000/login
- **Admin Dashboard:** http://localhost:3000/admin
- **Student Dashboard:** http://localhost:3000/student
- **Lecturer Dashboard:** http://localhost:3000/lecturer

### Backend API (Express)
- **Health Check:** http://localhost:3001/health
- **API Base:** http://localhost:3001/api

## 🔄 Hot Reload

Next.js dan Express dengan `tsx watch` sudah support **hot reload**:
- ✅ Save file → Auto reload
- ✅ Tidak perlu restart manual
- ✅ Changes langsung terlihat

## 🌐 Access dari Device Lain (Same Network)

Jika ingin akses dari smartphone/tablet di network yang sama:

### 1. Cari IP Address Anda
```bash
# Windows
ipconfig

# Lihat IPv4 Address, contoh: 192.168.1.100
```

### 2. Update Next.js Config

Edit `frontend/next.config.js`:
```javascript
module.exports = {
  // ... existing config
  async rewrites() {
    return [];
  },
  // Allow access from network
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};
```

### 3. Run dengan Host 0.0.0.0

**Frontend:**
```bash
cd frontend
# Edit package.json, ubah dev script:
# "dev": "next dev -H 0.0.0.0"
npm run dev
```

**Backend:**
```bash
cd backend
# Edit package.json, ubah dev script:
# "dev": "tsx watch --host 0.0.0.0 src/index.ts"
npm run dev
```

### 4. Akses dari Device Lain
- **Frontend:** http://YOUR_IP:3000
- **Backend:** http://YOUR_IP:3001

## 🛠️ VS Code Live Server Alternative

Jika ingin menggunakan extension seperti VS Code Live Server:

### Option 1: Use Next.js Dev Server (Recommended)
✅ Sudah include hot reload
✅ Sudah include error overlay
✅ Sudah include fast refresh
✅ Tidak perlu extension tambahan

### Option 2: VS Code Extension
1. Install extension: **"Live Server"** by Ritwick Dey
2. Right-click pada `frontend/public/index.html` (jika ada)
3. Pilih "Open with Live Server"

⚠️ **Note:** Next.js sudah punya built-in dev server yang lebih baik dari Live Server extension.

## 📱 Mobile Preview

### Chrome DevTools
1. Buka http://localhost:3000
2. Tekan **F12** → Toggle device toolbar (Ctrl+Shift+M)
3. Pilih device (iPhone, iPad, etc.)
4. Preview langsung di browser

### Real Device Testing
1. Pastikan device dan PC di network yang sama
2. Cari IP PC Anda (`ipconfig`)
3. Akses http://YOUR_IP:3000 dari device browser

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Windows - Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Cannot Access from Network
- ✅ Check firewall settings
- ✅ Check Windows Defender
- ✅ Pastikan device di network yang sama
- ✅ Gunakan IP address, bukan localhost

### Changes Not Reflecting
- ✅ Save file (Ctrl+S)
- ✅ Check terminal untuk errors
- ✅ Hard refresh browser (Ctrl+Shift+R)
- ✅ Clear browser cache

## 📊 Status Check

### Check if Servers are Running

**Frontend:**
```bash
curl http://localhost:3000
# Should return HTML
```

**Backend:**
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

## 🎯 Quick Commands

### Start Both Servers (PowerShell)
```powershell
# Terminal 1
cd backend; npm run dev

# Terminal 2 (new window)
cd frontend; npm run dev
```

### Start Both Servers (Bash/Git Bash)
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2 (new window)
cd frontend && npm run dev
```

## 📝 Notes

- ✅ Next.js dev server sudah include semua fitur Live Server
- ✅ Hot reload otomatis aktif
- ✅ Error overlay muncul di browser
- ✅ Fast refresh untuk React components
- ✅ Tidak perlu extension tambahan

**Recommended:** Gunakan Next.js dev server yang sudah built-in, lebih powerful dari Live Server extension!
