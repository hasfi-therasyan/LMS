# 🔄 Panduan Restart Backend Server

## 📋 Development (Local)

### **Cara 1: Stop dan Start Manual**

1. **Stop Server:**
   - Buka terminal/command prompt di folder `backend`
   - Tekan `Ctrl + C` untuk stop server
   - Atau tutup terminal

2. **Start Server:**
   ```bash
   cd backend
   npm run dev
   ```

### **Cara 2: Restart dengan Satu Command**

Jika server masih berjalan, gunakan command ini di terminal baru:

**Windows (PowerShell):**
```powershell
# Stop server (jika berjalan di port 3001)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force

# Start server
cd backend
npm run dev
```

**Windows (Command Prompt):**
```cmd
# Stop server (jika berjalan di port 3001)
netstat -ano | findstr :3001
taskkill /PID [PID_NUMBER] /F

# Start server
cd backend
npm run dev
```

**Mac/Linux:**
```bash
# Stop server (jika berjalan di port 3001)
lsof -ti:3001 | xargs kill -9

# Start server
cd backend
npm run dev
```

---

## 🚀 Production (Vercel)

### **Cara 1: Via Vercel Dashboard**

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project Anda
3. Klik tab **"Deployments"**
4. Klik **"..."** (three dots) pada deployment terbaru
5. Pilih **"Redeploy"**
6. Konfirmasi redeploy

### **Cara 2: Via Git Push**

1. Buat perubahan kecil (misal: update comment)
2. Commit dan push:
   ```bash
   git add .
   git commit -m "chore: trigger redeploy"
   git push origin main
   ```
3. Vercel akan otomatis redeploy

### **Cara 3: Via Vercel CLI**

```bash
# Install Vercel CLI (jika belum)
npm i -g vercel

# Login
vercel login

# Redeploy
vercel --prod
```

---

## 🔍 Verifikasi Server Berjalan

### **Development:**
```bash
# Test health endpoint
curl http://localhost:3001/health

# Atau buka di browser
http://localhost:3001/health
```

### **Production:**
```bash
# Test health endpoint
curl https://[your-vercel-url]/api/health

# Atau buka di browser
https://[your-vercel-url]/api/health
```

---

## ⚠️ Troubleshooting

### **Port Already in Use (Development)**

Jika port 3001 sudah digunakan:

**Windows:**
```powershell
# Cari process yang menggunakan port 3001
netstat -ano | findstr :3001

# Stop process (ganti [PID] dengan angka yang muncul)
taskkill /PID [PID] /F
```

**Mac/Linux:**
```bash
# Cari dan stop process
lsof -ti:3001 | xargs kill -9
```

### **Server Tidak Start**

1. Cek apakah dependencies terinstall:
   ```bash
   cd backend
   npm install
   ```

2. Cek environment variables:
   - Pastikan `.env` file ada di folder `backend`
   - Pastikan semua variable terisi dengan benar

3. Cek logs untuk error:
   ```bash
   cd backend
   npm run dev
   # Lihat error di console
   ```

---

## 📝 Quick Reference

### **Development Commands:**
```bash
# Start server
cd backend && npm run dev

# Stop server
Ctrl + C

# Restart server
Ctrl + C (stop) → npm run dev (start)
```

### **Production (Vercel):**
- Dashboard → Deployments → Redeploy
- Atau: `git push` untuk auto-redeploy

---

## ✅ Checklist Restart

- [ ] Stop server yang sedang berjalan (Ctrl + C)
- [ ] Pastikan port 3001 tidak digunakan (jika development)
- [ ] Start server dengan `npm run dev`
- [ ] Test health endpoint untuk verifikasi
- [ ] Cek console untuk error (jika ada)

---

**Note:** Setelah restart, pastikan semua perubahan code sudah di-save dan environment variables sudah benar.
