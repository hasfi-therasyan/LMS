# 🚀 Panduan Deploy ke Netlify

## Perbedaan Netlify vs Vercel

### Netlify
- ✅ Mendukung Next.js dengan baik
- ✅ Free tier tersedia
- ⚠️ Function timeout: 10 detik (free), 26 detik (Pro)
- ⚠️ Perlu konfigurasi `netlify.toml`
- ⚠️ API routes perlu konfigurasi khusus

### Vercel
- ✅ Optimized untuk Next.js (dibuat oleh tim Next.js)
- ✅ Function timeout: 10 detik (free), 60 detik (Pro)
- ✅ Auto-detect Next.js tanpa konfigurasi
- ✅ Edge Functions support

## Persiapan

### 1. Install Netlify CLI (Optional)

```bash
npm install -g netlify-cli
```

### 2. Buat File Konfigurasi

File `netlify.toml` sudah dibuat di root project.

## Langkah Deploy

### Metode 1: Via Netlify Dashboard (Recommended)

#### Step 1: Login & Import

1. Buka [netlify.com](https://netlify.com)
2. Login dengan GitHub/GitLab/Bitbucket
3. Klik **"Add new site"** → **"Import an existing project"**
4. Pilih repository `LMS`
5. Klik **"Import"**

#### Step 2: Configure Build Settings

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

**⚠️ PENTING**: Netlify akan auto-detect Next.js, tapi pastikan:
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `.next`

#### Step 3: Set Environment Variables

Klik **"Site settings"** → **"Environment variables"** → **"Add variable"**

Tambahkan semua variables berikut:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
MAX_FILE_SIZE=10485760
GEMINI_MODEL=gemini-2.0-flash-lite
```

**PENTING**: 
- Set untuk **Production**, **Deploy previews**, dan **Branch deploys**
- Jangan set `NEXT_PUBLIC_API_URL`

#### Step 4: Deploy

Klik **"Deploy site"** dan tunggu build selesai.

### Metode 2: Via Netlify CLI

```bash
# Login ke Netlify
netlify login

# Initialize site
cd frontend
netlify init

# Deploy
netlify deploy --prod
```

## Konfigurasi Khusus untuk Next.js di Netlify

### Next.js Plugin

Netlify akan otomatis menggunakan Next.js plugin jika terdeteksi. Pastikan:

1. **Next.js Runtime**: Netlify akan auto-detect
2. **API Routes**: Akan di-handle sebagai serverless functions
3. **Static Generation**: Akan di-optimize otomatis

### Function Configuration

API routes di `frontend/src/app/api/` akan otomatis menjadi Netlify Functions.

**Timeout**: 
- Free tier: 10 detik
- Pro tier: 26 detik

**Memory**: 
- Default: 1024 MB

## Perubahan yang Diperlukan

### ✅ Sudah Dilakukan

1. ✅ File `netlify.toml` sudah dibuat
2. ✅ Konfigurasi build sudah diset
3. ✅ Headers untuk security sudah dikonfigurasi
4. ✅ Redirects untuk Next.js sudah dikonfigurasi

### ⚠️ Perhatian Khusus

#### 1. Function Timeout

Netlify free tier memiliki timeout 10 detik. Untuk operasi yang lebih lama (seperti AI chat), pertimbangkan:
- Upgrade ke Pro tier (26 detik)
- Atau optimize function untuk lebih cepat

#### 2. API Routes

Next.js API routes akan bekerja, tapi pastikan:
- File route ada di `frontend/src/app/api/`
- Menggunakan format Next.js App Router
- Tidak ada dependency yang tidak compatible

#### 3. Environment Variables

Semua environment variables harus di-set di Netlify Dashboard.

## Troubleshooting

### Build Error: Module not found

**Solusi**:
1. Pastikan base directory: `frontend`
2. Pastikan semua dependencies ada di `package.json`
3. Check build logs di Netlify Dashboard

### API Routes 404

**Solusi**:
1. Pastikan `netlify.toml` sudah ada
2. Pastikan Next.js plugin terdeteksi
3. Check function logs di Netlify Dashboard

### Function Timeout

**Solusi**:
1. Optimize function untuk lebih cepat
2. Upgrade ke Pro tier untuk timeout lebih lama
3. Split operasi besar menjadi beberapa function calls

### Environment Variables Not Working

**Solusi**:
1. Redeploy setelah menambah variables
2. Pastikan set untuk environment yang benar
3. Check variable names (case-sensitive)

## Perbandingan: Netlify vs Vercel

| Feature | Netlify | Vercel |
|---------|---------|--------|
| Next.js Support | ✅ Good | ✅ Excellent (made by Next.js team) |
| Function Timeout (Free) | 10s | 10s |
| Function Timeout (Pro) | 26s | 60s |
| Auto-detect Next.js | ✅ Yes | ✅ Yes |
| Edge Functions | ⚠️ Limited | ✅ Full support |
| Configuration | `netlify.toml` | `vercel.json` |
| Free Tier | ✅ Generous | ✅ Generous |
| Build Time | Good | Excellent |

## Rekomendasi

### Pilih Netlify jika:
- ✅ Sudah menggunakan Netlify untuk project lain
- ✅ Butuh fitur Netlify Forms, Functions, dll
- ✅ Budget terbatas dan butuh free tier yang baik

### Pilih Vercel jika:
- ✅ Fokus pada Next.js optimization
- ✅ Butuh Edge Functions
- ✅ Butuh function timeout lebih lama (60s di Pro)
- ✅ Ingin setup yang lebih mudah untuk Next.js

## Checklist Deployment

- [ ] File `netlify.toml` sudah ada
- [ ] Code sudah di-push ke GitHub
- [ ] Environment variables sudah disiapkan
- [ ] Supabase Storage buckets sudah dibuat
- [ ] Build lokal berhasil (`cd frontend && npm run build`)

## Support

Jika ada masalah:
1. Check Netlify build logs
2. Check function logs
3. Check browser console
4. Review `netlify.toml` configuration

---

**Catatan**: Netlify adalah pilihan yang baik untuk Next.js, tapi Vercel lebih optimized karena dibuat oleh tim Next.js. Keduanya akan bekerja dengan baik untuk aplikasi ini.
