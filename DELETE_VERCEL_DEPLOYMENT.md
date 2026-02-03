# 🗑️ Panduan Menghapus Deployment di Vercel

## 📋 Opsi Menghapus Deployment

Ada beberapa cara untuk menghapus deployment di Vercel:

---

## 🎯 Opsi 1: Hapus Deployment Tertentu (Recommended)

**Cara ini menghapus satu deployment tertentu tanpa menghapus project.**

### **Step 1: Buka Vercel Dashboard**

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Login ke akun Anda
3. Pilih project yang ingin dihapus deployment-nya

### **Step 2: Hapus Deployment**

1. Klik tab **"Deployments"**
2. Cari deployment yang ingin dihapus
3. Klik **"..."** (three dots) pada deployment tersebut
4. Pilih **"Delete"** atau **"Remove"**
5. Konfirmasi penghapusan

**Hasil:**
- ✅ Deployment tersebut akan dihapus
- ✅ Project tetap ada
- ✅ Deployment lain tetap ada
- ✅ Domain tetap terhubung (jika ada)

---

## 🎯 Opsi 2: Hapus Semua Deployment

**Cara ini menghapus semua deployment dari project.**

### **Step 1: Buka Project Settings**

1. Buka Vercel Dashboard
2. Pilih project
3. Klik **"Settings"** tab
4. Scroll ke bagian **"Deployments"**

### **Step 2: Hapus Semua Deployment**

1. Klik **"Delete All Deployments"**
2. Konfirmasi penghapusan
3. Masukkan nama project untuk konfirmasi

**Hasil:**
- ✅ Semua deployment akan dihapus
- ✅ Project tetap ada
- ✅ Domain tetap terhubung (jika ada)
- ✅ Bisa deploy ulang kapan saja

---

## 🎯 Opsi 3: Hapus Seluruh Project (Permanent)

**Cara ini menghapus project beserta semua deployment-nya. PERMANENT!**

### **Step 1: Buka Project Settings**

1. Buka Vercel Dashboard
2. Pilih project yang ingin dihapus
3. Klik **"Settings"** tab
4. Scroll ke bagian paling bawah

### **Step 2: Hapus Project**

1. Klik **"Delete Project"** (biasanya di bagian **"Danger Zone"**)
2. Masukkan nama project untuk konfirmasi
3. Klik **"Delete"**

**Hasil:**
- ⚠️ **PERMANENT**: Project dan semua deployment akan dihapus
- ⚠️ Domain akan terputus (jika ada)
- ⚠️ Environment variables akan dihapus
- ⚠️ Tidak bisa di-undo

---

## 🎯 Opsi 4: Hapus via Vercel CLI

**Cara ini menggunakan command line untuk menghapus deployment.**

### **Step 1: Install Vercel CLI (jika belum)**

```bash
npm i -g vercel
```

### **Step 2: Login**

```bash
vercel login
```

### **Step 3: Hapus Deployment**

```bash
# List deployments
vercel ls

# Remove specific deployment (ganti [deployment-url] dengan URL deployment)
vercel rm [deployment-url] --yes
```

---

## 📝 Checklist Sebelum Menghapus

Sebelum menghapus deployment, pastikan:

- [ ] Backup environment variables (jika perlu)
- [ ] Backup database (jika perlu)
- [ ] Catat domain yang terhubung (jika perlu)
- [ ] Pastikan tidak ada production traffic yang aktif
- [ ] Notify team members (jika project shared)

---

## ⚠️ Peringatan

### **Hapus Deployment Tertentu:**
- ✅ Safe - hanya menghapus satu deployment
- ✅ Project tetap ada
- ✅ Bisa deploy ulang

### **Hapus Semua Deployment:**
- ✅ Safe - hanya menghapus deployments
- ✅ Project tetap ada
- ✅ Bisa deploy ulang

### **Hapus Project:**
- ⚠️ **PERMANENT** - tidak bisa di-undo
- ⚠️ Semua data akan hilang
- ⚠️ Domain akan terputus

---

## 🔄 Cara Deploy Ulang Setelah Hapus

Jika Anda menghapus deployment dan ingin deploy ulang:

### **Via Git Push:**
```bash
git add .
git commit -m "Redeploy"
git push origin main
```
Vercel akan otomatis membuat deployment baru.

### **Via Vercel Dashboard:**
1. Buka project di Vercel Dashboard
2. Klik **"Deployments"** tab
3. Klik **"Redeploy"** pada deployment terbaru
4. Atau klik **"Deploy"** untuk deploy dari Git

### **Via Vercel CLI:**
```bash
vercel --prod
```

---

## 📋 Quick Reference

### **Hapus Deployment Tertentu:**
1. Dashboard → Project → Deployments
2. Klik "..." pada deployment
3. Pilih "Delete"
4. Konfirmasi

### **Hapus Semua Deployment:**
1. Dashboard → Project → Settings
2. Scroll ke "Deployments"
3. Klik "Delete All Deployments"
4. Konfirmasi

### **Hapus Project (Permanent):**
1. Dashboard → Project → Settings
2. Scroll ke "Danger Zone"
3. Klik "Delete Project"
4. Masukkan nama project
5. Konfirmasi

---

## ✅ Rekomendasi

**Untuk development/testing:**
- Gunakan **Opsi 1** (Hapus deployment tertentu)
- Atau **Opsi 2** (Hapus semua deployment)
- Project tetap ada untuk deploy ulang

**Untuk production cleanup:**
- Hapus deployment lama yang tidak digunakan
- Keep deployment terbaru yang aktif
- Jangan hapus project kecuali benar-benar tidak diperlukan

---

**Note:** Setelah menghapus deployment, Anda masih bisa deploy ulang kapan saja dengan push ke Git atau manual deploy dari dashboard.
