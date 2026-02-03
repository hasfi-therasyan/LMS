# Deployment Guide

Panduan lengkap untuk deploy LMS ke Vercel, Netlify, atau hosting service lainnya.

## ✅ Apakah AI dan Database Tetap Bisa Berjalan?

**JA, AI dan Database akan tetap berjalan!** Berikut penjelasannya:

### 1. **Database (Supabase)** ✅
- Supabase adalah **cloud service** yang terpisah dari hosting aplikasi
- Database akan tetap berjalan di Supabase cloud
- Tidak peduli di mana frontend/backend di-host, database tetap bisa diakses
- Hanya perlu set environment variables dengan URL dan keys Supabase

### 2. **AI (Google Gemini API)** ✅
- Gemini API adalah **cloud service** dari Google
- AI akan tetap berjalan di Google cloud
- Tidak peduli di mana backend di-host, AI tetap bisa diakses
- Hanya perlu set `GEMINI_API_KEY` di environment variables

### 3. **Backend API** ⚠️
- Backend Express.js perlu di-host terpisah atau menggunakan Next.js API Routes
- **Opsi 1**: Host backend terpisah (Railway, Render, Fly.io, dll)
- **Opsi 2**: Migrate ke Next.js API Routes (recommended untuk Vercel)

### 4. **Frontend (Next.js)** ✅
- Bisa langsung di-host di Vercel (recommended) atau Netlify
- Vercel sangat optimal untuk Next.js

---

## 🚀 Deployment Options

### **Option 1: Vercel (Recommended) - Full Stack**

Vercel mendukung Next.js dengan API Routes, jadi bisa deploy frontend + backend dalam satu project.

#### **A. Migrate Backend ke Next.js API Routes**

1. **Buat folder API routes:**
   ```
   frontend/src/app/api/
   ├── auth/
   ├── quizzes/
   ├── jobsheets/
   ├── jobsheet-assignments/
   └── ai/
   ```

2. **Convert Express routes ke Next.js API routes:**
   - Express: `app.get('/api/quizzes', ...)`
   - Next.js: `frontend/src/app/api/quizzes/route.ts` dengan `export async function GET()`

3. **Deploy ke Vercel:**
   ```bash
   cd frontend
   vercel
   ```

#### **B. Atau Host Backend Terpisah**

Jika tidak ingin migrate, bisa host backend di:
- **Railway** (recommended): https://railway.app
- **Render**: https://render.com
- **Fly.io**: https://fly.io
- **Heroku**: https://heroku.com

---

### **Option 2: Netlify + Railway/Render**

1. **Frontend di Netlify:**
   ```bash
   cd frontend
   netlify deploy
   ```

2. **Backend di Railway/Render:**
   - Upload backend code
   - Set environment variables
   - Deploy

---

## 📋 Environment Variables yang Perlu Di-Set

### **Frontend (Vercel/Netlify)**

Di dashboard hosting service, set environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Backend API (jika backend terpisah)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
# atau jika menggunakan Next.js API Routes, tidak perlu ini
```

### **Backend (Railway/Render/Fly.io)**

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration (ganti dengan URL frontend production)
FRONTEND_URL=https://your-app.vercel.app

# File Upload
MAX_FILE_SIZE=10485760
```

---

## 🔧 Setup Steps untuk Vercel (Full Stack)

### **1. Migrate Backend ke Next.js API Routes**

Karena Vercel optimal untuk Next.js, lebih baik convert backend Express ke Next.js API Routes.

**Contoh: Convert `/api/quizzes` route**

**Sebelum (Express):**
```typescript
// backend/src/routes/quizzes.ts
router.get('/', async (req, res) => {
  // ... logic
});
```

**Sesudah (Next.js API Route):**
```typescript
// frontend/src/app/api/quizzes/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // ... logic
  return NextResponse.json(data);
}
```

### **2. Update Frontend API Calls**

Jika menggunakan Next.js API Routes, update `NEXT_PUBLIC_API_URL`:
- Development: `http://localhost:3000` (Next.js dev server)
- Production: Tidak perlu set (relative path `/api/...`)

### **3. Deploy ke Vercel**

```bash
cd frontend
npm install -g vercel
vercel login
vercel
```

Atau connect GitHub repository di Vercel dashboard.

### **4. Set Environment Variables di Vercel**

Di Vercel Dashboard → Project → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (untuk API routes)
- `SUPABASE_SERVICE_ROLE_KEY` (untuk API routes)

---

## 🔧 Setup Steps untuk Railway (Backend Terpisah)

### **1. Prepare Backend**

```bash
cd backend
npm install
npm run build
```

### **2. Deploy ke Railway**

1. Sign up di https://railway.app
2. New Project → Deploy from GitHub
3. Select repository
4. Railway akan auto-detect Node.js project

### **3. Set Environment Variables**

Di Railway Dashboard → Variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `PORT` (Railway akan set otomatis, tapi bisa override)
- `FRONTEND_URL` (URL frontend production)
- `NODE_ENV=production`

### **4. Update Frontend API URL**

Di frontend environment variables:
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## 🔧 Setup Steps untuk Render (Backend Terpisah)

### **1. Prepare Backend**

Sama seperti Railway, pastikan `package.json` punya:
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc"
  }
}
```

### **2. Deploy ke Render**

1. Sign up di https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### **3. Set Environment Variables**

Sama seperti Railway, set semua environment variables di Render dashboard.

---

## ✅ Checklist Sebelum Deploy

- [ ] Semua environment variables sudah di-set di hosting service
- [ ] Database migrations sudah di-run di Supabase
- [ ] Supabase Storage buckets sudah dibuat (`modules`, `jobsheet-assignments`, dll)
- [ ] CORS configuration sudah update dengan production URL
- [ ] `NODE_ENV=production` sudah di-set
- [ ] Backend build berhasil (`npm run build`)
- [ ] Frontend build berhasil (`npm run build`)

---

## 🧪 Testing Setelah Deploy

1. **Test Database Connection:**
   - Login ke aplikasi
   - Cek apakah data bisa di-load

2. **Test AI Chatbot:**
   - Submit quiz dengan jawaban salah
   - Cek apakah AI chatbot bisa respond

3. **Test File Upload:**
   - Upload jobsheet PDF
   - Upload assignment PDF
   - Cek apakah file tersimpan di Supabase Storage

4. **Test API Endpoints:**
   - Cek health endpoint: `https://your-backend.railway.app/health`
   - Test beberapa API endpoints

---

## 🐛 Troubleshooting

### **Error: "Failed to connect to database"**
- Cek `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` sudah benar
- Cek apakah Supabase project masih aktif

### **Error: "Failed to generate AI response"**
- Cek `GEMINI_API_KEY` sudah benar
- Cek apakah API key masih valid dan tidak exceed quota

### **Error: "CORS policy blocked"**
- Update `FRONTEND_URL` di backend environment variables dengan URL production
- Pastikan URL frontend sudah benar (dengan `https://`)

### **Error: "File upload failed"**
- Cek Supabase Storage buckets sudah dibuat
- Cek RLS policies untuk storage buckets
- Cek `MAX_FILE_SIZE` sudah sesuai

---

## 📚 Resources

- [Vercel Deployment Guide](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase Production Best Practices](https://supabase.com/docs/guides/platform/going-into-prod)

---

## 💡 Rekomendasi

**Untuk project ini, saya recommend:**

1. **Vercel untuk Frontend + Backend (Next.js API Routes)**
   - ✅ Gratis untuk personal projects
   - ✅ Optimal untuk Next.js
   - ✅ Auto-deploy dari GitHub
   - ✅ Built-in CI/CD

2. **Railway untuk Backend (jika tidak ingin migrate)**
   - ✅ Mudah setup
   - ✅ Auto-deploy dari GitHub
   - ✅ Free tier cukup untuk development

**Pilihan terbaik: Migrate backend ke Next.js API Routes dan deploy semua ke Vercel!**
