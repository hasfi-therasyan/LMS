# 📝 Panduan Update FRONTEND_URL di Vercel

## 🎯 Tujuan
Update environment variable `FRONTEND_URL` dengan URL Vercel Anda.

---

## 📋 Langkah-Langkah Detail

### **Step 1: Buka Vercel Dashboard**

1. Buka browser dan kunjungi: **https://vercel.com/dashboard**
2. Login ke akun Vercel Anda (jika belum login)
3. Setelah login, Anda akan melihat daftar projects

---

### **Step 2: Pilih Project LMS**

1. Di dashboard, cari project **LMS** (atau nama project Anda)
2. Klik pada project tersebut untuk membuka detail project

---

### **Step 3: Buka Settings**

1. Di halaman project, Anda akan melihat beberapa tab di bagian atas:
   - **Overview**
   - **Deployments**
   - **Analytics**
   - **Settings** ← **KLIK INI**
   - **Domains**
   - dll.

2. Klik tab **"Settings"**

---

### **Step 4: Buka Environment Variables**

1. Di halaman Settings, scroll ke bawah
2. Di sidebar kiri (atau di bagian tengah), cari section **"Environment Variables"**
3. Klik pada **"Environment Variables"** atau **"Add New"**

---

### **Step 5: Tambahkan/Edit FRONTEND_URL**

**Jika `FRONTEND_URL` belum ada:**

1. Klik tombol **"Add New"** atau **"Add Environment Variable"**
2. Di form yang muncul:
   - **Key**: Masukkan `FRONTEND_URL` (huruf besar semua)
   - **Value**: Masukkan `https://lms-blush-nine.vercel.app`
   - **Environment**: Pilih **Production** (dan **Preview** jika perlu)
3. Klik **"Save"**

**Jika `FRONTEND_URL` sudah ada:**

1. Cari `FRONTEND_URL` di daftar environment variables
2. Klik pada row tersebut (atau klik icon edit/pencil)
3. Update **Value** dengan: `https://lms-blush-nine.vercel.app`
4. Pastikan **Environment** sudah dipilih **Production**
5. Klik **"Save"** atau **"Update"**

---

### **Step 6: Redeploy**

Setelah save, Vercel akan menampilkan notifikasi atau popup yang menanyakan apakah Anda ingin redeploy:

1. **Jika ada popup "Redeploy?":**
   - Klik **"Redeploy"** atau **"Yes"**
   - Tunggu deployment selesai (2-3 menit)

2. **Jika tidak ada popup:**
   - Buka tab **"Deployments"**
   - Klik **"..."** (three dots) pada deployment terbaru
   - Pilih **"Redeploy"**
   - Tunggu deployment selesai

---

## 🖼️ Visual Guide (Text-Based)

```
Vercel Dashboard
├── Projects List
│   └── [LMS Project] ← KLIK INI
│       ├── Overview
│       ├── Deployments
│       ├── Analytics
│       ├── Settings ← KLIK INI
│       │   ├── General
│       │   ├── Environment Variables ← KLIK INI
│       │   │   └── [Add New] atau [Edit FRONTEND_URL]
│       │   │       ├── Key: FRONTEND_URL
│       │   │       ├── Value: https://lms-blush-nine.vercel.app
│       │   │       └── Environment: Production ✓
│       │   ├── Domains
│       │   └── ...
│       └── ...
```

---

## ✅ Checklist

Pastikan Anda sudah melakukan:

- [ ] Login ke Vercel Dashboard
- [ ] Buka project LMS
- [ ] Buka tab Settings
- [ ] Buka Environment Variables
- [ ] Tambahkan/Edit `FRONTEND_URL`
- [ ] Set Value: `https://lms-blush-nine.vercel.app`
- [ ] Pilih Environment: **Production**
- [ ] Klik Save
- [ ] Redeploy aplikasi

---

## 🐛 Troubleshooting

### **Tidak menemukan tab Settings?**
- Pastikan Anda sudah membuka project (bukan dashboard utama)
- Pastikan Anda adalah owner/admin project
- Coba refresh halaman

### **Tidak menemukan Environment Variables?**
- Scroll ke bawah di halaman Settings
- Cari di sidebar kiri
- Atau gunakan Ctrl+F untuk search "Environment"

### **Tidak bisa edit FRONTEND_URL?**
- Pastikan Anda adalah owner/admin project
- Coba logout dan login lagi
- Cek apakah ada permission issues

### **Value tidak tersimpan?**
- Pastikan tidak ada spasi di awal/akhir value
- Pastikan URL lengkap dengan `https://`
- Pastikan sudah klik Save
- Cek apakah ada error message

### **Tidak ada tombol Redeploy?**
- Buka tab Deployments
- Klik "..." pada deployment terbaru
- Pilih "Redeploy"
- Atau tunggu auto-redeploy (jika enabled)

---

## 📝 Catatan Penting

1. **URL harus lengkap:**
   - ✅ Benar: `https://lms-blush-nine.vercel.app`
   - ❌ Salah: `lms-blush-nine.vercel.app` (tanpa https://)
   - ❌ Salah: `http://lms-blush-nine.vercel.app` (pakai http, bukan https)

2. **Environment harus Production:**
   - Pastikan checkbox **Production** sudah dicentang
   - Bisa juga centang **Preview** jika perlu

3. **Case-sensitive:**
   - Key harus: `FRONTEND_URL` (huruf besar semua)
   - Bukan: `frontend_url` atau `Frontend_Url`

---

## 🆘 Masih Stuck?

Jika masih stuck, coba:

1. **Screenshot error:**
   - Ambil screenshot halaman Vercel Dashboard
   - Atau screenshot error message (jika ada)

2. **Cek URL:**
   - Pastikan URL Vercel Dashboard: `https://vercel.com/dashboard`
   - Pastikan sudah login

3. **Alternatif:**
   - Coba akses langsung: `https://vercel.com/[username]/[project-name]/settings/environment-variables`
   - Ganti `[username]` dan `[project-name]` dengan yang sesuai

4. **Kontak support:**
   - Vercel Support: https://vercel.com/support
   - Atau cek dokumentasi: https://vercel.com/docs

---

## ✅ Verifikasi

Setelah update, verifikasi:

1. **Cek Environment Variables:**
   - Buka Settings → Environment Variables
   - Pastikan `FRONTEND_URL` ada dengan value yang benar

2. **Cek Deployment:**
   - Buka tab Deployments
   - Pastikan ada deployment baru setelah update
   - Pastikan deployment berhasil (status: Ready)

3. **Test Aplikasi:**
   - Buka: `https://lms-blush-nine.vercel.app`
   - Test login
   - Cek browser console (F12) untuk errors
   - Pastikan tidak ada CORS errors

---

**Jika masih stuck, beri tahu saya di step mana yang bermasalah!** 🆘
