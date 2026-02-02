# How to Start Backend Server

## Problem
Error: `ERR_CONNECTION_REFUSED` pada `localhost:3001/api/auth/me`

Ini berarti backend server tidak berjalan.

## Solution

### Step 1: Buka Terminal/Command Prompt

Buka terminal baru di folder project.

### Step 2: Navigate ke Backend Directory

```bash
cd backend
```

### Step 3: Install Dependencies (Jika Belum)

```bash
npm install
```

### Step 4: Start Backend Server

```bash
npm run dev
```

Atau jika menggunakan PowerShell:

```powershell
cd backend
npm run dev
```

### Step 5: Verify Server is Running

Setelah menjalankan `npm run dev`, Anda harus melihat output seperti:

```
> lms-backend@1.0.0 dev
> tsx watch src/index.ts

Server running on http://localhost:3001
```

### Step 6: Test Backend Health

Buka browser atau gunakan curl:

```bash
curl http://localhost:3001/health
```

Atau buka di browser: `http://localhost:3001/health`

Seharusnya mengembalikan:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

## Important Notes

1. **Backend harus berjalan sebelum frontend bisa bekerja**
   - Frontend di `localhost:3000` membutuhkan backend di `localhost:3001`
   - Jika backend tidak berjalan, semua API calls akan gagal

2. **Environment Variables**
   - Pastikan `backend/.env` sudah diisi dengan benar:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `GEMINI_API_KEY` (optional)
     - `PORT=3001` (default)

3. **Keep Terminal Open**
   - Jangan tutup terminal yang menjalankan backend
   - Backend harus tetap berjalan saat development

## Troubleshooting

### Error: "Cannot find module"
**Solution:** Jalankan `npm install` di folder `backend`

### Error: "SUPABASE_URL environment variable is required"
**Solution:** Pastikan file `backend/.env` ada dan berisi `SUPABASE_URL`

### Error: Port 3001 already in use
**Solution:** 
- Tutup aplikasi lain yang menggunakan port 3001
- Atau ubah PORT di `backend/.env` ke port lain (misalnya 3002)
- Update `NEXT_PUBLIC_API_URL` di `frontend/.env.local` juga

### Backend starts but frontend still can't connect
**Solution:**
- Cek apakah backend benar-benar running di `http://localhost:3001`
- Test dengan: `curl http://localhost:3001/health`
- Pastikan tidak ada firewall yang memblokir koneksi

## Quick Start Commands

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Kedua server harus berjalan bersamaan!
