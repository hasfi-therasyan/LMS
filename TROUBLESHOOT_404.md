# Troubleshooting 404 "This Page Could Not Be Found"

## Common Causes

### 1. Frontend Route Not Found

**Symptoms:**
- Browser shows "404 - This page could not be found"
- URL di browser tidak sesuai dengan route yang ada

**Solution:**
- Pastikan URL yang diakses sesuai dengan route yang ada:
  - `/` - Home (redirects to login or dashboard)
  - `/login` - Login page
  - `/admin` - Admin dashboard
  - `/student` - Student dashboard
  - `/lecturer` - Lecturer dashboard (same as admin)
  - `/jobsheet/[id]` - Jobsheet PDF viewer

### 2. Backend API Endpoint Not Found

**Symptoms:**
- Frontend bisa load tapi API calls return 404
- Error di browser console: "404 Not Found" untuk API requests

**Solution:**
- Pastikan backend server berjalan di `http://localhost:3001`
- Test health endpoint: `http://localhost:3001/health`
- Pastikan API endpoint yang dipanggil sesuai dengan yang ada di backend:
  - `/api/auth/me`
  - `/api/jobsheet`
  - `/api/quizzes`
  - `/api/modules`
  - dll.

### 3. Next.js Route Issue

**Symptoms:**
- Halaman tidak load sama sekali
- Error di terminal Next.js

**Solution:**
- Restart frontend server:
  ```bash
  cd frontend
  npm run dev
  ```
- Clear Next.js cache:
  ```bash
  rm -rf .next
  npm run dev
  ```

## Quick Fixes

### Check Current URL
Lihat URL di browser - apakah sesuai dengan route yang ada?

### Check Backend Status
```bash
curl http://localhost:3001/health
```

Seharusnya return:
```json
{"status":"ok","timestamp":"..."}
```

### Check Frontend Routes
Pastikan file-file berikut ada:
- `frontend/src/app/page.tsx` - Home page
- `frontend/src/app/login/page.tsx` - Login page
- `frontend/src/app/admin/page.tsx` - Admin dashboard
- `frontend/src/app/student/page.tsx` - Student dashboard
- `frontend/src/app/jobsheet/[id]/page.tsx` - Jobsheet viewer

### Check Browser Console
Buka browser console (F12) dan lihat error messages:
- Network errors → Backend tidak berjalan
- 404 errors → Route tidak ditemukan
- CORS errors → Backend CORS configuration

## Most Common Issue

**Backend tidak berjalan** adalah penyebab paling umum:
1. Pastikan backend server berjalan: `cd backend && npm run dev`
2. Pastikan tidak ada error di terminal backend
3. Test dengan: `curl http://localhost:3001/health`

## Need More Help?

Jika masih error, berikan:
1. URL yang diakses
2. Error message lengkap dari browser console
3. Error message dari terminal (frontend & backend)
