# 🚀 Panduan Deploy Frontend + Backend ke Vercel

## 📋 **Persiapan**

### **1. Pastikan Repository Sudah di GitHub**
- ✅ Code sudah di-push ke GitHub
- ✅ Repository: `hasfi-therasyan/LMS`

### **2. Siapkan Environment Variables**

Catat semua environment variables yang diperlukan:

**Backend Variables (untuk Vercel):**
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=https://your-app.vercel.app (update setelah deploy)
NODE_ENV=production
MAX_FILE_SIZE=10485760
```

**Frontend Variables (untuk Vercel):**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL= (kosongkan - akan menggunakan relative path)
MAINTENANCE_MODE=false
```

---

## 🎯 **Step-by-Step Deployment**

### **Step 1: Login ke Vercel**

1. Buka [https://vercel.com](https://vercel.com)
2. Login dengan GitHub account
3. Authorize Vercel untuk akses GitHub repositories

### **Step 2: Import Project dari GitHub**

1. Klik **"Add New..."** → **"Project"**
2. Pilih repository: **`hasfi-therasyan/LMS`**
3. Klik **"Import"**

### **Step 3: Configure Project Settings**

Vercel akan auto-detect konfigurasi dari `vercel.json`, tapi pastikan:

**Framework Preset:**
- **Frontend**: Next.js (auto-detected)
- **Backend**: Serverless Functions (auto-detected)

**Root Directory:**
- Biarkan kosong (root project)

**Build Command:**
- Auto dari `vercel.json` (tidak perlu diubah)

**Output Directory:**
- Auto untuk Next.js (tidak perlu diubah)

### **Step 4: Set Environment Variables**

**JANGAN klik "Deploy" dulu!** Set environment variables terlebih dahulu:

1. Scroll ke bagian **"Environment Variables"**
2. Klik **"Add"** untuk setiap variable
3. Tambahkan satu per satu:

#### **Backend Variables:**

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

#### **Frontend Variables:**

```
NEXT_PUBLIC_SUPABASE_URL
= https://your-project-id.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
= your-anon-key

MAINTENANCE_MODE
= false
```

**Note:** 
- `FRONTEND_URL` akan di-set setelah deploy selesai
- `NEXT_PUBLIC_API_URL` **JANGAN di-set** (akan menggunakan relative path `/api`)

### **Step 5: Deploy**

1. Klik **"Deploy"**
2. Tunggu build process selesai (bisa 5-10 menit)
3. Monitor build logs untuk melihat progress

### **Step 6: Update FRONTEND_URL**

Setelah deploy selesai:

1. Copy URL Vercel (misal: `https://lms-abc123.vercel.app`)
2. Klik **"Settings"** → **"Environment Variables"**
3. Tambahkan/Update:
   ```
   FRONTEND_URL
   = https://your-app.vercel.app
   ```
4. Klik **"Redeploy"** untuk apply changes

---

## 🔍 **Verifikasi Deployment**

### **1. Check Build Logs**

Di Vercel Dashboard → **"Deployments"** → Klik deployment terbaru → **"Build Logs"**

**Yang harus muncul:**
- ✅ Installing dependencies (api)
- ✅ Installing dependencies (frontend)
- ✅ Building serverless functions
- ✅ Building Next.js app
- ✅ Deploying

### **2. Test Endpoints**

**Frontend:**
- Buka URL Vercel (misal: `https://lms-abc123.vercel.app`)
- Test login
- Test view jobsheet

**Backend API:**
- Test health check: `https://your-app.vercel.app/api/health`
- Test dengan Postman/curl

### **3. Check Functions**

1. Vercel Dashboard → **"Functions"**
2. Harus ada function: **`api/index.ts`**
3. Klik untuk melihat logs

---

## ⚠️ **Troubleshooting**

### **Error: Build Failed**

**Kemungkinan penyebab:**
1. **Missing dependencies**
   - Pastikan `package.json` di `api/` dan `frontend/` lengkap
   - Check build logs untuk error spesifik

2. **TypeScript errors**
   - Fix semua TypeScript errors sebelum deploy
   - Run `npm run build` di local dulu

3. **Environment variables missing**
   - Pastikan semua env vars sudah di-set
   - Check build logs untuk error "Missing environment variable"

### **Error: Function not found**

**Kemungkinan penyebab:**
1. **Function file tidak ditemukan**
   - Pastikan `api/index.ts` ada
   - Pastikan `api/src/index.ts` ada
   - Check `vercel.json` configuration

2. **Backend build failed**
   - Check build logs untuk error backend
   - Pastikan `api/src/` lengkap

### **Error: 404 on API routes**

**Kemungkinan penyebab:**
1. **Rewrite tidak bekerja**
   - Check `vercel.json` rewrites section
   - Pastikan format: `/api/index.ts`

2. **Function handler error**
   - Check Function logs di Vercel Dashboard
   - Pastikan Express app ter-export dengan benar

### **Error: Database connection failed**

**Kemungkinan penyebab:**
1. **Environment variables salah**
   - Double-check `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`
   - Pastikan tidak ada typo

2. **RLS policies**
   - Pastikan RLS policies di Supabase sudah benar
   - Check Supabase logs

---

## 📝 **Checklist Sebelum Deploy**

- [ ] Code sudah di-push ke GitHub
- [ ] `vercel.json` sudah ada di root
- [ ] `api/index.ts` sudah ada
- [ ] `api/src/` lengkap dengan semua backend files
- [ ] `api/package.json` lengkap dengan dependencies
- [ ] Semua environment variables sudah dicatat
- [ ] Backend build berhasil di local (jika test)
- [ ] Frontend build berhasil di local (`cd frontend && npm run build`)

---

## 🎯 **Quick Reference**

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

## ✅ **Setelah Deploy Berhasil**

1. **Test semua fitur:**
   - Login/Register
   - View jobsheets
   - Upload assignments
   - Take quizzes
   - AI chatbot

2. **Monitor logs:**
   - Check Function logs untuk error
   - Check Deployment logs untuk build errors

3. **Update custom domain (optional):**
   - Vercel Dashboard → **"Settings"** → **"Domains"**
   - Add custom domain

---

## 🔧 **Project Structure untuk Vercel**

```
LMS/
├── api/                    # Backend serverless functions
│   ├── index.ts           # Function entry point
│   ├── package.json       # Backend dependencies
│   ├── tsconfig.json      # TypeScript config
│   └── src/               # Backend source code
│       ├── index.ts       # Express app
│       ├── config/
│       ├── middleware/
│       ├── routes/
│       └── utils/
├── frontend/              # Next.js app
│   ├── package.json
│   └── src/
├── vercel.json            # Vercel configuration
└── README.md
```

---

## 🆘 **Jika Masih Error**

1. **Check build logs** - Cari error spesifik
2. **Check Function logs** - Lihat runtime errors
3. **Test di local** - Pastikan berjalan di local dulu
4. **Check environment variables** - Pastikan semua sudah di-set
5. **Check Supabase** - Pastikan database dan storage accessible

---

## 📌 **Important Notes**

1. **API URL di Frontend:**
   - Di production, frontend akan menggunakan relative path `/api`
   - Tidak perlu set `NEXT_PUBLIC_API_URL` di Vercel
   - Code sudah handle ini di `frontend/src/lib/api.ts`

2. **Serverless Functions:**
   - Backend akan di-deploy sebagai serverless functions
   - Setiap API route akan menjadi function terpisah
   - Cold start mungkin terjadi pada first request

3. **File Upload:**
   - File upload akan bekerja dengan baik
   - Max file size: 10MB (default)
   - Files disimpan di Supabase Storage

---

**Selamat deploy! 🚀**
