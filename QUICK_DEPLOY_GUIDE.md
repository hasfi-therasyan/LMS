# ⚡ Quick Deploy Guide - Vercel

Panduan cepat untuk deploy aplikasi LMS ke Vercel.

## 🚀 Langkah Cepat (5 Menit)

### 1. Commit & Push Code

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Login & Import ke Vercel

1. Buka [vercel.com](https://vercel.com)
2. Login dengan GitHub
3. Klik **"Add New..."** → **"Project"**
4. Pilih repository `LMS`
5. Klik **"Import"**

### 3. Configure Project

**Root Directory**: 
```
frontend
```

**Framework**: Next.js (auto-detect)

**Build Command**: `npm run build` (default)

**Output Directory**: `.next` (default)

### 4. Set Environment Variables

Klik **"Environment Variables"** dan tambahkan:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

**PENTING**: 
- Set untuk **Production**, **Preview**, dan **Development**
- Jangan set `NEXT_PUBLIC_API_URL`

### 5. Deploy

Klik **"Deploy"** dan tunggu build selesai.

### 6. Test

Setelah deploy selesai, test:
- `https://your-app.vercel.app` - Frontend
- `https://your-app.vercel.app/api/auth/me` - API

## 📋 Checklist Sebelum Deploy

- [ ] Code sudah di-push ke GitHub
- [ ] Build lokal berhasil (`cd frontend && npm run build`)
- [ ] Environment variables sudah disiapkan
- [ ] Supabase Storage buckets sudah dibuat

## 🔧 Supabase Storage Buckets

Pastikan buckets ini sudah dibuat di Supabase Dashboard:

1. `modules` (Public)
2. `jobsheets` (Public)
3. `jobsheet-submissions` (Public)
4. `jobsheet-assignments` (Public)
5. `jobsheet-assignments-2` (Public)
6. `jobsheet-assignments-3` (Public)
7. `jobsheet-assignments-4` (Public)

**Cara membuat bucket:**
1. Buka Supabase Dashboard
2. Storage → New Bucket
3. Nama: `modules` (atau nama bucket lainnya)
4. Public: ✅ Enabled
5. Create

## 🐛 Troubleshooting

### Build Error

**Error**: Module not found
**Solusi**: Pastikan semua dependencies ada di `package.json`

### API 404

**Error**: API routes tidak ditemukan
**Solusi**: 
- Pastikan root directory: `frontend`
- Pastikan file route ada di `frontend/src/app/api/`

### Environment Variables

**Error**: Variables tidak bekerja
**Solusi**: 
- Redeploy setelah menambah variables
- Pastikan set untuk environment yang benar

## 📚 Dokumentasi Lengkap

Lihat `VERCEL_DEPLOYMENT_STEPS.md` untuk panduan detail.

---

**Selamat Deploy! 🎉**
