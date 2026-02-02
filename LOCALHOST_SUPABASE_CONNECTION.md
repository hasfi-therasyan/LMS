# Localhost Connection ke Supabase

## ✅ YA, Localhost BISA Connect ke Supabase!

Supabase adalah **cloud-hosted database**, jadi Anda bisa connect dari mana saja, termasuk localhost.

## Bagaimana Cara Kerjanya?

```
┌─────────────────────┐
│  Your Localhost     │
│  (localhost:3000)   │  ← Frontend
│  (localhost:3001)   │  ← Backend
└──────────┬──────────┘
           │
           │ HTTPS API Calls
           │
           ▼
┌─────────────────────┐
│   Supabase Cloud    │
│  (ngxlniymmmmkij... │  ← Database & Auth
│    .supabase.co)    │
└─────────────────────┘
```

## Yang Sudah Terhubung:

### ✅ Frontend (localhost:3000)
- Connect ke Supabase Auth untuk login/signup
- Connect ke Supabase Database untuk query data
- Menggunakan: `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### ✅ Backend (localhost:3001)
- Connect ke Supabase Database untuk operations
- Connect ke Supabase Auth untuk user management
- Menggunakan: `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`

## Konfigurasi yang Sudah Ada:

### Frontend (.env.local):
```env
NEXT_PUBLIC_SUPABASE_URL=https://ngxlniymmmmkijefhjbm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_j5ChkdsoOLSF9otCH5lZog_6F5V78C7
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env):
```env
SUPABASE_URL=https://ngxlniymmmmkijefhjbm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  ← PERLU DIISI
SUPABASE_ANON_KEY=sb_publishable_j5ChkdsoOLSF9otCH5lZog_6F5V78C7
```

## Cara Test Connection:

### 1. Test Frontend Connection
- Buka: http://localhost:3000/login
- Coba sign up atau login
- Jika berhasil = connection OK ✅

### 2. Test Backend Connection
- Buka: http://localhost:3001/health
- Jika return `{"status":"ok"}` = backend running ✅
- Test API: http://localhost:3001/api/auth/me (butuh token)

## Troubleshooting:

### ❌ "Failed to connect"
- ✅ Pastikan Supabase URL benar
- ✅ Pastikan API keys benar
- ✅ Pastikan internet connection aktif
- ✅ Check Supabase project status (tidak paused)

### ❌ "Invalid API key"
- ✅ Pastikan key yang benar (anon vs service_role)
- ✅ Pastikan tidak ada spasi di awal/akhir key
- ✅ Copy-paste seluruh key (biasanya panjang)

### ❌ "CORS error"
- ✅ Pastikan `FRONTEND_URL` di backend/.env = `http://localhost:3000`
- ✅ Check CORS config di backend

## Summary:

✅ **Localhost BISA connect ke Supabase** - ini sudah setup dan bekerja!
✅ **Tidak perlu install database lokal** - semua di cloud
✅ **Tinggal isi service_role key** di backend/.env
✅ **Frontend sudah connect** dengan anon key
✅ **Backend akan connect** setelah service_role key diisi
