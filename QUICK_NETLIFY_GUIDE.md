# ⚡ Quick Deploy Guide - Netlify

Panduan cepat untuk deploy aplikasi LMS ke Netlify.

## 🚀 Langkah Cepat (5 Menit)

### 1. Commit & Push Code

```bash
git add netlify.toml
git commit -m "Add Netlify configuration"
git push origin main
```

### 2. Login & Import ke Netlify

1. Buka [netlify.com](https://netlify.com)
2. Login dengan GitHub
3. Klik **"Add new site"** → **"Import an existing project"**
4. Pilih repository `LMS`
5. Klik **"Import"**

### 3. Configure Build Settings

**Base directory**: 
```
frontend
```

**Build command**: 
```
npm run build
```

**Publish directory**: 
```
.next
```

**⚠️ PENTING**: Netlify akan auto-detect Next.js, pastikan:
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `.next`

### 4. Set Environment Variables

Klik **"Site settings"** → **"Environment variables"** → **"Add variable"**

Tambahkan semua variables berikut untuk **Production**, **Deploy previews**, dan **Branch deploys**:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
MAX_FILE_SIZE=10485760
GEMINI_MODEL=gemini-2.0-flash-lite
```

**PENTING**: 
- Set untuk semua environments
- Jangan set `NEXT_PUBLIC_API_URL`

### 5. Deploy

Klik **"Deploy site"** dan tunggu build selesai.

### 6. Test

Setelah deploy selesai, test:
- `https://your-app.netlify.app` - Frontend
- `https://your-app.netlify.app/api/auth/me` - API

## ⚠️ Perbedaan dengan Vercel

### Function Timeout

- **Netlify Free**: 10 detik
- **Netlify Pro**: 26 detik
- **Vercel Free**: 10 detik
- **Vercel Pro**: 60 detik

**Impact**: AI chat function mungkin perlu di-optimize atau upgrade ke Pro tier jika timeout.

### Konfigurasi

- **Netlify**: Perlu file `netlify.toml` (sudah dibuat)
- **Vercel**: Auto-detect, `vercel.json` optional

## 📋 Checklist

- [ ] File `netlify.toml` sudah ada di root
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

## 🐛 Troubleshooting

### Build Error

**Error**: Module not found
**Solusi**: Pastikan base directory: `frontend`

### API 404

**Error**: API routes tidak ditemukan
**Solusi**: 
- Pastikan `netlify.toml` ada di root
- Pastikan Next.js plugin terdeteksi
- Check function logs

### Function Timeout

**Error**: Function timeout
**Solusi**: 
- Optimize function
- Upgrade ke Pro tier (26s timeout)
- Split operasi besar

## 📚 Dokumentasi Lengkap

Lihat `NETLIFY_DEPLOYMENT_GUIDE.md` untuk panduan detail.

---

**Catatan**: Netlify adalah pilihan yang baik, tapi Vercel lebih optimal untuk Next.js. Lihat `NETLIFY_VS_VERCEL.md` untuk perbandingan lengkap.
