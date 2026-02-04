# 🚀 Panduan Deploy ke Vercel

## Prerequisites

1. ✅ Code sudah di-commit ke GitHub/GitLab/Bitbucket
2. ✅ Semua dependencies sudah terinstall
3. ✅ Aplikasi bisa build lokal tanpa error

## Langkah 1: Persiapan Repository

### 1.1 Pastikan semua file sudah di-commit

```bash
git status
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### 1.2 Pastikan struktur folder benar

```
LMS/
├── frontend/          # Root untuk Vercel
│   ├── src/
│   ├── package.json
│   ├── next.config.js
│   └── ...
├── backend/           # Tidak digunakan di Vercel
└── ...
```

## Langkah 2: Setup Vercel Project

### 2.1 Login ke Vercel

1. Buka [vercel.com](https://vercel.com)
2. Login dengan GitHub/GitLab/Bitbucket
3. Klik **"Add New..."** → **"Project"**

### 2.2 Import Repository

1. Pilih repository `LMS` dari daftar
2. Klik **"Import"**

### 2.3 Configure Project

**Framework Preset**: Next.js (auto-detect)

**Root Directory**: 
```
frontend
```

**Build Command**: 
```
npm run build
```
(Default, biasanya auto-detect)

**Output Directory**: 
```
.next
```
(Default, biasanya auto-detect)

**Install Command**: 
```
npm install
```
(Default)

**Klik "Deploy"** (jangan dulu, kita perlu set environment variables dulu)

## Langkah 3: Set Environment Variables

### 3.1 Buka Project Settings

Setelah project dibuat, klik **"Settings"** → **"Environment Variables"**

### 3.2 Tambahkan Environment Variables

Tambahkan semua variables berikut untuk **Production**, **Preview**, dan **Development**:

#### Required Variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

#### Optional Variables:

```env
MAX_FILE_SIZE=10485760
GEMINI_MODEL=gemini-2.0-flash-lite
```

### 3.3 Cara Menambahkan:

1. Klik **"Add New"**
2. Masukkan **Name** (contoh: `SUPABASE_URL`)
3. Masukkan **Value** (contoh: `https://xxx.supabase.co`)
4. Pilih environments: ✅ Production, ✅ Preview, ✅ Development
5. Klik **"Save"**
6. Ulangi untuk semua variables

### 3.4 Catatan Penting:

- **JANGAN** set `NEXT_PUBLIC_API_URL` - biarkan kosong
- `SUPABASE_SERVICE_ROLE_KEY` harus dirahasiakan (jangan commit ke git)
- `GEMINI_API_KEY` harus dirahasiakan
- Semua variables dengan prefix `NEXT_PUBLIC_` akan exposed ke browser

## Langkah 4: Deploy

### 4.1 Deploy Manual

1. Kembali ke **"Deployments"** tab
2. Klik **"Redeploy"** pada deployment terakhir
3. Atau buat deployment baru dengan klik **"Deploy"**

### 4.2 Deploy via Git Push

Setelah setup pertama, setiap push ke branch `main` akan otomatis trigger deployment:

```bash
git push origin main
```

## Langkah 5: Verifikasi Deployment

### 5.1 Check Build Logs

1. Buka deployment di Vercel Dashboard
2. Klik pada deployment untuk melihat logs
3. Pastikan build berhasil tanpa error

### 5.2 Test API Routes

Setelah deploy selesai, test beberapa endpoints:

```
https://your-app.vercel.app/api/auth/me
https://your-app.vercel.app/api/modules
https://your-app.vercel.app/api/quizzes
```

### 5.3 Test Frontend

1. Buka URL production: `https://your-app.vercel.app`
2. Test login
3. Test fitur-fitur utama

## Langkah 6: Setup Custom Domain (Optional)

### 6.1 Add Domain

1. Buka **"Settings"** → **"Domains"**
2. Klik **"Add"**
3. Masukkan domain Anda (contoh: `lms.yourdomain.com`)
4. Follow instruksi untuk setup DNS

### 6.2 DNS Configuration

Tambahkan CNAME record di DNS provider:
```
Type: CNAME
Name: lms (atau @ untuk root domain)
Value: cname.vercel-dns.com
```

## Troubleshooting

### Build Error: Module not found

**Solusi:**
1. Pastikan `package.json` memiliki semua dependencies
2. Check build logs untuk detail error
3. Pastikan root directory benar (`frontend`)

### API Routes 404

**Solusi:**
1. Pastikan file route ada di `frontend/src/app/api/`
2. Check file naming (harus `route.ts` atau `route.js`)
3. Restart deployment

### Environment Variables Not Working

**Solusi:**
1. Pastikan variables di-set untuk environment yang benar
2. Redeploy setelah menambah variables baru
3. Variables dengan `NEXT_PUBLIC_` prefix akan exposed ke browser

### File Upload Error

**Solusi:**
1. Check Supabase Storage buckets sudah dibuat:
   - `modules`
   - `jobsheets`
   - `jobsheet-submissions`
   - `jobsheet-assignments`
   - `jobsheet-assignments-2`
   - `jobsheet-assignments-3`
   - `jobsheet-assignments-4`
2. Pastikan buckets set to **Public**
3. Check `MAX_FILE_SIZE` environment variable

### Database Connection Error

**Solusi:**
1. Verify `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` benar
2. Check Supabase project masih aktif
3. Verify network access di Supabase Dashboard

## Monitoring & Logs

### View Logs

1. Buka **"Deployments"** tab
2. Klik pada deployment
3. Klik **"Functions"** untuk melihat serverless function logs
4. Klik pada function untuk melihat real-time logs

### Performance Monitoring

1. Buka **"Analytics"** tab
2. Monitor:
   - Page views
   - Function invocations
   - Response times
   - Error rates

## Best Practices

1. **Environment Variables**
   - Jangan commit `.env` files
   - Gunakan Vercel Environment Variables
   - Set different values untuk Production/Preview/Development

2. **Build Optimization**
   - Monitor build times
   - Optimize bundle size
   - Use Next.js Image optimization

3. **Security**
   - Jangan expose service keys ke frontend
   - Use RLS policies di Supabase
   - Enable CORS properly

4. **Performance**
   - Monitor function execution time
   - Optimize database queries
   - Use caching where appropriate

## Checklist Sebelum Deploy

- [ ] Code sudah di-commit dan push ke repository
- [ ] Build lokal berhasil (`npm run build`)
- [ ] Semua environment variables sudah disiapkan
- [ ] Supabase Storage buckets sudah dibuat
- [ ] Test API routes lokal berhasil
- [ ] Test file upload lokal berhasil
- [ ] Database schema sudah di-setup di Supabase
- [ ] RLS policies sudah dikonfigurasi

## Support

Jika ada masalah:
1. Check Vercel logs
2. Check Supabase logs
3. Check browser console untuk client-side errors
4. Review build logs di Vercel Dashboard

---

**Selamat! Aplikasi Anda sekarang live di Vercel! 🎉**
