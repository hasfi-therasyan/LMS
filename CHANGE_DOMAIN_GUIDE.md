# 🌐 Panduan Mengubah Domain ke smartlms.vercel.app

## 📋 Step-by-Step Guide

### **Step 1: Buka Vercel Dashboard**

1. Buka browser dan kunjungi: **https://vercel.com/dashboard**
2. Login ke akun Vercel Anda
3. Pilih project **LMS** (atau nama project Anda)

---

### **Step 2: Buka Settings → Domains**

1. Di halaman project, klik tab **"Settings"** (di bagian atas)
2. Scroll ke bawah atau cari di sidebar kiri
3. Klik **"Domains"** atau **"Domains & SSL"**

---

### **Step 3: Hapus Domain Lama (Optional)**

**Jika domain lama masih ada:**

1. Di daftar domains, cari `lms-blush-nine.vercel.app`
2. Klik **"..."** (three dots) di sebelah domain tersebut
3. Pilih **"Remove"** atau **"Delete"**
4. Konfirmasi penghapusan

**Catatan:** Domain lama akan tetap bisa diakses sampai domain baru aktif. Tidak perlu dihapus jika tidak mengganggu.

---

### **Step 4: Tambahkan Domain Baru**

1. Di halaman Domains, klik tombol **"Add Domain"** atau **"Add"**
2. Di input field, masukkan: **`smartlms.vercel.app`**
3. Klik **"Add"** atau **"Continue"**
4. Vercel akan otomatis verify dan setup domain

**Catatan:** 
- Domain `smartlms.vercel.app` adalah Vercel subdomain, jadi tidak perlu verifikasi DNS
- Domain akan langsung aktif dalam beberapa detik

---

### **Step 5: Update Environment Variables**

**PENTING:** Update `FRONTEND_URL` di Environment Variables!

1. Masih di halaman Settings, klik **"Environment Variables"**
2. Cari variable `FRONTEND_URL`
3. Klik untuk edit
4. Update value menjadi: **`https://smartlms.vercel.app`**
5. Pastikan Environment: **Production, Preview, Development** (centang semua)
6. Klik **"Save"**

---

### **Step 6: Redeploy Aplikasi**

Setelah update `FRONTEND_URL`, Vercel akan tanya apakah mau redeploy:

1. **Jika ada popup "Redeploy?":**
   - Klik **"Redeploy"** atau **"Yes"**
   - Tunggu deployment selesai (2-3 menit)

2. **Jika tidak ada popup:**
   - Buka tab **"Deployments"**
   - Klik **"..."** pada deployment terbaru
   - Pilih **"Redeploy"**
   - Tunggu deployment selesai

---

### **Step 7: Verifikasi Domain Baru**

1. Buka browser dan kunjungi: **`https://smartlms.vercel.app`**
2. Pastikan aplikasi load dengan benar
3. Test login dan fitur utama
4. Cek browser console (F12) untuk errors

---

## ✅ Checklist

Setelah selesai, pastikan:

- [ ] Domain baru `smartlms.vercel.app` sudah ditambahkan di Vercel
- [ ] `FRONTEND_URL` sudah di-update ke `https://smartlms.vercel.app`
- [ ] Sudah redeploy setelah update environment variable
- [ ] Domain baru bisa diakses di browser
- [ ] Aplikasi berfungsi dengan baik di domain baru
- [ ] Tidak ada CORS errors di browser console

---

## 🔗 Links Penting

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Domain Baru**: https://smartlms.vercel.app
- **Domain Lama**: https://lms-blush-nine.vercel.app (masih bisa diakses)

---

## 📝 Catatan

1. **Domain Lama Masih Aktif:**
   - Domain lama `lms-blush-nine.vercel.app` masih bisa diakses
   - Tidak perlu dihapus jika tidak mengganggu
   - Bisa dihapus nanti jika sudah tidak diperlukan

2. **Vercel Subdomain:**
   - `smartlms.vercel.app` adalah Vercel subdomain
   - Tidak perlu setup DNS atau verifikasi
   - Langsung aktif setelah ditambahkan

3. **Custom Domain (Jika Beli Domain):**
   - Jika nanti beli domain seperti `smartlms.com`
   - Bisa ditambahkan di halaman Domains yang sama
   - Perlu setup DNS records sesuai instruksi Vercel

---

## 🐛 Troubleshooting

### **Domain tidak bisa diakses?**
- Tunggu 1-2 menit untuk DNS propagation
- Clear browser cache (Ctrl+F5)
- Cek apakah domain sudah ditambahkan di Vercel Dashboard

### **CORS errors?**
- Pastikan `FRONTEND_URL` sudah di-update
- Pastikan sudah redeploy setelah update
- Cek backend logs di Vercel Dashboard → Functions

### **Domain tidak muncul di list?**
- Refresh halaman Vercel Dashboard
- Cek apakah domain sudah benar-benar ditambahkan
- Coba tambah ulang jika perlu

---

**Setelah selesai, aplikasi Anda akan bisa diakses di: `https://smartlms.vercel.app`** 🎉
