# 🚀 Netlify Full Stack Deployment (Frontend + Backend)

## ✅ Ya, Bisa! Netlify Mendukung Backend via Functions

Netlify bisa digunakan untuk **frontend DAN backend** menggunakan **Netlify Functions** (serverless functions).

---

## 🎯 **Cara Kerja Netlify Functions**

### **Konsep:**
- **Frontend**: Next.js di-deploy sebagai static site
- **Backend**: Express app di-convert menjadi Netlify Functions
- **Semua dalam satu project**: Frontend + Backend di Netlify

### **Keuntungan:**
- ✅ **Satu platform** - semua di Netlify
- ✅ **Satu dashboard** - mudah manage
- ✅ **Auto-deploy** dari GitHub
- ✅ **Free tier** cukup untuk development
- ✅ **Lebih simple** dari Vercel untuk full stack

---

## 📋 **Setup Netlify Full Stack**

### **Step 1: Install Netlify CLI (Optional)**

```bash
npm install -g netlify-cli
```

### **Step 2: Update netlify.toml**

File `netlify.toml` sudah dibuat, tapi perlu di-update untuk support backend:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "frontend/.next"

[build.environment]
  NODE_VERSION = "18"

# Netlify Functions untuk backend
[functions]
  directory = "netlify/functions"

# Redirect API calls ke Netlify Functions
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
  force = true
```

### **Step 3: Create Netlify Function Wrapper**

Buat folder `netlify/functions/api.ts` yang akan wrap Express app:

```typescript
// netlify/functions/api.ts
import serverless from 'serverless-http';
import app from '../../backend/src/index';

// Wrap Express app untuk Netlify Functions
export const handler = serverless(app);
```

### **Step 4: Install Dependencies**

```bash
npm install serverless-http --save
```

---

## 🔧 **Alternatif: Setup Manual (Lebih Detail)**

### **Opsi A: Menggunakan serverless-http (Recommended)**

**Step 1: Install package**
```bash
cd backend
npm install serverless-http
```

**Step 2: Create function wrapper**
Buat file `netlify/functions/api.ts`:

```typescript
import serverless from 'serverless-http';
import app from '../../backend/src/index';

export const handler = serverless(app, {
  binary: ['image/*', 'application/pdf']
});
```

**Step 3: Update netlify.toml**
```toml
[build]
  base = "."
  command = "cd frontend && npm run build"
  publish = "frontend/.next"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api"
  status = 200
```

### **Opsi B: Manual Function Setup (Lebih Kontrol)**

Jika `serverless-http` tidak bekerja dengan baik, bisa buat function manual untuk setiap route.

---

## 📝 **Update netlify.toml Lengkap**

```toml
[build]
  base = "."
  command = "npm install --prefix backend && npm install --prefix frontend && cd frontend && npm run build"
  publish = "frontend/.next"

[build.environment]
  NODE_VERSION = "18"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
  included_files = ["backend/**"]

# Redirect API calls ke Netlify Functions
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api"
  status = 200
  force = true
```

---

## 🔑 **Environment Variables untuk Netlify**

Set semua environment variables di Netlify Dashboard:

### **Backend Variables:**
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=https://your-app.netlify.app
NODE_ENV=production
MAX_FILE_SIZE=10485760
```

### **Frontend Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=
MAINTENANCE_MODE=false
```

**Note:** `NEXT_PUBLIC_API_URL` kosongkan karena API akan di-handle oleh Netlify Functions.

---

## ⚠️ **Limitations & Considerations**

### **Netlify Functions Limitations:**

1. **Execution Time**: Max 10 seconds (free tier), 26 seconds (pro)
2. **Memory**: 1024 MB max
3. **Request Size**: 6 MB max (untuk file upload, perlu handle berbeda)
4. **Cold Start**: Ada cold start time (tapi biasanya cepat)

### **File Upload Considerations:**

Untuk file upload (PDF), ada beberapa opsi:
1. **Direct Upload ke Supabase**: Upload langsung dari frontend ke Supabase Storage
2. **Chunk Upload**: Split file menjadi chunks
3. **Pre-signed URLs**: Generate pre-signed URL dari backend, upload langsung ke Supabase

---

## 🎯 **Rekomendasi untuk Project Anda**

### **Opsi 1: Netlify Full Stack (Frontend + Functions)** ⭐

**Pros:**
- ✅ Semua di satu platform
- ✅ Lebih simple dari Vercel
- ✅ Auto-deploy dari GitHub
- ✅ Free tier cukup

**Cons:**
- ⚠️ File upload perlu handle khusus (direct ke Supabase lebih baik)
- ⚠️ Execution time limit (10-26 seconds)
- ⚠️ Perlu setup serverless-http

**Best for:** Project yang tidak terlalu banyak file upload besar

### **Opsi 2: Netlify (Frontend) + Railway (Backend)** ⭐⭐ **RECOMMENDED**

**Pros:**
- ✅ Backend sebagai traditional server (tidak ada limitasi)
- ✅ File upload lebih mudah
- ✅ Lebih mudah di-debug
- ✅ Tidak ada execution time limit

**Cons:**
- ⚠️ Perlu deploy di 2 tempat (tapi lebih mudah)

**Best for:** Project dengan banyak file upload dan processing

---

## 🚀 **Quick Start: Netlify Full Stack**

### **Step 1: Install serverless-http**

```bash
cd backend
npm install serverless-http
```

### **Step 2: Create Function Wrapper**

Buat folder dan file:
```
netlify/
  functions/
    api.ts
```

Isi `netlify/functions/api.ts`:
```typescript
import serverless from 'serverless-http';
import app from '../../backend/src/index';

export const handler = serverless(app);
```

### **Step 3: Update netlify.toml**

```toml
[build]
  base = "."
  command = "npm install --prefix backend && npm install --prefix frontend && cd frontend && npm run build"
  publish = "frontend/.next"

[functions]
  directory = "netlify/functions"
  included_files = ["backend/**"]

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api"
  status = 200
```

### **Step 4: Deploy ke Netlify**

1. Import dari GitHub
2. Set environment variables
3. Deploy

---

## 📊 **Perbandingan**

| Feature | Netlify Full Stack | Netlify + Railway |
|---------|-------------------|-------------------|
| **Setup** | Medium | Easy |
| **File Upload** | ⚠️ Perlu handle khusus | ✅ Easy |
| **Execution Time** | ⚠️ 10-26 seconds | ✅ Unlimited |
| **Debugging** | ⚠️ Lebih sulit | ✅ Lebih mudah |
| **Cost** | ✅ Free tier | ✅ Free tier |
| **Platform** | ✅ Satu platform | ⚠️ Dua platform |

---

## ✅ **Kesimpulan**

**Ya, bisa menggunakan Netlify untuk frontend dan backend!**

**Tapi untuk project Anda (dengan banyak file upload), saya tetap rekomendasikan:**
- **Netlify untuk Frontend** (sangat mudah)
- **Railway untuk Backend** (lebih mudah untuk file upload dan processing)

**Alasan:**
1. File upload lebih mudah di traditional server
2. Tidak ada execution time limit
3. Lebih mudah di-debug
4. Setup tetap simple (hanya 2 platform)

**Tapi jika ingin semua di Netlify**, bisa menggunakan Netlify Functions dengan beberapa penyesuaian untuk file upload.

---

**Mau saya buatkan setup lengkap untuk Netlify Full Stack, atau tetap dengan Netlify + Railway?**
