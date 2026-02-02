# Cara Mendapatkan Supabase API Keys

## Langkah-langkah:

### 1. Buka Supabase Dashboard
- URL: https://supabase.com/dashboard/project/ngxlniymmmmkijefhjbm

### 2. Go to Settings → API
- Klik **Settings** (ikon gear ⚙️) di sidebar kiri
- Pilih **API** dari menu Settings

### 3. Anda akan melihat 3 keys:

#### a. **Project URL**
- Contoh: `https://ngxlniymmmmkijefhjbm.supabase.co`
- Ini sudah Anda miliki: `https://ngxlniymmmmkijefhjbm.supabase.co`

#### b. **anon public** key
- Label: "anon" atau "public"
- Key: `sb_publishable_j5ChkdsoOLSF9otCH5lZog_6F5V78C7` (sudah Anda miliki)
- ✅ **Aman untuk frontend** (public)
- Digunakan untuk: Frontend client

#### c. **service_role** key (SECRET!)
- Label: "service_role" atau "service_role secret"
- ⚠️ **PENTING: Ini adalah SECRET KEY - jangan share!**
- ⚠️ **Hanya untuk backend, jangan expose ke frontend!**
- Digunakan untuk: Backend operations, admin functions

### 4. Copy Service Role Key
- Klik **"Reveal"** atau **"Show"** untuk melihat key
- Copy seluruh key (panjang, biasanya dimulai dengan `eyJ...`)

### 5. Masukkan ke backend/.env
```
SUPABASE_SERVICE_ROLE_KEY=paste_service_role_key_disini
```

## Visual Guide:

```
Supabase Dashboard
  └── Settings (⚙️)
      └── API
          ├── Project URL: https://ngxlniymmmmkijefhjbm.supabase.co
          ├── anon public: sb_publishable_... (untuk frontend)
          └── service_role: eyJhbGc... (untuk backend) ⚠️ SECRET!
```

## Catatan Penting:

- ✅ **anon key** = Public, aman untuk frontend
- ⚠️ **service_role key** = SECRET, hanya untuk backend!
- 🔒 Jangan commit service_role key ke Git
- 📝 Simpan di `.env` file (sudah di .gitignore)
