# Vercel Deployment Checklist - Memastikan Localhost = Vercel

## 📋 Analisis Project Structure

### Localhost (Development)
```
LMS/
├── backend/          # Express server (port 3001)
│   ├── src/
│   └── package.json
├── frontend/         # Next.js app (port 3000)
│   ├── src/
│   └── package.json
└── package.json      # Root scripts
```

**Alur Localhost:**
1. Backend: `cd backend && npm run dev` → `http://localhost:3001`
2. Frontend: `cd frontend && npm run dev` → `http://localhost:3000`
3. Frontend → Backend: `http://localhost:3001/api/*`

### Vercel (Production)
```
LMS/
├── api/              # Serverless function (Vercel)
│   ├── index.ts      # Entry point
│   ├── _src/         # Backend source (ignored by Vercel)
│   └── package.json
├── frontend/         # Next.js app (Root Directory)
│   ├── src/
│   └── package.json
└── vercel.json       # Vercel configuration
```

**Alur Vercel:**
1. Frontend: Build dari `frontend/` → Output: `.next/`
2. Backend: Serverless function di `api/index.ts` → `/api/*`
3. Frontend → Backend: Relative path `/api/*` (same domain)

---

## ✅ Checklist: Memastikan Semua Berfungsi

### 1. Vercel Configuration (`vercel.json`)

**Root Directory = `frontend`** (di Vercel Dashboard)

```json
{
  "buildCommand": "npm run build",           // ✅ Dari frontend/
  "outputDirectory": ".next",                // ✅ Di frontend/
  "installCommand": "cd .. && npm install --prefix api && cd frontend && npm install --include=dev",
  "functions": {
    "../api/index.ts": {                     // ✅ Relatif dari frontend/
      "includeFiles": "../api/_src/**"
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/index.ts"        // ✅ Serverless function
    }
  ]
}
```

### 2. Environment Variables (Vercel Dashboard)

**Frontend (Next.js):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (optional, default: empty string = same domain)

**Backend (Serverless Function):**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `FRONTEND_URL` (e.g., `https://fliplearning.vercel.app`)
- `NODE_ENV=production`

### 3. API Client Configuration (`frontend/src/lib/api.ts`)

```typescript
// ✅ Production: Empty string = same domain (Vercel)
// ✅ Development: http://localhost:3001
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001');

// ✅ baseURL akan menjadi:
// Production: '/api' (same domain)
// Development: 'http://localhost:3001/api'
```

### 4. Backend CORS Configuration (`api/_src/index.ts`)

```typescript
// ✅ Harus include Vercel domain
const allowedOrigins = [
  process.env.FRONTEND_URL,              // https://fliplearning.vercel.app
  'http://localhost:3000',               // Development
  'https://fliplearning.vercel.app',     // Production
  'https://*.vercel.app'                 // Preview deployments
].filter(Boolean);
```

### 5. Entry Points

**Frontend:**
- ✅ `frontend/src/app/page.tsx` (Home page)
- ✅ `frontend/src/app/layout.tsx` (Root layout)

**Backend:**
- ✅ `api/index.ts` (Serverless function entry)
- ✅ `api/_src/index.ts` (Express app)

---

## 🔧 Perbaikan yang Sudah Dilakukan

1. ✅ `vercel.json` di root dengan path yang benar untuk Root Directory = `frontend`
2. ✅ `buildCommand`: `npm run build` (tanpa `cd frontend`)
3. ✅ `outputDirectory`: `.next` (bukan `frontend/.next`)
4. ✅ `functions` path: `../api/index.ts` (relatif dari `frontend/`)
5. ✅ `installCommand`: Install api dan frontend dependencies dengan benar
6. ✅ API client menggunakan relative path di production
7. ✅ CORS configuration support Vercel domains

---

## 🚨 Masalah yang Mungkin Terjadi

### 1. Build Error: `cd: frontend: No such file or directory`
**Penyebab:** `buildCommand` masih menggunakan `cd frontend && npm run build`
**Solusi:** Pastikan `buildCommand` = `npm run build` (karena Root Directory = `frontend`)

### 2. 404 pada `/api/*`
**Penyebab:** 
- Path `functions` salah
- `rewrites` tidak bekerja
**Solusi:** 
- Pastikan `functions` path = `../api/index.ts`
- Pastikan `rewrites` destination = `/api/index.ts`

### 3. CORS Error
**Penyebab:** `FRONTEND_URL` tidak di-set atau salah
**Solusi:** Set `FRONTEND_URL` = `https://fliplearning.vercel.app` di Vercel Dashboard

### 4. Environment Variables Missing
**Penyebab:** Environment variables tidak di-set di Vercel Dashboard
**Solusi:** Set semua required environment variables

---

## 📝 Testing Checklist

### Setelah Deploy ke Vercel:

1. ✅ Home page (`/`) → Tidak 404
2. ✅ Login page (`/login`) → Bisa akses
3. ✅ API health check (`/api/health`) → Return `{ status: 'ok' }`
4. ✅ Authentication (`/api/auth/me`) → Bisa akses dengan token
5. ✅ Supabase connection → Bisa query database
6. ✅ File uploads → Bisa upload ke Supabase Storage
7. ✅ AI Chatbot → Bisa generate response dari Gemini

---

## 🎯 Final Configuration

**Vercel Dashboard Settings:**
- Root Directory: `frontend`
- Framework Preset: `Next.js` (atau `Other`)
- Build Command: (kosong, dari `vercel.json`)
- Output Directory: (kosong, dari `vercel.json`)
- Install Command: (kosong, dari `vercel.json`)

**Environment Variables:**
- Semua variables harus di-set di Vercel Dashboard
- Jangan hardcode di code
- Gunakan `NEXT_PUBLIC_` prefix untuk client-side variables

---

## ✅ Status: Siap Deploy

Semua konfigurasi sudah benar. Pastikan:
1. Root Directory = `frontend` di Vercel Dashboard
2. Semua environment variables sudah di-set
3. Build logs menunjukkan success
4. Test semua endpoints setelah deploy
