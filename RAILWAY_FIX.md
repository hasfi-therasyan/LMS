# Railway Build Error Fix

## 🔴 Error: `next: not found`

**Penyebab:**
Railway mencoba build dari root directory, tapi dependencies tidak terinstall di root.

**Solusi:**

### Option 1: Set Root Directory di Railway Dashboard (RECOMMENDED)

1. **Buka Railway Dashboard** → Pilih service **"frontend"**
2. **Settings** → **Root Directory**
3. Set ke: `frontend`
4. **Save**
5. **Redeploy**

Railway akan:
- Install dependencies di `frontend/`
- Build dari `frontend/`
- Start dari `frontend/`

### Option 2: Manual Service Configuration

1. **Buka Railway Dashboard** → Service **"frontend"**
2. **Settings** → **Build & Deploy**
3. **Root Directory:** `frontend`
4. **Build Command:** `npm install --include=dev && npm run build`
5. **Start Command:** `npm start`
6. **Save** → **Redeploy**

### Option 3: Use nixpacks.toml (Already Created)

Saya sudah membuat `frontend/nixpacks.toml` yang akan:
- Install Node.js 20
- Install dependencies (termasuk devDependencies)
- Build Next.js app
- Start with `npm start`

Railway akan auto-detect `nixpacks.toml` jika Root Directory = `frontend`.

---

## ✅ Checklist untuk Fix

1. [ ] **Root Directory** = `frontend` (di Railway Dashboard)
2. [ ] **Build Command** = `npm install --include=dev && npm run build` (atau biarkan auto)
3. [ ] **Start Command** = `npm start` (atau biarkan auto)
4. [ ] **nixpacks.toml** ada di `frontend/` (sudah dibuat)
5. [ ] **Redeploy** service setelah update settings

---

## 🔧 Quick Fix Steps

1. **Railway Dashboard** → Service **"frontend"**
2. **Settings** → **Root Directory** → Set: `frontend`
3. **Save**
4. **Deployments** → **Redeploy**

---

## 📝 Environment Variables

Pastikan environment variables sudah di-set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (setelah backend deploy)
- `NODE_ENV=production`

---

## 🎯 Expected Build Output

Setelah fix, build log harus menunjukkan:
```
✓ Installing dependencies
✓ Building Next.js app
✓ Build completed successfully
✓ Starting server
```
