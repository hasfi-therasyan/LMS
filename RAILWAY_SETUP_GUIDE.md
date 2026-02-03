# Railway Setup Guide - Step by Step

## 🚀 Quick Start

### Step 1: Login ke Railway

1. Buka https://railway.app
2. Klik **"Login"** → Pilih **"Login with GitHub"**
3. Authorize Railway untuk akses GitHub repositories
4. Selesai! Anda akan masuk ke Railway Dashboard

---

### Step 2: Create New Project

1. Di Railway Dashboard, klik **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Pilih repository: `hasfi-therasyan/LMS`
4. Railway akan mulai scan repository

---

### Step 3: Railway Auto-Detection

Railway akan auto-detect 2 services:

1. **Frontend Service** (Next.js)
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-detect)
   - Start Command: `npm start` (auto-detect)

2. **Backend Service** (Node.js/Express)
   - Root Directory: `api` atau `backend`
   - Start Command: `node index.js` atau `npm start` (auto-detect)

**Note:** Railway akan otomatis detect, tapi kita perlu configure manual untuk memastikan benar.

---

### Step 4: Configure Frontend Service

1. Railway akan create service untuk `frontend/`
2. Klik service **"frontend"** → **Settings**
3. **Root Directory:** `frontend` (sudah auto-detect)
4. **Build Command:** `npm install && npm run build` (atau biarkan auto-detect)
5. **Start Command:** `npm start` (atau biarkan auto-detect)

**Environment Variables:**
- Klik tab **"Variables"**
- Add variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
  NEXT_PUBLIC_API_URL= (akan di-set setelah backend deploy)
  NODE_ENV=production
  ```

---

### Step 5: Configure Backend Service

**Option A: Use `api/` directory (Recommended)**

1. Railway akan create service untuk `api/`
2. Klik service **"api"** → **Settings**
3. **Root Directory:** `api` (sudah auto-detect)
4. **Start Command:** `node index.js` (atau `npm start`)

**Environment Variables:**
- Klik tab **"Variables"**
- Add variables:
  ```
  SUPABASE_URL=https://xxxxx.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
  SUPABASE_ANON_KEY=eyJhbGc...
  GEMINI_API_KEY=AIza...
  FRONTEND_URL= (akan di-set setelah frontend deploy)
  NODE_ENV=production
  PORT=3001 (optional, Railway akan set otomatis)
  ```

**Option B: Use `backend/` directory**

1. Jika Railway tidak detect `api/`, tambahkan service baru:
   - Klik **"New"** → **"GitHub Repo"**
   - Pilih repository: `hasfi-therasyan/LMS`
   - **Root Directory:** `backend`
   - **Start Command:** `npm start` atau `node dist/index.js`

---

### Step 6: Deploy Services

1. **Deploy Backend First:**
   - Klik service **"api"** (atau **"backend"**)
   - Klik **"Deploy"** atau tunggu auto-deploy
   - Tunggu build selesai
   - Copy **Public URL** (e.g., `https://api-production.up.railway.app`)

2. **Update Frontend Environment Variables:**
   - Klik service **"frontend"** → **Variables**
   - Update `NEXT_PUBLIC_API_URL` dengan backend URL:
     ```
     NEXT_PUBLIC_API_URL=https://api-production.up.railway.app
     ```

3. **Update Backend Environment Variables:**
   - Klik service **"api"** → **Variables**
   - Update `FRONTEND_URL` dengan frontend URL:
     ```
     FRONTEND_URL=https://frontend-production.up.railway.app
     ```

4. **Deploy Frontend:**
   - Klik service **"frontend"**
   - Klik **"Redeploy"** untuk apply environment variables baru
   - Tunggu build selesai

---

### Step 7: Generate Public URLs

1. **Frontend Service:**
   - Klik service **"frontend"** → **Settings**
   - Tab **"Networking"**
   - Klik **"Generate Domain"** untuk public URL
   - Copy URL (e.g., `https://frontend-production.up.railway.app`)

2. **Backend Service:**
   - Klik service **"api"** → **Settings**
   - Tab **"Networking"**
   - Klik **"Generate Domain"** untuk public URL
   - Copy URL (e.g., `https://api-production.up.railway.app`)

---

### Step 8: Update Environment Variables

Setelah dapat URLs, update environment variables:

**Frontend Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_API_URL=https://api-production.up.railway.app
NODE_ENV=production
```

**Backend Variables:**
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_ANON_KEY=eyJhbGc...
GEMINI_API_KEY=AIza...
FRONTEND_URL=https://frontend-production.up.railway.app
NODE_ENV=production
```

**Important:** Setelah update variables, **Redeploy** kedua services!

---

## 🔧 Manual Configuration (Jika Auto-Detect Tidak Bekerja)

### Frontend Service

1. **New Service** → **GitHub Repo**
2. **Repository:** `hasfi-therasyan/LMS`
3. **Root Directory:** `frontend`
4. **Build Command:** `npm install && npm run build`
5. **Start Command:** `npm start`
6. **Output Directory:** `.next` (optional)

### Backend Service

1. **New Service** → **GitHub Repo**
2. **Repository:** `hasfi-therasyan/LMS`
3. **Root Directory:** `api` (atau `backend`)
4. **Build Command:** `npm install` (optional, jika perlu build)
5. **Start Command:** `node index.js` (untuk `api/`) atau `npm start` (untuk `backend/`)

---

## 📝 Environment Variables Checklist

### Frontend Service Variables:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_API_URL` (backend Railway URL)
- [ ] `NODE_ENV=production`

### Backend Service Variables:
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `GEMINI_API_KEY`
- [ ] `FRONTEND_URL` (frontend Railway URL)
- [ ] `NODE_ENV=production`
- [ ] `PORT` (optional, Railway akan set otomatis)

---

## ✅ Testing After Deploy

1. **Frontend:**
   - Buka frontend URL: `https://frontend-production.up.railway.app`
   - Test login, navigation, dll

2. **Backend:**
   - Test health check: `https://api-production.up.railway.app/health`
   - Should return: `{ status: 'ok', timestamp: '...' }`

3. **API Connection:**
   - Test API dari frontend
   - Check browser console untuk errors
   - Check Railway logs untuk backend errors

---

## 🔍 Troubleshooting

### 1. Build Failed
- **Check:** Railway logs untuk error message
- **Fix:** Pastikan semua dependencies terinstall
- **Fix:** Pastikan build command benar

### 2. Service Not Starting
- **Check:** Railway logs untuk error
- **Fix:** Pastikan start command benar
- **Fix:** Pastikan PORT environment variable (Railway akan set otomatis)

### 3. CORS Error
- **Check:** Backend logs untuk CORS error
- **Fix:** Pastikan `FRONTEND_URL` di-set dengan benar di backend
- **Fix:** Pastikan frontend URL ada di `allowedOrigins` di backend

### 4. API Not Connecting
- **Check:** `NEXT_PUBLIC_API_URL` di frontend sudah di-set
- **Check:** Backend URL benar dan accessible
- **Check:** Railway logs untuk connection errors

### 5. Environment Variables Not Working
- **Check:** Variables sudah di-set di Railway Dashboard
- **Fix:** Redeploy service setelah update variables
- **Fix:** Pastikan variable names benar (case-sensitive)

---

## 🎯 Quick Commands (Railway CLI - Optional)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

# View logs
railway logs

# Set environment variable
railway variables set KEY=value
```

---

## 📊 Railway vs Vercel

| Feature | Vercel | Railway |
|---------|--------|---------|
| **Setup** | Perlu `vercel.json` | Auto-detect |
| **Monorepo** | Manual config | Auto-detect |
| **Backend** | Serverless function | Standalone service |
| **URLs** | Same domain (`/api`) | Separate URLs |
| **Environment** | Dashboard | Dashboard |
| **Free Tier** | Limited | $5/month credit |

---

## ✅ Status: Siap Deploy!

Semua konfigurasi sudah siap. Ikuti step-by-step di atas untuk deploy ke Railway!
