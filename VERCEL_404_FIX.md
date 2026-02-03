# 🔧 Fix 404 NOT_FOUND Error di Vercel

## 1. **Root Cause Analysis**

### **Apa yang Terjadi:**
Error `404: NOT_FOUND` terjadi karena Vercel tidak bisa menemukan atau serve Next.js app dengan benar.

### **Mengapa Ini Terjadi:**

1. **Konfigurasi `vercel.json` Menggunakan `builds` (Deprecated)**
   - Vercel sudah tidak menggunakan `builds` array untuk Next.js
   - Next.js seharusnya auto-detected oleh Vercel
   - `builds` configuration bisa menyebabkan konflik

2. **Next.js App Router vs Vercel Detection**
   - Vercel perlu detect `frontend/package.json` sebagai Next.js project
   - Dengan `builds` array, Vercel mungkin tidak auto-detect dengan benar
   - Root directory configuration mungkin salah

3. **Missing Output Directory**
   - Vercel perlu tahu di mana Next.js build output berada
   - Tanpa konfigurasi yang benar, Vercel tidak tahu di mana file-file yang harus di-serve

---

## 2. **Penjelasan Konsep**

### **Vercel Build System:**

**Cara Lama (Deprecated):**
```json
{
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    }
  ]
}
```

**Cara Baru (Recommended):**
- Vercel **auto-detects** Next.js jika menemukan `package.json` dengan `next` dependency
- Tidak perlu `builds` array untuk Next.js
- Hanya perlu `rewrites` untuk API routes

### **Mental Model:**

1. **Vercel Detection Flow:**
   ```
   Vercel scans project
   → Finds package.json with "next" dependency
   → Auto-detects as Next.js app
   → Builds and deploys automatically
   ```

2. **API Routes (Serverless Functions):**
   ```
   /api/* requests
   → Matched by rewrites
   → Routed to serverless function
   → Express app handles routing
   ```

3. **Frontend Routes:**
   ```
   /* requests (except /api/*)
   → Served by Next.js
   → Next.js App Router handles routing
   ```

---

## 3. **Solusi**

### **Fix 1: Update `vercel.json`**

Hapus `builds` array dan gunakan konfigurasi yang lebih sederhana:

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "npm install --prefix api && npm install --prefix frontend",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/index.ts"
    }
  ]
}
```

**Atau lebih baik lagi, biarkan Vercel auto-detect:**

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/index.ts"
    }
  ]
}
```

### **Fix 2: Set Root Directory di Vercel Dashboard**

1. Vercel Dashboard → Project → Settings
2. **General** → **Root Directory**
3. Set ke: **`frontend`** (atau kosongkan untuk auto-detect)

### **Fix 3: Pastikan Build Command Benar**

Di Vercel Dashboard → Settings → Build & Development Settings:
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `frontend` (atau kosong)
- **Build Command**: `npm run build` (auto)
- **Output Directory**: `.next` (auto)

---

## 4. **Warning Signs untuk Masa Depan**

### **Red Flags:**
1. ✅ **Menggunakan `builds` array untuk Next.js** → Deprecated
2. ✅ **Root directory tidak jelas** → Vercel tidak tahu di mana Next.js app
3. ✅ **Missing `package.json` di root atau frontend** → Vercel tidak bisa detect
4. ✅ **Output directory salah** → Vercel tidak tahu di mana build output

### **Code Smells:**
- `vercel.json` dengan `builds` array untuk Next.js
- Root directory tidak di-set dengan benar
- Build command manual padahal bisa auto-detect

### **Patterns to Watch:**
- Monorepo dengan multiple apps → Perlu set root directory
- Custom build commands → Pastikan output directory benar
- API routes di folder terpisah → Perlu rewrites configuration

---

## 5. **Alternatif Approaches**

### **Approach 1: Minimal `vercel.json` (Recommended)**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/index.ts"
    }
  ]
}
```
**Pros:** Simple, Vercel handles everything
**Cons:** Less control

### **Approach 2: Explicit Configuration**
```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "rewrites": [...]
}
```
**Pros:** More control
**Cons:** Need to maintain manually

### **Approach 3: Separate Projects**
- Frontend: Separate Vercel project (root: `frontend`)
- Backend: Separate Vercel project (root: `api`)
**Pros:** Clear separation
**Cons:** More complex setup, need to manage CORS

---

## 6. **Step-by-Step Fix**

1. **Update `vercel.json`** → Remove `builds` array
2. **Set Root Directory** → Vercel Dashboard → Settings → Root Directory = `frontend`
3. **Redeploy** → Trigger new deployment
4. **Verify** → Check if 404 error resolved

---

## 7. **Verification**

Setelah fix:
- ✅ Root page (`/`) should load
- ✅ `/login` should work
- ✅ `/admin` should work
- ✅ `/student` should work
- ✅ `/api/health` should work
