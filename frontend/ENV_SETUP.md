# Environment Variables Setup

## Untuk Development (Next.js API Routes)

Karena semua API routes sekarang ada di Next.js (serverless functions), **JANGAN** set `NEXT_PUBLIC_API_URL` di environment variables.

### File `.env.local` (di folder `frontend/`)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API Configuration
# JANGAN set NEXT_PUBLIC_API_URL - biarkan kosong untuk menggunakan Next.js API routes
# NEXT_PUBLIC_API_URL=  # Jangan uncomment ini

# Server-side only (tidak perlu NEXT_PUBLIC_ prefix)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
MAX_FILE_SIZE=10485760
GEMINI_MODEL=gemini-2.0-flash-lite
```

## Untuk Production (Vercel)

Set environment variables di Vercel Dashboard:

### Required
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` (optional, untuk frontend)
- `GEMINI_API_KEY`

### Optional
- `MAX_FILE_SIZE` (default: 10485760 = 10MB)
- `GEMINI_MODEL` (default: gemini-2.0-flash-lite)

**PENTING**: Jangan set `NEXT_PUBLIC_API_URL` di Vercel karena API routes ada di aplikasi yang sama.

## Troubleshooting

### Error: ERR_CONNECTION_REFUSED

Jika Anda melihat error `ERR_CONNECTION_REFUSED` saat mengakses `/api/auth/me`:

1. **Pastikan tidak ada `NEXT_PUBLIC_API_URL` di `.env.local`**
   - Hapus atau comment out baris `NEXT_PUBLIC_API_URL=http://localhost:3001`

2. **Restart development server**
   ```bash
   # Stop server (Ctrl+C)
   # Start lagi
   npm run dev
   ```

3. **Clear browser cache**
   - Hard refresh: `Ctrl+Shift+R` (Windows) atau `Cmd+Shift+R` (Mac)

4. **Check Network tab**
   - Request harus ke: `http://localhost:3000/api/auth/me`
   - Bukan ke: `http://localhost:3001/api/auth/me`

### Jika Masih Menggunakan Backend Express Terpisah

Jika Anda masih ingin menggunakan backend Express terpisah (tidak direkomendasikan untuk Vercel):

1. Set `NEXT_PUBLIC_API_URL=http://localhost:3001` di `.env.local`
2. Pastikan backend Express berjalan di port 3001
3. API client akan menggunakan backend Express, bukan Next.js API routes
