# 🚀 Panduan Lengkap Deploy Frontend + Backend ke Vercel

## 📋 **Daftar Isi**

1. [Persiapan](#1-persiapan)
2. [Struktur Project](#2-struktur-project)
3. [Konfigurasi Vercel](#3-konfigurasi-vercel)
4. [Environment Variables](#4-environment-variables)
5. [Step-by-Step Deployment](#5-step-by-step-deployment)
6. [Verifikasi](#6-verifikasi)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. **Persiapan**

### **1.1 Pastikan Repository di GitHub**

✅ **Checklist:**
- [ ] Code sudah di-push ke GitHub
- [ ] Repository: `hasfi-therasyan/LMS`
- [ ] Semua file penting sudah ada di GitHub

### **1.2 Siapkan Environment Variables**

**Catat semua environment variables yang diperlukan:**

#### **Backend Variables:**
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=https://your-app.vercel.app (update setelah deploy)
NODE_ENV=production
MAX_FILE_SIZE=10485760
```

#### **Frontend Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
MAINTENANCE_MODE=false
```

**Note:** 
- `FRONTEND_URL` akan di-set setelah deploy selesai
- `NEXT_PUBLIC_API_URL` **JANGAN di-set** (akan menggunakan relative path `/api`)

---

## 2. **Struktur Project**

### **2.1 Struktur untuk Vercel**

```
LMS/
├── api/                    # Backend Serverless Functions
│   ├── index.ts           # Entry point untuk Vercel
│   ├── package.json       # Backend dependencies
│   ├── tsconfig.json      # TypeScript config
│   └── src/               # Backend source code
│       ├── index.ts       # Express app
│       ├── config/
│       ├── middleware/
│       ├── routes/
│       └── utils/
├── frontend/              # Next.js App
│   ├── package.json
│   ├── next.config.js
│   └── src/
│       └── app/
├── vercel.json            # Vercel Configuration
└── README.md
```

### **2.2 File Penting**

✅ **Pastikan file-file ini ada:**
- [ ] `vercel.json` - Konfigurasi Vercel
- [ ] `api/index.ts` - Backend function entry point
- [ ] `api/src/index.ts` - Express app
- [ ] `api/package.json` - Backend dependencies
- [ ] `frontend/package.json` - Frontend dependencies
- [ ] `frontend/src/app/page.tsx` - Root page
- [ ] `frontend/src/app/layout.tsx` - Root layout

---

## 3. **Konfigurasi Vercel**

### **3.1 File `vercel.json`**

File ini sudah ada di project Anda. Isinya:

```json
{
  "version": 2,
  "installCommand": "npm install --prefix api && npm install --prefix frontend",
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "functions": {
    "api/index.ts": {
      "includeFiles": ["api/src/**", "api/package.json"],
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/index.ts"
    }
  ]
}
```

**Penjelasan:**
- `installCommand`: Install dependencies untuk api dan frontend
- `buildCommand`: Build Next.js app di folder frontend
- `outputDirectory`: Output directory untuk Next.js build
- `functions`: Konfigurasi untuk serverless function (backend)
- `rewrites`: Redirect semua `/api/*` ke serverless function

### **3.2 File `api/index.ts`**

File ini adalah entry point untuk backend di Vercel:

```typescript
// Set VERCEL environment variable
process.env.VERCEL = '1';

// Import the Express app from local src directory
import app from './src/index';

// Export the Express app as a serverless function
export default app;
```

**Penjelasan:**
- Set `VERCEL=1` untuk mencegah server startup
- Import Express app dari `api/src/index.ts`
- Export sebagai default untuk Vercel serverless function

---

## 4. **Environment Variables**

### **4.1 Backend Variables (untuk Vercel)**

Set di Vercel Dashboard → Settings → Environment Variables:

```
SUPABASE_URL
= https://your-project-id.supabase.co

SUPABASE_SERVICE_ROLE_KEY
= your-service-role-key

SUPABASE_ANON_KEY
= your-anon-key

GEMINI_API_KEY
= your-gemini-api-key

NODE_ENV
= production

MAX_FILE_SIZE
= 10485760
```

**Note:** `FRONTEND_URL` akan di-set setelah deploy selesai.

### **4.2 Frontend Variables (untuk Vercel)**

```
NEXT_PUBLIC_SUPABASE_URL
= https://your-project-id.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
= your-anon-key

MAINTENANCE_MODE
= false
```

**Important:** 
- `NEXT_PUBLIC_API_URL` **JANGAN di-set**
- Frontend akan menggunakan relative path `/api` secara otomatis

---

## 5. **Step-by-Step Deployment**

### **Step 1: Login ke Vercel**

1. Buka browser
2. Kunjungi: [https://vercel.com](https://vercel.com)
3. Klik **"Sign Up"** atau **"Log In"**
4. Pilih **"Continue with GitHub"**
5. Authorize Vercel untuk akses GitHub repositories

### **Step 2: Import Project**

1. Setelah login, klik **"Add New..."** di dashboard
2. Pilih **"Project"**
3. Di halaman "Import Git Repository":
   - Pilih repository: **`hasfi-therasyan/LMS`**
   - Jika tidak muncul, klik **"Adjust GitHub App Permissions"** dan authorize
4. Klik **"Import"**

### **Step 3: Configure Project**

Vercel akan auto-detect konfigurasi dari `vercel.json`, tapi pastikan:

**Framework Preset:**
- ✅ **Next.js** (auto-detected)

**Root Directory:**
- ⚠️ **PENTING:** Biarkan **kosong** atau set ke **`.`** (root)
- Jangan set ke `frontend` karena kita perlu akses ke `api/` juga

**Build Command:**
- ✅ Auto dari `vercel.json`: `cd frontend && npm run build`

**Output Directory:**
- ✅ Auto dari `vercel.json`: `frontend/.next`

**Install Command:**
- ✅ Auto dari `vercel.json`: `npm install --prefix api && npm install --prefix frontend`

### **Step 4: Set Environment Variables**

**JANGAN klik "Deploy" dulu!** Set environment variables terlebih dahulu:

1. Scroll ke bawah ke bagian **"Environment Variables"**
2. Klik **"Add"** untuk setiap variable

#### **Tambahkan Backend Variables:**

Klik **"Add"** dan masukkan satu per satu:

1. **SUPABASE_URL**
   - Key: `SUPABASE_URL`
   - Value: `https://your-project-id.supabase.co`
   - Environment: Pilih **Production, Preview, Development** (semua)

2. **SUPABASE_SERVICE_ROLE_KEY**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `your-service-role-key`
   - Environment: Pilih **Production, Preview, Development** (semua)

3. **SUPABASE_ANON_KEY**
   - Key: `SUPABASE_ANON_KEY`
   - Value: `your-anon-key`
   - Environment: Pilih **Production, Preview, Development** (semua)

4. **GEMINI_API_KEY**
   - Key: `GEMINI_API_KEY`
   - Value: `your-gemini-api-key`
   - Environment: Pilih **Production, Preview, Development** (semua)

5. **NODE_ENV**
   - Key: `NODE_ENV`
   - Value: `production`
   - Environment: Pilih **Production, Preview, Development** (semua)

6. **MAX_FILE_SIZE**
   - Key: `MAX_FILE_SIZE`
   - Value: `10485760`
   - Environment: Pilih **Production, Preview, Development** (semua)

#### **Tambahkan Frontend Variables:**

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://your-project-id.supabase.co`
   - Environment: Pilih **Production, Preview, Development** (semua)

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `your-anon-key`
   - Environment: Pilih **Production, Preview, Preview, Development** (semua)

3. **MAINTENANCE_MODE**
   - Key: `MAINTENANCE_MODE`
   - Value: `false`
   - Environment: Pilih **Production, Preview, Development** (semua)

**Note:** `FRONTEND_URL` akan di-set setelah deploy selesai.

### **Step 5: Deploy**

1. Setelah semua environment variables di-set, scroll ke atas
2. Klik tombol **"Deploy"**
3. Tunggu build process selesai (bisa 5-10 menit)
4. Monitor build logs untuk melihat progress

**Yang terjadi saat build:**
1. Install dependencies untuk `api/` dan `frontend/`
2. Build Next.js app di `frontend/`
3. Prepare serverless function di `api/`
4. Deploy semua ke Vercel

### **Step 6: Update FRONTEND_URL**

Setelah deploy selesai:

1. Copy URL Vercel (misal: `https://lms-abc123.vercel.app`)
2. Klik **"Settings"** di project dashboard
3. Klik **"Environment Variables"** di sidebar
4. Klik **"Add"** untuk variable baru:
   - Key: `FRONTEND_URL`
   - Value: `https://your-app.vercel.app` (paste URL yang di-copy)
   - Environment: Pilih **Production, Preview, Development** (semua)
5. Klik **"Save"**
6. Klik **"Deployments"** di sidebar
7. Klik **"..."** pada deployment terbaru
8. Pilih **"Redeploy"**
9. Pilih **"Use existing Build Cache"** (optional)
10. Klik **"Redeploy"**

---

## 6. **Verifikasi**

### **6.1 Check Build Logs**

1. Vercel Dashboard → **"Deployments"**
2. Klik deployment terbaru
3. Klik **"Build Logs"**

**Yang harus muncul:**
- ✅ Installing dependencies (api)
- ✅ Installing dependencies (frontend)
- ✅ Building Next.js app
- ✅ Preparing serverless function
- ✅ Deploying

**Jika ada error:**
- Cek error message di build logs
- Pastikan semua environment variables sudah di-set
- Pastikan `api/src/` lengkap dengan semua files

### **6.2 Test Frontend**

1. Buka URL Vercel (misal: `https://lms-abc123.vercel.app`)
2. Test halaman:
   - ✅ Root page (`/`) - harus redirect ke login atau dashboard
   - ✅ Login page (`/login`) - harus bisa diakses
   - ✅ Admin dashboard (`/admin`) - setelah login sebagai admin
   - ✅ Student dashboard (`/student`) - setelah login sebagai student

### **6.3 Test Backend API**

1. Test health check:
   ```
   https://your-app.vercel.app/api/health
   ```
   Harus return: `{"status":"ok","timestamp":"..."}`

2. Test dengan Postman/curl:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

3. Test API dengan authentication:
   - Login di frontend
   - Check Network tab di browser DevTools
   - Pastikan API calls ke `/api/*` berhasil

### **6.4 Check Functions**

1. Vercel Dashboard → **"Functions"**
2. Harus ada function: **`api/index.ts`**
3. Klik untuk melihat logs dan metrics

---

## 7. **Troubleshooting**

### **7.1 Error: Build Failed**

**Kemungkinan penyebab:**
1. **Missing dependencies**
   - Pastikan `api/package.json` dan `frontend/package.json` lengkap
   - Check build logs untuk error spesifik

2. **TypeScript errors**
   - Fix semua TypeScript errors sebelum deploy
   - Run `npm run build` di local dulu

3. **Environment variables missing**
   - Pastikan semua env vars sudah di-set
   - Check build logs untuk error "Missing environment variable"

**Solusi:**
- Fix errors di local dulu
- Commit dan push ke GitHub
- Redeploy di Vercel

### **7.2 Error: Function not found**

**Kemungkinan penyebab:**
1. **Function file tidak ditemukan**
   - Pastikan `api/index.ts` ada
   - Pastikan `api/src/index.ts` ada
   - Check `vercel.json` configuration

2. **Backend build failed**
   - Check build logs untuk error backend
   - Pastikan `api/src/` lengkap

**Solusi:**
- Pastikan struktur folder benar
- Check `vercel.json` functions configuration
- Pastikan `api/src/` ada semua files

### **7.3 Error: 404 on API routes**

**Kemungkinan penyebab:**
1. **Rewrite tidak bekerja**
   - Check `vercel.json` rewrites section
   - Pastikan format: `/api/index.ts`

2. **Function handler error**
   - Check Function logs di Vercel Dashboard
   - Pastikan Express app ter-export dengan benar

**Solusi:**
- Check `vercel.json` rewrites
- Check Function logs untuk runtime errors
- Pastikan `api/index.ts` export default app

### **7.4 Error: Database connection failed**

**Kemungkinan penyebab:**
1. **Environment variables salah**
   - Double-check `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`
   - Pastikan tidak ada typo

2. **RLS policies**
   - Pastikan RLS policies di Supabase sudah benar
   - Check Supabase logs

**Solusi:**
- Verify environment variables di Vercel Dashboard
- Test Supabase connection di local dulu
- Check Supabase Dashboard untuk errors

### **7.5 Error: Frontend tidak load**

**Kemungkinan penyebab:**
1. **Build failed**
   - Check build logs untuk errors
   - Pastikan Next.js build berhasil

2. **Missing environment variables**
   - Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di-set
   - Check browser console untuk errors

**Solusi:**
- Check build logs
- Verify environment variables
- Check browser console untuk errors

---

## 8. **Checklist Final**

Sebelum deploy, pastikan:

- [ ] Code sudah di-push ke GitHub
- [ ] `vercel.json` sudah ada dan benar
- [ ] `api/index.ts` sudah ada
- [ ] `api/src/` lengkap dengan semua backend files
- [ ] `api/package.json` lengkap dengan dependencies
- [ ] `frontend/package.json` lengkap dengan dependencies
- [ ] Semua environment variables sudah dicatat
- [ ] Backend build berhasil di local (optional test)
- [ ] Frontend build berhasil di local (`cd frontend && npm run build`)

---

## 9. **Quick Reference**

### **Vercel Dashboard URLs:**
- **Projects**: https://vercel.com/dashboard
- **Deployments**: https://vercel.com/your-username/your-project/deployments
- **Settings**: https://vercel.com/your-username/your-project/settings
- **Environment Variables**: https://vercel.com/your-username/your-project/settings/environment-variables
- **Functions**: https://vercel.com/your-username/your-project/functions

### **Important Files:**
- `vercel.json` - Vercel configuration
- `api/index.ts` - Backend function entry point
- `api/src/index.ts` - Express app
- `frontend/package.json` - Frontend dependencies

---

## 10. **Tips & Best Practices**

1. **Test di local dulu:**
   - Pastikan `npm run build` berhasil di `frontend/`
   - Test API di local sebelum deploy

2. **Monitor build logs:**
   - Selalu check build logs untuk errors
   - Fix errors sebelum redeploy

3. **Environment variables:**
   - Set semua env vars sebelum deploy pertama
   - Update `FRONTEND_URL` setelah deploy selesai

4. **Incremental deployment:**
   - Deploy dan test satu per satu
   - Jangan set semua env vars sekaligus jika tidak yakin

---

**Selamat deploy! 🚀**

Jika ada pertanyaan atau error, jangan ragu untuk bertanya!
