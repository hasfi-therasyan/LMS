# 🚀 Panduan Deploy Full Stack ke Vercel

Panduan lengkap untuk deploy frontend + backend ke Vercel dalam satu project.

## ✅ Keuntungan Deploy Full Stack di Vercel

- ✅ **Satu Platform**: Frontend dan backend di satu tempat
- ✅ **Gratis**: Free tier cukup untuk development
- ✅ **Auto-Deploy**: Auto-deploy dari GitHub
- ✅ **Serverless**: Backend sebagai serverless functions (scalable)
- ✅ **Optimal**: Next.js native support di Vercel

---

## 📋 Prasyarat

1. ✅ Akun GitHub (sudah ada)
2. ✅ Akun Vercel (buat di https://vercel.com)
3. ✅ Supabase project sudah setup
4. ✅ Gemini API key sudah ada

---

## 🚀 Step-by-Step Deployment

### **Step 1: Persiapkan Repository**

Pastikan semua file konfigurasi sudah ada:
- ✅ `vercel.json` (root directory)
- ✅ `api/index.ts` (Vercel serverless function wrapper)
- ✅ `backend/src/index.ts` (sudah di-modify untuk export app)
- ✅ `frontend/next.config.js` (sudah di-update)

### **Step 2: Deploy ke Vercel**

1. **Sign up di Vercel:**
   - Buka https://vercel.com
   - Login dengan GitHub

2. **Import Project:**
   - Klik "Add New..." → "Project"
   - Pilih repository `LMS`
   - Vercel akan auto-detect konfigurasi

3. **Configure Project:**
   - **Framework Preset:** Other (karena kita pakai custom setup)
   - **Root Directory:** `.` (root)
   - **Build Command:** (biarkan kosong, Vercel akan auto-detect)
   - **Output Directory:** (biarkan kosong)
   - **Install Command:** `npm install` (untuk root, frontend, dan backend)

4. **Set Environment Variables:**
   
   Di Vercel Dashboard → Project → Settings → Environment Variables, tambahkan:
   
   ```env
   # Supabase
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   
   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   
   # Server Configuration
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   MAX_FILE_SIZE=10485760
   
   # API URL (untuk development, production akan pakai relative path)
   NEXT_PUBLIC_API_URL=
   ```
   
   **Catatan:** 
   - `NEXT_PUBLIC_API_URL` bisa dikosongkan karena di production akan pakai relative path `/api`
   - `FRONTEND_URL` akan otomatis terisi setelah deploy

5. **Deploy:**
   - Klik "Deploy"
   - Tunggu build selesai (sekitar 3-7 menit)
   - Vercel akan generate URL seperti: `https://your-app.vercel.app`

---

## 🔧 Konfigurasi yang Sudah Dibuat

### **1. `vercel.json` (Root)**
- Routing untuk API (`/api/*` → `api/index.ts`)
- Routing untuk Frontend (`/*` → `frontend/*`)

### **2. `api/index.ts`**
- Wrapper untuk Express app sebagai Vercel serverless function
- Set `VERCEL=1` environment variable

### **3. `backend/src/index.ts`**
- Modified untuk export Express app
- Conditional server start (hanya di development)

### **4. `frontend/src/lib/api.ts`**
- Auto-detect production vs development
- Production: relative path `/api`
- Development: `http://localhost:3001`

---

## ✅ Checklist Environment Variables

### **Vercel (Full Stack)**

```env
# Supabase (Backend)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Supabase (Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
MAX_FILE_SIZE=10485760

# API URL (optional, bisa dikosongkan)
NEXT_PUBLIC_API_URL=
```

---

## 🧪 Testing Setelah Deploy

1. **Test Frontend:**
   - Buka `https://your-app.vercel.app`
   - Cek apakah halaman load dengan benar

2. **Test Backend API:**
   - Buka `https://your-app.vercel.app/api/health`
   - Harus return: `{"status":"ok","timestamp":"..."}`

3. **Test Login:**
   - Buka `https://your-app.vercel.app/login`
   - Coba login dengan akun yang sudah ada

4. **Test Database:**
   - Setelah login, cek apakah data ter-load
   - Cek apakah jobsheets, quizzes, dll muncul

5. **Test AI Chatbot:**
   - Submit quiz dengan jawaban salah
   - Cek apakah AI chatbot bisa respond

6. **Test File Upload:**
   - Upload jobsheet PDF
   - Upload assignment PDF
   - Cek apakah file tersimpan

---

## 🐛 Troubleshooting

### **Error: "Module not found"**
- Pastikan semua dependencies ter-install
- Cek `package.json` di root, frontend, dan backend

### **Error: "Cannot find module '../backend/src/index'"**
- Pastikan path di `api/index.ts` benar
- Pastikan `backend/src/index.ts` export app dengan benar

### **Error: "API route not found"**
- Cek `vercel.json` routing configuration
- Pastikan routes di `vercel.json` benar

### **Error: "Failed to connect to database"**
- Cek environment variables di Vercel
- Pastikan `SUPABASE_URL` dan keys sudah benar

### **Error: "CORS policy blocked"**
- Cek `FRONTEND_URL` di environment variables
- Pastikan URL sudah benar (dengan `https://`)

### **Build Error: "TypeScript errors"**
- Cek TypeScript configuration
- Pastikan semua types sudah benar

---

## 📚 Struktur File untuk Vercel

```
LMS/
├── vercel.json              # Vercel configuration
├── api/
│   └── index.ts            # Serverless function wrapper
├── backend/
│   ├── src/
│   │   └── index.ts        # Express app (exported)
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
└── package.json            # Root package.json (optional)
```

---

## 💡 Tips

1. **Monitor Logs:**
   - Vercel Dashboard → Project → Logs
   - Cek function logs untuk debugging

2. **Environment Variables:**
   - Set untuk Production, Preview, dan Development
   - Gunakan Vercel dashboard untuk manage

3. **Auto-Deploy:**
   - Setiap push ke `main` branch akan auto-deploy
   - Preview deployments untuk pull requests

4. **Custom Domain:**
   - Settings → Domains
   - Add custom domain jika perlu

---

## 🎉 Selesai!

Setelah semua step selesai, aplikasi Anda akan live di:
- **Frontend + Backend:** `https://your-app.vercel.app`
- **API Health Check:** `https://your-app.vercel.app/api/health`

Selamat! 🎊
