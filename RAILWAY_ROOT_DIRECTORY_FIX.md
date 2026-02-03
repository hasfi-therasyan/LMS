# Railway Root Directory Fix - CRITICAL

## 🔴 Masalah: Railway Masih Build dari Root

Error menunjukkan Railway masih menggunakan root `package.json` dengan script:
```json
"build": "cd frontend && npm run build"
```

Tapi `next` tidak ditemukan karena dependencies tidak terinstall di root.

---

## ✅ SOLUSI: Set Root Directory di Railway Dashboard

### Step 1: Buka Railway Dashboard
1. Login ke https://railway.app
2. Pilih project Anda
3. Pilih service **"frontend"** (atau service yang error)

### Step 2: Set Root Directory
1. Klik **"Settings"** tab
2. Scroll ke **"Root Directory"**
3. **HAPUS** value yang ada (jika ada)
4. **SET** ke: `frontend`
5. Klik **"Save"**

### Step 3: Redeploy
1. Klik **"Deployments"** tab
2. Klik **"Redeploy"** pada deployment terbaru
3. Atau klik **"..."** → **"Redeploy"**

---

## 🎯 Expected Behavior Setelah Fix

Setelah set Root Directory = `frontend`:

1. Railway akan:
   - Install dependencies di `frontend/` directory
   - Build dari `frontend/` directory
   - Start dari `frontend/` directory

2. Build log akan menunjukkan:
   ```
   ✓ Installing dependencies in frontend/
   ✓ Building Next.js app
   ✓ Build completed successfully
   ```

3. Tidak akan ada error `next: not found`

---

## 📝 Checklist

- [ ] **Root Directory** = `frontend` (di Railway Dashboard Settings)
- [ ] **Build Command** = auto-detect atau `npm run build` (dari frontend/)
- [ ] **Start Command** = auto-detect atau `npm start` (dari frontend/)
- [ ] **Redeploy** setelah update settings

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

## ⚠️ Important Notes

1. **Root Directory HARUS = `frontend`**
   - Bukan root (`/`)
   - Bukan kosong
   - Harus tepat: `frontend`

2. **Railway akan auto-detect:**
   - `package.json` di `frontend/`
   - `nixpacks.toml` di `frontend/` (jika ada)
   - Build dan start commands

3. **Jangan gunakan root `package.json` script:**
   - Root `package.json` memiliki `"build": "cd frontend && npm run build"`
   - Ini akan error karena dependencies tidak terinstall di root
   - Root Directory = `frontend` akan skip root `package.json`

---

## 🚀 Quick Fix (30 detik)

1. Railway Dashboard → Service "frontend"
2. Settings → Root Directory → Set: `frontend`
3. Save
4. Redeploy

**DONE!** Build error akan hilang.
