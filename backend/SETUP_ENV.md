# Setup Environment Variables untuk Backend

## Error yang Terjadi

```
Error: SUPABASE_URL environment variable is required
```

Ini terjadi karena file `.env` belum dibuat di folder `backend/`.

## Solusi

### Step 1: Buat File `.env`

Buat file baru dengan nama `.env` di folder `backend/` (sama level dengan `package.json`).

### Step 2: Copy Isi Berikut ke `.env`

```env
# Supabase Configuration
SUPABASE_URL=https://ngxlniymmmmkijefhjbm.supabase.co
SUPABASE_ANON_KEY=sb_publishable_j5ChkdsoOLSF9otCH5lZog_6F5V78C7
SUPABASE_SERVICE_ROLE_KEY=PASTE_SERVICE_ROLE_KEY_DISINI

# Backend Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000

# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyDDT8DxQHHMIz17jc2ElnCw4DLoC_1nCl8

# Environment
NODE_ENV=development
```

### Step 3: Dapatkan Service Role Key

1. Buka: https://supabase.com/dashboard/project/ngxlniymmmmkijefhjbm/settings/api
2. Scroll ke bagian **"service_role"** atau **"service_role secret"**
3. Klik **"Reveal"** atau **"Show"** untuk melihat key
4. Copy seluruh key (panjang, biasanya dimulai dengan `eyJ...`)
5. Paste ke `.env` menggantikan `PASTE_SERVICE_ROLE_KEY_DISINI`

### Step 4: Restart Backend

Setelah membuat `.env`, restart backend:

```bash
# Stop server (Ctrl+C)
# Lalu jalankan lagi:
npm run dev
```

## File Structure

```
backend/
├── .env              ← BUAT FILE INI
├── .env.example      ← Template (sudah ada)
├── package.json
├── src/
└── ...
```

## Catatan Penting

- ⚠️ **Jangan commit `.env` ke Git** (sudah di `.gitignore`)
- ✅ File `.env.example` adalah template, copy ke `.env` dan isi dengan nilai sebenarnya
- ✅ `SUPABASE_SERVICE_ROLE_KEY` adalah SECRET - jangan share!

## Quick Copy-Paste

Jika sudah punya service role key, langsung copy ini ke `backend/.env`:

```env
SUPABASE_URL=https://ngxlniymmmmkijefhjbm.supabase.co
SUPABASE_ANON_KEY=sb_publishable_j5ChkdsoOLSF9otCH5lZog_6F5V78C7
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
PORT=3001
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=AIzaSyDDT8DxQHHMIz17jc2ElnCw4DLoC_1nCl8
NODE_ENV=development
```

Ganti `YOUR_SERVICE_ROLE_KEY_HERE` dengan service role key dari Supabase Dashboard.
