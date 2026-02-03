# 🔄 Fix Vercel Auto-Deploy dari GitHub

## 🔍 Masalah: Vercel Tidak Auto-Deploy

Jika Vercel tidak terdeteksi dan tidak auto-deploy ketika Anda push ke GitHub, berikut adalah solusinya:

---

## 🎯 Solusi 1: Connect GitHub Repository ke Vercel

### **Step 1: Buka Vercel Dashboard**

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Login ke akun Anda

### **Step 2: Import Project dari GitHub**

1. Klik **"Add New..."** → **"Project"**
2. Pilih **"Import Git Repository"**
3. Pilih **"GitHub"** sebagai Git provider
4. **Authorize Vercel** untuk akses GitHub (jika belum)
5. Cari repository Anda: `hasfi-therasyan/LMS`
6. Klik **"Import"**

### **Step 3: Configure Project**

1. **Project Name**: `lms` atau `smartlms`
2. **Framework Preset**: Pilih **"Other"** atau **"Next.js"**
3. **Root Directory**: Biarkan kosong (atau `./` jika monorepo)
4. **Build Command**: 
   ```
   cd frontend && npm run build
   ```
5. **Output Directory**: 
   ```
   frontend/.next
   ```
6. **Install Command**: 
   ```
   npm install --prefix api && npm install --prefix frontend
   ```

### **Step 4: Add Environment Variables**

1. Klik **"Environment Variables"**
2. Tambahkan semua environment variables yang diperlukan:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (biarkan kosong untuk production)
   - `FRONTEND_URL`
   - dll.

### **Step 5: Deploy**

1. Klik **"Deploy"**
2. Vercel akan otomatis:
   - Clone repository
   - Install dependencies
   - Build project
   - Deploy

**Setelah ini, setiap push ke GitHub akan trigger auto-deploy!**

---

## 🎯 Solusi 2: Cek GitHub Integration

### **Step 1: Cek GitHub App Installation**

1. Buka [GitHub Settings](https://github.com/settings/installations)
2. Cari **"Vercel"** di list installed apps
3. Pastikan status **"Configured"**
4. Klik **"Configure"** untuk cek permissions

### **Step 2: Cek Repository Access**

1. Di GitHub App settings untuk Vercel
2. Pastikan repository `hasfi-therasyan/LMS` ada di list
3. Jika tidak ada, klik **"Configure"** dan pilih repository

### **Step 3: Re-authorize (Jika Perlu)**

1. Buka Vercel Dashboard → Settings → Git
2. Klik **"Disconnect"** pada GitHub
3. Klik **"Connect Git Provider"** lagi
4. Pilih **"GitHub"** dan authorize

---

## 🎯 Solusi 3: Cek Webhook Configuration

### **Step 1: Cek Webhook di GitHub**

1. Buka repository di GitHub: `https://github.com/hasfi-therasyan/LMS`
2. Klik **Settings** → **Webhooks**
3. Cari webhook dari Vercel (biasanya URL: `https://api.vercel.com/v1/integrations/github/...`)
4. Pastikan status **"Active"** (hijau)

### **Step 2: Test Webhook**

1. Klik pada webhook Vercel
2. Scroll ke bawah ke **"Recent Deliveries"**
3. Cek apakah ada recent deliveries
4. Jika ada error, klik pada delivery untuk lihat detail

### **Step 3: Re-create Webhook (Jika Perlu)**

Jika webhook tidak ada atau error:
1. Di Vercel Dashboard → Project → Settings → Git
2. Klik **"Disconnect"** lalu **"Connect"** lagi
3. Ini akan re-create webhook

---

## 🎯 Solusi 4: Cek Branch Configuration

### **Step 1: Cek Production Branch**

1. Buka Vercel Dashboard → Project → Settings → Git
2. Cek **"Production Branch"**
3. Pastikan set ke **"main"** (atau branch yang Anda gunakan)

### **Step 2: Cek Branch Protection**

1. Di GitHub repository → Settings → Branches
2. Cek apakah ada branch protection rules
3. Pastikan Vercel webhook tidak diblokir

---

## 🎯 Solusi 5: Manual Trigger Deploy

### **Via Vercel Dashboard:**

1. Buka Vercel Dashboard → Project → Deployments
2. Klik **"Redeploy"** pada deployment terbaru
3. Atau klik **"Deploy"** → **"Deploy from Git"**

### **Via Git Push (Test):**

```bash
# Buat perubahan kecil
echo "# Test auto-deploy" >> README.md

# Commit dan push
git add README.md
git commit -m "test: Trigger auto-deploy"
git push origin main
```

Setelah push, cek Vercel Dashboard → Deployments untuk melihat deployment baru.

---

## 🔍 Troubleshooting

### **Problem 1: "Repository not found"**

**Solution:**
1. Pastikan repository adalah public, atau
2. Pastikan Vercel punya akses ke private repository
3. Re-authorize GitHub integration

### **Problem 2: "Webhook not receiving events"**

**Solution:**
1. Cek GitHub webhook settings
2. Pastikan webhook URL benar
3. Test webhook delivery
4. Re-create webhook jika perlu

### **Problem 3: "Build fails"**

**Solution:**
1. Cek build logs di Vercel Dashboard
2. Pastikan semua dependencies terinstall
3. Pastikan build command benar
4. Cek environment variables

### **Problem 4: "No deployments created"**

**Solution:**
1. Cek branch configuration
2. Pastikan push ke branch yang benar (main/master)
3. Cek GitHub webhook deliveries
4. Re-connect Git integration

---

## ✅ Checklist Auto-Deploy

Pastikan semua ini sudah benar:

- [ ] Repository terhubung di Vercel Dashboard
- [ ] GitHub App terinstall dan authorized
- [ ] Webhook aktif di GitHub
- [ ] Production branch set ke "main" (atau branch yang benar)
- [ ] Environment variables sudah di-set
- [ ] Build command dan output directory benar
- [ ] `vercel.json` ada dan benar
- [ ] Push ke branch yang benar (main/master)

---

## 🚀 Quick Fix (Step-by-Step)

1. **Buka Vercel Dashboard** → Add New Project
2. **Import dari GitHub** → Pilih repository `hasfi-therasyan/LMS`
3. **Configure project**:
   - Framework: Other
   - Root Directory: `./`
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/.next`
4. **Add environment variables** (semua yang diperlukan)
5. **Deploy**
6. **Test**: Push perubahan kecil ke GitHub
7. **Cek**: Vercel Dashboard → Deployments (harus ada deployment baru)

---

## 📝 Verifikasi Auto-Deploy Bekerja

Setelah setup, test dengan:

```bash
# Buat perubahan kecil
echo "<!-- Test -->" >> frontend/src/app/layout.tsx

# Commit dan push
git add .
git commit -m "test: Verify auto-deploy"
git push origin main
```

**Cek Vercel Dashboard → Deployments** dalam 1-2 menit. Harus ada deployment baru muncul otomatis!

---

## 🆘 Jika Masih Tidak Bekerja

1. **Cek Vercel Dashboard** → Project → Settings → Git
   - Pastikan repository terhubung
   - Pastikan branch benar

2. **Cek GitHub** → Repository → Settings → Webhooks
   - Pastikan webhook Vercel aktif
   - Cek recent deliveries untuk error

3. **Contact Vercel Support** jika masih stuck

---

**Note:** Setelah project terhubung dengan benar, setiap push ke branch `main` akan otomatis trigger deployment baru di Vercel!
