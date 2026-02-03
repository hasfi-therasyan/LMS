# 🔐 Environment Variables untuk Vercel Deployment

## 📋 Daftar Lengkap Environment Variables

Berikut adalah semua environment variables yang diperlukan untuk deployment di Vercel:

---

## 🎯 **Backend/API Environment Variables**

### **Required (Wajib):**

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key-here

# CORS Configuration
FRONTEND_URL=https://your-app.vercel.app
```

### **Optional (Opsional):**

```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# File Upload Configuration
MAX_FILE_SIZE=10485760

# Gemini Model Override (optional)
GEMINI_MODEL=gemini-2.0-flash-lite
```

---

## 🎯 **Frontend Environment Variables**

### **Required (Wajib):**

```bash
# Supabase Configuration (Public - bisa diakses di browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### **Optional (Opsional):**

```bash
# Backend API URL (kosongkan untuk production - akan gunakan relative path)
NEXT_PUBLIC_API_URL=

# Maintenance Mode
MAINTENANCE_MODE=false
```

---

## 📝 **Cara Set Environment Variables di Vercel**

### **Step 1: Buka Vercel Dashboard**

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project Anda
3. Klik **"Settings"** tab
4. Klik **"Environment Variables"** di sidebar

### **Step 2: Add Environment Variables**

Untuk setiap variable:

1. Klik **"Add New"**
2. Masukkan **Key** (nama variable)
3. Masukkan **Value** (nilai variable)
4. Pilih **Environment**:
   - **Production**: Untuk production deployment
   - **Preview**: Untuk preview deployments
   - **Development**: Untuk local development (jika menggunakan Vercel CLI)

5. Klik **"Save"**

---

## 🔑 **Detail Setiap Environment Variable**

### **Backend Variables:**

#### **SUPABASE_URL**
- **Deskripsi**: URL Supabase project Anda
- **Format**: `https://[project-id].supabase.co`
- **Contoh**: `https://ngxlniymmmmkijefhjbm.supabase.co`
- **Cara Dapatkan**: Supabase Dashboard → Settings → API → Project URL

#### **SUPABASE_SERVICE_ROLE_KEY**
- **Deskripsi**: Service Role Key untuk admin access (SECRET!)
- **Format**: Long string (JWT-like)
- **Contoh**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Cara Dapatkan**: Supabase Dashboard → Settings → API → Service Role Key
- **⚠️ PENTING**: Jangan expose ke frontend! Hanya untuk backend.

#### **SUPABASE_ANON_KEY**
- **Deskripsi**: Anonymous Key untuk public access
- **Format**: Long string (JWT-like)
- **Contoh**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Cara Dapatkan**: Supabase Dashboard → Settings → API → Anon/Public Key
- **✅ Safe**: Bisa digunakan di frontend (sudah public)

#### **GEMINI_API_KEY**
- **Deskripsi**: Google Gemini API key untuk AI chatbot
- **Format**: String
- **Contoh**: `AIzaSyAbc123...`
- **Cara Dapatkan**: [Google AI Studio](https://makersuite.google.com/app/apikey)

#### **FRONTEND_URL**
- **Deskripsi**: URL frontend untuk CORS configuration
- **Format**: `https://your-app.vercel.app`
- **Contoh**: `https://smartlms.vercel.app`
- **Catatan**: Setelah deploy, update dengan URL Vercel Anda

#### **PORT** (Optional)
- **Deskripsi**: Port untuk backend server (hanya untuk local development)
- **Default**: `3001`
- **Catatan**: Tidak digunakan di Vercel (serverless)

#### **MAX_FILE_SIZE** (Optional)
- **Deskripsi**: Maximum file upload size dalam bytes
- **Default**: `10485760` (10MB)
- **Contoh**: `10485760` = 10MB, `20971520` = 20MB

#### **GEMINI_MODEL** (Optional)
- **Deskripsi**: Override default Gemini model
- **Default**: `gemini-2.0-flash-lite`
- **Contoh**: `gemini-2.5-flash`, `gemini-2.0-flash-lite`

---

### **Frontend Variables:**

#### **NEXT_PUBLIC_SUPABASE_URL**
- **Deskripsi**: Supabase URL untuk frontend (public)
- **Format**: `https://[project-id].supabase.co`
- **Contoh**: `https://ngxlniymmmmkijefhjbm.supabase.co`
- **Catatan**: Harus sama dengan `SUPABASE_URL` di backend

#### **NEXT_PUBLIC_SUPABASE_ANON_KEY**
- **Deskripsi**: Supabase Anon Key untuk frontend (public)
- **Format**: Long string
- **Contoh**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Catatan**: Harus sama dengan `SUPABASE_ANON_KEY` di backend

#### **NEXT_PUBLIC_API_URL** (Optional)
- **Deskripsi**: Backend API URL untuk frontend
- **Production**: Kosongkan (akan gunakan relative path `/api`)
- **Development**: `http://localhost:3001`
- **Catatan**: Jika kosong di production, frontend akan gunakan relative path

#### **MAINTENANCE_MODE** (Optional)
- **Deskripsi**: Enable/disable maintenance mode
- **Values**: `true` atau `false`
- **Default**: `false`
- **Catatan**: Set `true` untuk enable maintenance page

---

## 📋 **Quick Copy-Paste untuk Vercel**

Berikut adalah format yang bisa langsung copy-paste ke Vercel:

### **Backend Variables (Production):**

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
MAX_FILE_SIZE=10485760
```

### **Frontend Variables (Production):**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=
MAINTENANCE_MODE=false
```

---

## ⚠️ **Penting!**

1. **Jangan commit** `.env` files ke GitHub
2. **Service Role Key** adalah SECRET - jangan expose ke frontend
3. **Anon Key** adalah public - aman untuk frontend
4. **Update FRONTEND_URL** setelah deploy dengan URL Vercel Anda
5. **Set semua variables** sebelum deploy pertama kali

---

## ✅ **Checklist Setup**

- [ ] SUPABASE_URL (Backend)
- [ ] SUPABASE_SERVICE_ROLE_KEY (Backend)
- [ ] SUPABASE_ANON_KEY (Backend)
- [ ] GEMINI_API_KEY (Backend)
- [ ] FRONTEND_URL (Backend) - Update setelah deploy
- [ ] NEXT_PUBLIC_SUPABASE_URL (Frontend)
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY (Frontend)
- [ ] NEXT_PUBLIC_API_URL (Frontend) - Kosongkan untuk production
- [ ] MAINTENANCE_MODE (Frontend) - Optional, default false

---

## 🔍 **Cara Verifikasi**

Setelah set semua variables:

1. **Deploy project** di Vercel
2. **Cek build logs** untuk error
3. **Test API endpoint**: `https://your-app.vercel.app/api/health`
4. **Test frontend**: Buka URL Vercel Anda
5. **Cek console** untuk error

---

**Note:** Pastikan semua environment variables sudah di-set di Vercel sebelum deploy!
