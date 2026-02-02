# Quick Fix untuk Login Issue

## Langkah Cepat Debug:

### 1. Buka Browser Console
- Tekan **F12** di browser
- Pilih tab **Console**
- Coba login, lihat error apa yang muncul

### 2. Cek Backend Running
Buka terminal, pastikan backend running:
```bash
# Check if backend is running
curl http://localhost:3001/health
```

Jika tidak running:
```bash
cd backend
npm run dev
```

### 3. Cek Environment Variables
Pastikan `frontend/.env.local` ada:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ngxlniymmmmkijefhjbm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_j5ChkdsoOLSF9otCH5lZog_6F5V78C7
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Restart frontend** setelah edit `.env.local`:
```bash
cd frontend
# Stop (Ctrl+C) lalu:
npm run dev
```

### 4. Cek User di Supabase
- Buka: https://supabase.com/dashboard/project/ngxlniymmmmkijefhjbm/auth/users
- Pastikan user **wiwik@unp.id** dan **hasfi@unp.id** ada
- Pastikan **Email Confirmed** = ✅ (tidak ada warning)

### 5. Cek Profile di Database
Jalankan di SQL Editor:
```sql
SELECT id, email, full_name, role 
FROM public.profiles 
WHERE email IN ('wiwik@unp.id', 'hasfi@unp.id');
```

Pastikan:
- ✅ Ada 2 rows
- ✅ Role: 'admin' untuk wiwik, 'mahasiswa' untuk hasfi
- ✅ ID sama dengan ID di auth.users

### 6. Common Errors & Solutions

#### Error: "Invalid login credentials"
**Solusi:**
- Pastikan email & password benar
- Pastikan user sudah dibuat di Auth
- Pastikan email sudah confirmed

#### Error: "Failed to load profile" atau "Network error"
**Solusi:**
- Pastikan backend running di port 3001
- Check `NEXT_PUBLIC_API_URL` di `.env.local`
- Restart frontend server

#### Error: "Missing Supabase environment variables"
**Solusi:**
- Pastikan `.env.local` ada di folder `frontend/`
- Pastikan variabel dimulai dengan `NEXT_PUBLIC_`
- Restart frontend server

#### Button tidak responsif / tidak terjadi apa-apa
**Solusi:**
- Buka browser console (F12)
- Lihat error di Console tab
- Check Network tab untuk failed requests

## Test Manual di Browser Console:

Buka http://localhost:3000/login, lalu buka Console (F12), paste ini:

```javascript
// Test login langsung
const testLogin = async () => {
  const response = await fetch('https://ngxlniymmmmkijefhjbm.supabase.co/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'sb_publishable_j5ChkdsoOLSF9otCH5lZog_6F5V78C7'
    },
    body: JSON.stringify({
      email: 'wiwik@unp.id',
      password: 'wr77hs20'
    })
  });
  const data = await response.json();
  console.log('Login test result:', data);
};

testLogin();
```

## Jika Masih Error:

**Kirimkan informasi berikut:**
1. Error message dari browser console (F12 → Console)
2. Error message dari backend terminal (jika ada)
3. Screenshot halaman login
4. Status: Apakah backend running? (test http://localhost:3001/health)
