# Manual Deploy ke Vercel - Step by Step Guide

## 🚀 Metode 1: Via Vercel Dashboard (Paling Mudah)

### Langkah-langkah:

1. **Buka Vercel Dashboard**
   - Login ke https://vercel.com
   - Pilih project Anda (LMS)

2. **Deploy dari GitHub**
   - Klik tab **"Deployments"** di sidebar kiri
   - Klik tombol **"Redeploy"** di deployment terbaru
   - Atau klik **"..."** (three dots) → **"Redeploy"**

3. **Atau Deploy Branch Baru**
   - Klik **"Deployments"** → **"Create Deployment"**
   - Pilih branch: `main`
   - Klik **"Deploy"**

---

## 🖥️ Metode 2: Via Vercel CLI (Command Line)

### Install Vercel CLI (jika belum):

```bash
npm install -g vercel
```

### Login ke Vercel:

```bash
vercel login
```

### Deploy dari Project Directory:

```bash
# Pastikan Anda di root directory project
cd C:\HASFI\WORK\LMS

# Deploy ke production
vercel --prod

# Atau deploy ke preview
vercel
```

### Deploy dengan Environment Variables:

```bash
vercel --prod --env SUPABASE_URL=your_url --env GEMINI_API_KEY=your_key
```

**Note:** Lebih baik set environment variables di Vercel Dashboard daripada via CLI.

---

## 🔧 Troubleshooting: Auto-Deploy Tidak Bekerja

### Cek GitHub Integration:

1. **Buka Vercel Dashboard**
   - Settings → **Git**
   - Pastikan **"Production Branch"** = `main`
   - Pastikan **"Auto-deploy"** = **Enabled**

2. **Cek GitHub Repository Connection**
   - Settings → **Git** → **Connected Git Repository**
   - Pastikan repository terhubung dengan benar
   - Jika tidak, klik **"Disconnect"** lalu **"Connect Git Repository"** lagi

3. **Cek GitHub Webhook**
   - Buka GitHub → Repository → **Settings** → **Webhooks**
   - Pastikan ada webhook dari Vercel
   - Jika tidak ada, Vercel akan membuatnya otomatis saat connect

### Reconnect GitHub Repository:

1. **Vercel Dashboard** → Settings → **Git**
2. Klik **"Disconnect"** (jika sudah connected)
3. Klik **"Connect Git Repository"**
4. Pilih repository: `hasfi-therasyan/LMS`
5. Pilih branch: `main`
6. Klik **"Connect"**

### Manual Trigger via GitHub:

Jika auto-deploy tidak bekerja, Anda bisa trigger manual dengan:
- Push commit baru ke GitHub
- Atau buat empty commit: `git commit --allow-empty -m "Trigger deploy" && git push`

---

## ✅ Checklist Sebelum Deploy:

1. ✅ **Environment Variables** sudah di-set di Vercel Dashboard
2. ✅ **Root Directory** = `frontend` (di Vercel Dashboard)
3. ✅ **GitHub Repository** terhubung dengan benar
4. ✅ **Branch** = `main` (production branch)
5. ✅ **vercel.json** sudah benar di root repository

---

## 📝 Environment Variables yang Harus Di-Set:

**Di Vercel Dashboard → Settings → Environment Variables:**

### Frontend:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (optional, kosongkan untuk same domain)

### Backend (Serverless Function):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `FRONTEND_URL` (e.g., `https://fliplearning.vercel.app`)
- `NODE_ENV=production`

**Penting:** 
- Set untuk **Production**, **Preview**, dan **Development** environments
- Atau set untuk **All Environments**

---

## 🎯 Quick Deploy Commands:

```bash
# 1. Install Vercel CLI (sekali saja)
npm install -g vercel

# 2. Login (sekali saja)
vercel login

# 3. Deploy ke production
cd C:\HASFI\WORK\LMS
vercel --prod

# 4. Atau deploy ke preview
vercel
```

---

## 🔍 Cek Status Deploy:

Setelah deploy, cek:
1. **Build Logs** di Vercel Dashboard → Deployments → Klik deployment terbaru
2. **Build Status**: Harus **"Ready"** (hijau)
3. **URL**: Klik URL untuk test deployment

---

## ⚠️ Common Issues:

### 1. Build Failed
- Cek Build Logs untuk error message
- Pastikan semua dependencies terinstall
- Pastikan environment variables sudah di-set

### 2. 404 Error
- Pastikan Root Directory = `frontend`
- Pastikan `vercel.json` ada di root repository
- Pastikan entry point (`frontend/src/app/page.tsx`) ada

### 3. API Not Working
- Pastikan `functions` path benar di `vercel.json`
- Pastikan `rewrites` configuration benar
- Pastikan backend environment variables sudah di-set

---

## 📞 Need Help?

Jika masih ada masalah:
1. Cek Build Logs di Vercel Dashboard
2. Cek Environment Variables sudah di-set
3. Cek GitHub integration status
4. Cek `vercel.json` configuration
