# 🔧 Perbaikan Environment Variables di Netlify

## Masalah: ERR_NAME_NOT_RESOLVED untuk Supabase

Jika Anda melihat error seperti:
```
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
ngxlniymmmmkijefhjbm.supabase/auth/v1/token
```

Ini berarti `NEXT_PUBLIC_SUPABASE_URL` di Netlify tidak lengkap atau salah format.

## Solusi

### 1. Buka Netlify Dashboard

1. Login ke [app.netlify.com](https://app.netlify.com)
2. Pilih site Anda (`fliplearning`)
3. Klik **Site settings** → **Environment variables**

### 2. Periksa dan Perbaiki Environment Variables

Pastikan Anda memiliki environment variables berikut dengan format yang benar:

#### ✅ Format yang BENAR:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ngxlniymmmmkijefhjbm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://ngxlniymmmmkijefhjbm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=your-gemini-api-key
MAX_FILE_SIZE=10485760
```

#### ❌ Format yang SALAH:

```env
# Jangan gunakan format ini:
NEXT_PUBLIC_SUPABASE_URL=ngxlniymmmmkijefhjbm
NEXT_PUBLIC_SUPABASE_URL=ngxlniymmmmkijefhjbm.supabase
NEXT_PUBLIC_SUPABASE_URL=https://ngxlniymmmmkijefhjbm
```

### 3. Cara Mendapatkan Supabase URL yang Benar

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Klik **Settings** → **API**
4. Copy **Project URL** (bukan Project ID)
   - Format: `https://xxxxx.supabase.co` atau `https://xxxxx.supabase.in`

### 4. Update Environment Variables

1. Di Netlify, cari variable `NEXT_PUBLIC_SUPABASE_URL`
2. Klik **Edit**
3. Pastikan value-nya adalah **FULL URL** dengan `https://` dan domain
4. Klik **Save**
5. Ulangi untuk semua environment variables yang diperlukan

### 5. Trigger New Deployment

Setelah memperbaiki environment variables:

1. Klik **Deploys** di sidebar
2. Klik **Trigger deploy** → **Deploy site**
3. Atau push commit baru ke GitHub (akan auto-deploy)

### 6. Verifikasi

Setelah deployment selesai, coba login lagi. Error `ERR_NAME_NOT_RESOLVED` seharusnya sudah hilang.

## Checklist Environment Variables

Pastikan semua ini sudah di-set di Netlify:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Full URL dengan https://
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key dari Supabase
- [ ] `SUPABASE_URL` - Sama dengan NEXT_PUBLIC_SUPABASE_URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key dari Supabase
- [ ] `SUPABASE_ANON_KEY` - Sama dengan NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] `GEMINI_API_KEY` - API key dari Google Gemini
- [ ] `MAX_FILE_SIZE` - Ukuran maksimal file (default: 10485760 = 10MB)

## Catatan Penting

- Environment variables dengan prefix `NEXT_PUBLIC_` akan di-expose ke browser
- Pastikan `NEXT_PUBLIC_SUPABASE_URL` selalu menggunakan format lengkap dengan `https://`
- Set environment variables untuk **Production**, **Deploy previews**, dan **Branch deploys**
- Setelah mengubah environment variables, **harus trigger deployment baru** agar perubahan diterapkan
