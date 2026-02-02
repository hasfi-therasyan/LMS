# Troubleshooting Login Issue

## Masalah: Login tidak berfungsi

### Checklist untuk Debug:

#### 1. Cek Browser Console
- Buka browser → F12 → Console tab
- Coba login, lihat error apa yang muncul
- Screenshot atau copy error message

#### 2. Cek Environment Variables
Pastikan `frontend/.env.local` ada dan berisi:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ngxlniymmmmkijefhjbm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_j5ChkdsoOLSF9otCH5lZog_6F5V78C7
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### 3. Cek Backend Running
- Pastikan backend server running di `http://localhost:3001`
- Test: Buka http://localhost:3001/health
- Harus return: `{"status":"ok"}`

#### 4. Cek User di Supabase Auth
- Buka: https://supabase.com/dashboard/project/ngxlniymmmmkijefhjbm/auth/users
- Pastikan user wiwik@unp.id dan hasfi@unp.id ada
- Pastikan email sudah confirmed (tidak ada tanda warning)

#### 5. Cek Profile di Database
Jalankan query ini di SQL Editor:
```sql
SELECT id, email, full_name, role FROM public.profiles 
WHERE email IN ('wiwik@unp.id', 'hasfi@unp.id');
```
Pastikan:
- ✅ Ada 2 rows
- ✅ Role: 'admin' untuk wiwik, 'mahasiswa' untuk hasfi
- ✅ ID sama dengan ID di auth.users

#### 6. Common Issues

**Issue: "Invalid login credentials"**
- ✅ Pastikan email dan password benar
- ✅ Pastikan user sudah dibuat di Auth
- ✅ Pastikan email sudah confirmed

**Issue: "Failed to load profile"**
- ✅ Pastikan backend running
- ✅ Pastikan profile ada di database
- ✅ Check browser console untuk error detail

**Issue: "Missing Supabase environment variables"**
- ✅ Pastikan `.env.local` ada di folder `frontend/`
- ✅ Restart frontend server setelah edit `.env.local`

**Issue: Button tidak responsif**
- ✅ Check browser console untuk JavaScript errors
- ✅ Pastikan form validation tidak block submit

## Quick Fix Steps:

1. **Restart Frontend:**
   ```bash
   cd frontend
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Restart Backend:**
   ```bash
   cd backend
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Clear Browser Cache:**
   - Ctrl+Shift+Delete → Clear cache
   - Atau buka Incognito/Private window

4. **Test Login dengan Console Open:**
   - Buka http://localhost:3000/login
   - F12 → Console tab
   - Coba login
   - Lihat error message (jika ada)

## Test Manual:

1. **Test Supabase Connection:**
   Buka browser console, jalankan:
   ```javascript
   // Test Supabase client
   const { createClient } = require('@supabase/supabase-js');
   const supabase = createClient(
     'https://ngxlniymmmmkijefhjbm.supabase.co',
     'sb_publishable_j5ChkdsoOLSF9otCH5lZog_6F5V78C7'
   );
   
   // Test login
   supabase.auth.signInWithPassword({
     email: 'wiwik@unp.id',
     password: 'wr77hs20'
   }).then(console.log);
   ```

2. **Test Backend API:**
   ```bash
   # Test health
   curl http://localhost:3001/health
   
   # Test auth (butuh token)
   curl http://localhost:3001/api/auth/me \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## Jika Masih Error:

Kirimkan:
1. Error message dari browser console
2. Error message dari backend terminal
3. Screenshot halaman login
4. Status backend server (running atau tidak)
