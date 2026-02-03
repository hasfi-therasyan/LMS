# 🚨 CRITICAL FIX: Railway Root Directory

## Masalah

Railway masih build dari **root directory**, bukan dari `frontend/`. Ini menyebabkan:
- `npm i` di root (tidak ada dependencies)
- `npm run build` di root → menjalankan `cd frontend && npm run build`
- `next: not found` karena dependencies tidak terinstall di root

---

## ✅ SOLUSI: Set Root Directory di Railway Dashboard

### ⚠️ PENTING: Ini HARUS dilakukan di Railway Dashboard!

**Railway tidak akan membaca konfigurasi file jika Root Directory tidak di-set dengan benar.**

### Step-by-Step:

1. **Buka Railway Dashboard**
   - https://railway.app
   - Login
   - Pilih project Anda

2. **Pilih Service "frontend"**
   - Klik service yang error (biasanya "frontend" atau service pertama)

3. **Settings → Root Directory**
   - Scroll ke bagian **"Root Directory"**
   - **HAPUS** value yang ada (jika ada `/` atau kosong)
   - **KETIK:** `frontend` (tepat seperti ini, tanpa slash)
   - Klik **"Save"**

4. **Redeploy**
   - Klik tab **"Deployments"**
   - Klik **"Redeploy"** pada deployment terbaru
   - Atau klik **"..."** → **"Redeploy"**

---

## 🎯 Expected Behavior Setelah Fix

Setelah set Root Directory = `frontend`:

### Build Log Akan Menunjukkan:
```
✓ Using Nixpacks
✓ setup: nodejs_20, npm-9_x
✓ install: npm i (di frontend/)
✓ build: npm run build (di frontend/)
✓ start: npm start (di frontend/)
```

### Tidak Akan Ada:
- ❌ `npm i` di root
- ❌ `cd frontend && npm run build`
- ❌ `next: not found` error

---

## 📝 Visual Guide

### ❌ SALAH (Root Directory = `/` atau kosong):
```
/app/
├── package.json (root) ← Railway baca ini
├── frontend/
│   ├── package.json
│   └── node_modules/ ← Dependencies di sini
└── api/
```
**Result:** Railway install di root → `next` tidak ditemukan

### ✅ BENAR (Root Directory = `frontend`):
```
/app/frontend/  ← Railway mulai dari sini
├── package.json ← Railway baca ini
├── node_modules/ ← Dependencies di sini
└── src/
```
**Result:** Railway install di `frontend/` → `next` ditemukan ✅

---

## 🔧 Alternative: Manual Service Configuration

Jika Root Directory tidak bekerja:

1. **Railway Dashboard** → Service **"frontend"**
2. **Settings** → **Build & Deploy**
3. **Root Directory:** `frontend`
4. **Build Command:** `npm install --include=dev && npm run build`
5. **Start Command:** `npm start`
6. **Save** → **Redeploy**

---

## ⚠️ Common Mistakes

1. **Root Directory = `/frontend`** ❌
   - Jangan pakai leading slash
   - Harus: `frontend` ✅

2. **Root Directory = `./frontend`** ❌
   - Jangan pakai `./`
   - Harus: `frontend` ✅

3. **Root Directory kosong** ❌
   - Railway akan gunakan root
   - Harus: `frontend` ✅

4. **Tidak Redeploy setelah update** ❌
   - Settings tidak akan apply
   - Harus: **Redeploy** ✅

---

## 🚀 Quick Fix (Copy-Paste)

1. Railway Dashboard → Service "frontend"
2. Settings → Root Directory
3. **Hapus semua** → **Ketik: `frontend`**
4. Save
5. Deployments → Redeploy

**DONE!** Build akan berhasil.

---

## 📞 Still Not Working?

Jika masih error setelah set Root Directory:

1. **Check Build Logs:**
   - Apakah masih `npm i` di root?
   - Apakah masih `cd frontend && npm run build`?
   - Jika ya, Root Directory belum apply → Redeploy lagi

2. **Check Service Settings:**
   - Root Directory = `frontend` (tanpa slash)
   - Build Command = auto atau `npm run build`
   - Start Command = auto atau `npm start`

3. **Delete and Recreate Service:**
   - Delete service "frontend"
   - Create new service from GitHub
   - Set Root Directory = `frontend` immediately
   - Deploy

---

## ✅ Verification

Setelah fix, build log harus menunjukkan:
```
✓ Installing dependencies in /app/frontend/
✓ Building Next.js app
✓ Build completed successfully
✓ Starting server
```

**Tidak akan ada:**
- ❌ `npm i` di `/app/`
- ❌ `cd frontend && npm run build`
- ❌ `next: not found`

---

## 🎯 Summary

**MASALAH:** Railway build dari root
**SOLUSI:** Set Root Directory = `frontend` di Railway Dashboard
**ACTION:** Settings → Root Directory → `frontend` → Save → Redeploy

**INI ADALAH FIX YANG WAJIB DILAKUKAN DI RAILWAY DASHBOARD!**
