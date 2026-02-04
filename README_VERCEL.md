# 🚀 LMS System - Vercel Deployment Ready

Aplikasi LMS ini telah di-redesign untuk kompatibel dengan Vercel menggunakan Next.js API Routes (serverless functions).

## ✨ Fitur

- ✅ Frontend: Next.js 14+ dengan App Router
- ✅ Backend: Next.js API Routes (serverless functions)
- ✅ Database: Supabase (PostgreSQL)
- ✅ Authentication: Supabase Auth
- ✅ AI Chatbot: Google Gemini API
- ✅ File Storage: Supabase Storage

## 📁 Struktur Proyek

```
frontend/
  src/
    app/
      api/              # Next.js API Routes (serverless)
        auth/
        modules/
        quizzes/
        ...
    lib/
      api/
        config/         # Config files (Supabase, Gemini)
        middleware/     # Auth helpers
        utils/          # Utilities (PDF, file upload)
    components/         # React components
    ...
```

## 🛠️ Setup Lokal

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Setup environment variables**:
   Buat file `.env.local` di folder `frontend/`:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_ANON_KEY=your_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   MAX_FILE_SIZE=10485760
   GEMINI_MODEL=gemini-2.0-flash-lite
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Test API routes**:
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api/auth/me

## 🚀 Deploy ke Vercel

### 1. Persiapan

- Pastikan semua code sudah di-commit ke GitHub
- Pastikan semua dependencies sudah di `package.json`

### 2. Deploy via Vercel Dashboard

1. Login ke [Vercel](https://vercel.com)
2. Klik "New Project"
3. Import repository dari GitHub
4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detect)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### 3. Environment Variables

Di Vercel Dashboard → Settings → Environment Variables, tambahkan:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_api_key
MAX_FILE_SIZE=10485760
GEMINI_MODEL=gemini-2.0-flash-lite
```

**Penting**: 
- Set untuk semua environments (Production, Preview, Development)
- Jangan commit `.env` files ke GitHub

### 4. Deploy

Klik "Deploy" dan tunggu proses build selesai.

### 5. Verify

Setelah deploy selesai:
- Test API: `https://your-app.vercel.app/api/auth/me`
- Test frontend: `https://your-app.vercel.app`

## 📋 API Routes yang Tersedia

### Auth
- `GET /api/auth/me` - Get current user
- `POST /api/auth/signup` - Sign up student
- `POST /api/auth/create-admin` - Create admin

### Modules
- `GET /api/modules` - Get all modules
- `POST /api/modules` - Upload module
- `GET /api/modules/:id` - Get module

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create quiz
- `GET /api/quizzes/:id` - Get quiz
- `POST /api/quizzes/:id/submit` - Submit quiz
- `DELETE /api/quizzes/:id` - Delete quiz

### Admin
- `GET /api/admin/users` - Get all users

### Routes yang Masih Perlu Dibuat

Lihat `VERCEL_MIGRATION_GUIDE.md` untuk daftar lengkap routes yang masih perlu dikonversi.

## 🔧 Configuration

### vercel.json

File `vercel.json` sudah dikonfigurasi:
- Framework: Next.js
- Functions: Max duration 30s, Memory 1024MB
- Headers: Security headers

### next.config.js

File `next.config.js` sudah dikonfigurasi untuk:
- Supabase image domains
- Path aliases (`@/`)

## 📝 Catatan Penting

1. **File Upload**: Menggunakan `FormData`, bukan `multer`
2. **Authentication**: Token dari `Authorization: Bearer <token>` header
3. **Error Handling**: Menggunakan helper functions
4. **Type Safety**: Semua routes menggunakan TypeScript

## 🐛 Troubleshooting

### Build Error

Jika ada build error:
1. Check environment variables di Vercel
2. Check `package.json` dependencies
3. Check TypeScript errors: `npm run build`

### API Route Not Found

1. Pastikan file route ada di `frontend/src/app/api/`
2. Pastikan menggunakan format Next.js App Router
3. Check Vercel function logs

### File Upload Error

1. Check Supabase Storage buckets sudah dibuat
2. Check file size tidak melebihi limit
3. Check file type (hanya PDF)

## 📚 Dokumentasi

- `VERCEL_MIGRATION_GUIDE.md` - Panduan migrasi lengkap
- `VERCEL_SETUP_SUMMARY.md` - Ringkasan setup
- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs

## 🎯 Next Steps

1. ✅ Struktur sudah siap
2. ✅ Config files sudah dibuat
3. ✅ Beberapa routes sudah dibuat
4. ⏳ Buat routes yang masih missing (lihat `VERCEL_MIGRATION_GUIDE.md`)
5. ⏳ Test semua endpoints
6. ⏳ Deploy ke production

## 💡 Tips

- Gunakan Vercel Preview Deployments untuk testing
- Monitor logs di Vercel Dashboard
- Set up error tracking (Sentry, dll)
- Monitor API usage dan costs

---

**Status**: ✅ Siap untuk deploy ke Vercel (beberapa routes masih perlu dibuat)
