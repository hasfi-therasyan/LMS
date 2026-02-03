# 🚀 Panduan Deploy Frontend + Backend ke Netlify

## 📋 **Persiapan**

### **1. Pastikan Repository Sudah di GitHub**
- ✅ Code sudah di-push ke GitHub
- ✅ Repository: `hasfi-therasyan/LMS`

### **2. Siapkan Environment Variables**

Catat semua environment variables yang diperlukan:

**Backend Variables:**
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=https://your-app.netlify.app (update setelah deploy)
NODE_ENV=production
MAX_FILE_SIZE=10485760
```

**Frontend Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
MAINTENANCE_MODE=false
```

---

## 🎯 **Step-by-Step Deployment**

### **Step 1: Login ke Netlify**

1. Buka [https://app.netlify.com](https://app.netlify.com)
2. Login dengan GitHub account
3. Authorize Netlify untuk akses GitHub repositories

### **Step 2: Import Project dari GitHub**

1. Klik **"Add new site"** → **"Import an existing project"**
2. Pilih **"GitHub"** sebagai Git provider
3. Authorize Netlify (jika belum)
4. Pilih repository: **`hasfi-therasyan/LMS`**

### **Step 3: Configure Build Settings**

Netlify akan auto-detect `netlify.toml`, tapi pastikan settings ini:

**Build settings:**
- **Base directory**: `.` (root)
- **Build command**: `npm install --prefix backend && npm install --prefix frontend && cd backend && npm run build && cd ../frontend && npm run build`
- **Publish directory**: `frontend/.next`

**Atau biarkan Netlify auto-detect dari `netlify.toml`**

### **Step 4: Set Environment Variables**

**JANGAN klik "Deploy site" dulu!** Set environment variables terlebih dahulu:

1. Scroll ke bawah ke bagian **"Environment variables"**
2. Klik **"Add a variable"**
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

**Note:** `FRONTEND_URL` akan di-set setelah deploy selesai.

### **Step 5: Deploy**

1. Klik **"Deploy site"**
2. Tunggu build process selesai (bisa 5-10 menit)
3. Monitor build logs untuk melihat progress

### **Step 6: Update FRONTEND_URL**

Setelah deploy selesai:

1. Copy URL Netlify (misal: `https://lms-123456.netlify.app`)
2. Klik **"Site settings"** → **"Environment variables"**
3. Tambahkan:
   ```
   FRONTEND_URL
   = https://your-app-name.netlify.app
   ```
4. Klik **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## 🔍 **Verifikasi Deployment**

### **1. Check Build Logs**

Di Netlify Dashboard → **"Deploys"** → Klik deploy terbaru → **"View build log"**

**Yang harus muncul:**
- ✅ Installing dependencies
- ✅ Building backend
- ✅ Building frontend
- ✅ Deploying functions
- ✅ Deploying site

### **2. Test Endpoints**

**Frontend:**
- Buka URL Netlify (misal: `https://lms-123456.netlify.app`)
- Test login
- Test view jobsheet

**Backend API:**
- Test health check: `https://your-app.netlify.app/api/health`
- Test dengan Postman/curl

### **3. Check Functions**

1. Netlify Dashboard → **"Functions"**
2. Harus ada function: **`api`**
3. Klik untuk melihat logs

---

## ⚠️ **Troubleshooting**

### **Error: Build Failed**

**Kemungkinan penyebab:**
1. **Missing dependencies**
   - Pastikan `package.json` di `backend/` dan `frontend/` lengkap
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
   - Pastikan `netlify/functions/api.ts` ada
   - Check `netlify.toml` configuration

2. **Backend build failed**
   - Check build logs untuk error backend
   - Pastikan `backend/dist/` ter-generate

### **Error: 404 on API routes**

**Kemungkinan penyebab:**
1. **Redirect tidak bekerja**
   - Check `netlify.toml` redirects section
   - Pastikan format: `/.netlify/functions/api`

2. **Function handler error**
   - Check Function logs di Netlify Dashboard
   - Pastikan `serverless-http` ter-install

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
- [ ] `netlify.toml` sudah ada di root
- [ ] `netlify/functions/api.ts` sudah ada
- [ ] `serverless-http` sudah ter-install di `backend/package.json`
- [ ] Semua environment variables sudah dicatat
- [ ] Backend build berhasil di local (`cd backend && npm run build`)
- [ ] Frontend build berhasil di local (`cd frontend && npm run build`)

---

## 🎯 **Quick Reference**

### **Netlify Dashboard URLs:**
- **Sites**: https://app.netlify.com/sites
- **Functions**: https://app.netlify.com/sites/your-site/functions
- **Deploys**: https://app.netlify.com/sites/your-site/deploys
- **Environment Variables**: https://app.netlify.com/sites/your-site/configuration/env

### **Important Files:**
- `netlify.toml` - Netlify configuration
- `netlify/functions/api.ts` - Backend function wrapper
- `backend/src/index.ts` - Express app
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
   - Check Site logs untuk frontend errors

3. **Update custom domain (optional):**
   - Netlify Dashboard → **"Domain settings"**
   - Add custom domain

---

## 🆘 **Jika Masih Error**

1. **Check build logs** - Cari error spesifik
2. **Check Function logs** - Lihat runtime errors
3. **Test di local** - Pastikan berjalan di local dulu
4. **Check environment variables** - Pastikan semua sudah di-set
5. **Check Supabase** - Pastikan database dan storage accessible

---

**Selamat deploy! 🚀**
