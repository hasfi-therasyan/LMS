# Quick Fix: Environment Variables Error

## Masalah

Error: `SUPABASE_URL environment variable is required`

## Penyebab

1. ✅ `SUPABASE_URL` sudah ada di `.env`
2. ❌ `SUPABASE_SERVICE_ROLE_KEY` masih placeholder: `REPLACE_WITH_SERVICE_ROLE_KEY`
3. ⚠️ Urutan import - `dotenv.config()` dipanggil setelah import routes

## Solusi

### Step 1: Update Service Role Key

Buka file `backend/.env` dan ganti:

```env
SUPABASE_SERVICE_ROLE_KEY=REPLACE_WITH_SERVICE_ROLE_KEY
```

Menjadi:

```env
SUPABASE_SERVICE_ROLE_KEY=PASTE_SERVICE_ROLE_KEY_DISINI
```

**Cara dapatkan Service Role Key:**
1. Buka: https://supabase.com/dashboard/project/ngxlniymmmmkijefhjbm/settings/api
2. Scroll ke **"service_role"** key
3. Klik **"Reveal"** atau **"Show"**
4. Copy seluruh key (panjang, biasanya dimulai dengan `eyJ...`)
5. Paste ke `.env` menggantikan `PASTE_SERVICE_ROLE_KEY_DISINI`

### Step 2: Restart Backend

Setelah update `.env`:

```bash
# Stop server (Ctrl+C)
npm run dev
```

## File `.env` Lengkap

Pastikan file `backend/.env` berisi:

```env
SUPABASE_URL=https://ngxlniymmmmkijefhjbm.supabase.co
SUPABASE_ANON_KEY=sb_publishable_j5ChkdsoOLSF9otCH5lZog_6F5V78C7
SUPABASE_SERVICE_ROLE_KEY=YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE
PORT=3001
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=AIzaSyDDT8DxQHHMIz17jc2ElnCw4DLoC_1nCl8
NODE_ENV=development
```

## Setelah Fix

Backend akan running di: **http://localhost:3001**

Test dengan:
```bash
curl http://localhost:3001/health
```

Harus return: `{"status":"ok","timestamp":"..."}`
