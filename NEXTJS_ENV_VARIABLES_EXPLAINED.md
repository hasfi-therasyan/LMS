# 🔍 Penjelasan: NEXT_PUBLIC_ Prefix di Environment Variables

## ❓ **Pertanyaan**

Kenapa di frontend environment variables diawali dengan `NEXT_PUBLIC_` sedangkan di kode tidak ada?

## ✅ **Jawaban Singkat**

**`NEXT_PUBLIC_` adalah prefix khusus Next.js** yang memberitahu Next.js bahwa variable ini **boleh di-expose ke browser** (client-side). Tanpa prefix ini, variable hanya bisa diakses di server-side.

---

## 📚 **Penjelasan Detail**

### **1. Next.js Environment Variables System**

Next.js membedakan 2 jenis environment variables:

#### **A. Server-Side Only (Tanpa Prefix)**
```env
# .env.local
SUPABASE_SERVICE_ROLE_KEY=secret-key
GEMINI_API_KEY=secret-key
```

**Karakteristik:**
- ❌ **Tidak bisa diakses di browser**
- ✅ **Hanya bisa diakses di server** (API routes, Server Components, getServerSideProps, dll)
- ✅ **Aman untuk secret keys**
- ✅ **Tidak di-bundle ke client code**

**Contoh penggunaan:**
```typescript
// ✅ BISA - Di server-side (API route)
// app/api/example/route.ts
const apiKey = process.env.GEMINI_API_KEY; // ✅ Works

// ❌ TIDAK BISA - Di client-side (Component)
// app/page.tsx
const apiKey = process.env.GEMINI_API_KEY; // ❌ undefined
```

#### **B. Client-Side Accessible (Dengan NEXT_PUBLIC_ Prefix)**
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-key
```

**Karakteristik:**
- ✅ **Bisa diakses di browser** (client-side)
- ✅ **Bisa diakses di server** juga
- ⚠️ **Di-bundle ke client code** (jadi visible di browser)
- ⚠️ **Tidak aman untuk secret keys**

**Contoh penggunaan:**
```typescript
// ✅ BISA - Di client-side (Component)
// app/page.tsx
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // ✅ Works

// ✅ BISA - Di server-side juga
// app/api/example/route.ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // ✅ Works
```

---

## 🔍 **Contoh di Codebase Anda**

### **Di `frontend/src/lib/supabase.ts`:**

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  // ...
);
```

**Kenapa pakai `NEXT_PUBLIC_`?**
- Karena `supabase.ts` di-import di **client components**
- Supabase client perlu URL dan key di **browser** untuk connect ke Supabase
- Tanpa `NEXT_PUBLIC_`, variable akan `undefined` di browser

### **Di `frontend/src/lib/api.ts`:**

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001');
```

**Kenapa pakai `NEXT_PUBLIC_`?**
- Karena `api.ts` di-import di **client components**
- API client perlu URL di **browser** untuk make HTTP requests
- Tanpa `NEXT_PUBLIC_`, variable akan `undefined` di browser

---

## 🎯 **Mengapa Next.js Membutuhkan Prefix?**

### **Security by Default**

Next.js menggunakan **"secure by default"** approach:

1. **Tanpa prefix** = Server-only (secure)
2. **Dengan prefix** = Client-accessible (explicit opt-in)

**Ini mencegah:**
- ❌ Accidental exposure of secrets
- ❌ Secret keys ter-bundle ke client code
- ❌ Security vulnerabilities

### **Build-Time Replacement**

Saat build, Next.js akan:

1. **Replace `NEXT_PUBLIC_*` variables** dengan actual values
2. **Bundle ke client code** (jadi visible di browser)
3. **Remove non-prefixed variables** dari client bundle

**Contoh:**
```typescript
// Source code
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

// After build (client bundle)
const url = "https://xxx.supabase.co"; // ✅ Replaced
```

---

## 📊 **Perbandingan**

| Aspek | Tanpa Prefix | Dengan NEXT_PUBLIC_ |
|-------|--------------|---------------------|
| **Akses di Server** | ✅ Ya | ✅ Ya |
| **Akses di Browser** | ❌ Tidak | ✅ Ya |
| **Di-bundle ke Client** | ❌ Tidak | ✅ Ya |
| **Visible di Browser** | ❌ Tidak | ✅ Ya |
| **Aman untuk Secrets** | ✅ Ya | ❌ Tidak |
| **Contoh** | `GEMINI_API_KEY` | `NEXT_PUBLIC_SUPABASE_URL` |

---

## 🔐 **Best Practices**

### **✅ Pakai `NEXT_PUBLIC_` untuk:**
- Public URLs (Supabase URL, API URL)
- Public keys (Supabase Anon Key)
- Configuration yang aman di-expose (theme, feature flags)
- Data yang memang perlu di browser

### **❌ JANGAN pakai `NEXT_PUBLIC_` untuk:**
- Secret keys (Service Role Key, API Keys)
- Database credentials
- Private tokens
- Sensitive data

---

## 💡 **Contoh di Project Anda**

### **Backend (api/):**
```env
# ✅ TANPA prefix - Server-only
SUPABASE_SERVICE_ROLE_KEY=secret-key
GEMINI_API_KEY=secret-key
```

**Kenapa?**
- Backend hanya jalan di server (Vercel Functions)
- Tidak perlu di-expose ke browser
- Aman untuk secret keys

### **Frontend (frontend/):**
```env
# ✅ DENGAN prefix - Client-accessible
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-key
```

**Kenapa?**
- Frontend perlu akses di browser
- Supabase client perlu URL dan key di browser
- Anon key memang public (aman di-expose)

---

## 🎓 **Kesimpulan**

### **Kenapa `NEXT_PUBLIC_`?**

1. **Security**: Mencegah accidental exposure of secrets
2. **Explicit**: Developer harus explicitly opt-in untuk expose ke browser
3. **Build-time**: Next.js replace values saat build
4. **Client bundle**: Values di-bundle ke client code

### **Di Kode:**

```typescript
// ✅ Di kode, tetap pakai dengan prefix
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Next.js akan replace saat build:
// Development: process.env.NEXT_PUBLIC_SUPABASE_URL
// Production: "https://xxx.supabase.co" (replaced)
```

### **Kenapa Tidak Terlihat di Kode?**

Karena Next.js **replace values saat build time**, jadi di production bundle, values sudah di-replace dengan actual values. Tapi di source code, tetap pakai `process.env.NEXT_PUBLIC_*`.

---

## 📝 **FAQ**

### **Q: Kenapa tidak langsung hardcode values?**
**A:** 
- Environment variables memungkinkan different values untuk different environments (dev, staging, production)
- Lebih aman dan flexible

### **Q: Apakah `NEXT_PUBLIC_*` values visible di browser?**
**A:** 
- Ya, values di-bundle ke client code
- Bisa dilihat di browser DevTools → Sources → webpack
- Jadi jangan pakai untuk secrets!

### **Q: Apakah bisa pakai tanpa prefix di client?**
**A:** 
- Tidak, akan return `undefined`
- Next.js hanya expose variables dengan `NEXT_PUBLIC_` prefix ke client

### **Q: Apakah perlu set di Vercel juga?**
**A:** 
- Ya, set di Vercel Dashboard → Settings → Environment Variables
- Pastikan pakai prefix `NEXT_PUBLIC_` untuk client-accessible variables

---

**Semoga membantu! 🚀**
