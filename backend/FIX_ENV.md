# Fix Environment Variables Error

## Error
```
Error: SUPABASE_URL environment variable is required
```

## Penyebab
File `.env` ada tapi variabel `SUPABASE_URL` tidak ditemukan atau kosong.

## Solusi

### Option 1: Edit File `.env` Manual

1. Buka file `backend/.env` di editor
2. Pastikan ada baris berikut:

```env
SUPABASE_URL=https://ngxlniymmmmkijefhjbm.supabase.co
SUPABASE_ANON_KEY=sb_publishable_j5ChkdsoOLSF9otCH5lZog_6F5V78C7
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=3001
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=AIzaSyDDT8DxQHHMIz17jc2ElnCw4DLoC_1nCl8
NODE_ENV=development
```

3. **PENTING:** Ganti `your_service_role_key_here` dengan service role key dari Supabase Dashboard
4. Simpan file
5. Restart backend: `npm run dev`

### Option 2: Buat Ulang File `.env`

Jika file `.env` rusak atau tidak lengkap:

1. Hapus file `backend/.env` (jika ada)
2. Buat file baru `backend/.env`
3. Copy-paste isi berikut:

```env
SUPABASE_URL=https://ngxlniymmmmkijefhjbm.supabase.co
SUPABASE_ANON_KEY=sb_publishable_j5ChkdsoOLSF9otCH5lZog_6F5V78C7
SUPABASE_SERVICE_ROLE_KEY=PASTE_SERVICE_ROLE_KEY_DISINI
PORT=3001
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=AIzaSyDDT8DxQHHMIz17jc2ElnCw4DLoC_1nCl8
NODE_ENV=development
```

4. Ganti `PASTE_SERVICE_ROLE_KEY_DISINI` dengan service role key
5. Simpan
6. Restart backend

### Cara Dapatkan Service Role Key

1. Buka: https://supabase.com/dashboard/project/ngxlniymmmmkijefhjbm/settings/api
2. Scroll ke **"service_role"** key
3. Klik **"Reveal"** atau **"Show"**
4. Copy seluruh key
5. Paste ke `.env`

## Checklist

Pastikan file `.env` berisi:
- ✅ `SUPABASE_URL=https://ngxlniymmmmkijefhjbm.supabase.co`
- ✅ `SUPABASE_ANON_KEY=sb_publishable_j5ChkdsoOLSF9otCH5lZog_6F5V78C7`
- ✅ `SUPABASE_SERVICE_ROLE_KEY=...` (dari Supabase Dashboard)
- ✅ `PORT=3001`
- ✅ `FRONTEND_URL=http://localhost:3000`
- ✅ `GEMINI_API_KEY=AIzaSyDDT8DxQHHMIz17jc2ElnCw4DLoC_1nCl8`

## Setelah Edit

1. **Simpan file** `.env`
2. **Restart backend:**
   ```bash
   # Stop (Ctrl+C)
   npm run dev
   ```

## Troubleshooting

### Masih Error?
- ✅ Pastikan tidak ada spasi di awal/akhir value
- ✅ Pastikan tidak ada tanda kutip (`"` atau `'`) di sekitar value
- ✅ Pastikan format: `KEY=value` (tidak ada spasi sebelum `=`)
- ✅ Pastikan file disimpan dengan encoding UTF-8

### Test Environment Variables

Setelah edit, test dengan:
```bash
cd backend
node -e "require('dotenv').config(); console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'OK' : 'MISSING')"
```

Harus output: `SUPABASE_URL: OK`
