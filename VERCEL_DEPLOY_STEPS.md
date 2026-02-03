# 🚀 Urutan Deploy ke Vercel yang Benar

Panduan step-by-step yang jelas untuk deploy ke Vercel.

---

## ✅ Urutan yang Benar

### **Step 1: Set Environment Variables SEBELUM Deploy (Recommended)**

**KENAPA?** 
- Vercel akan menggunakan environment variables saat build
- Jika tidak di-set, build mungkin akan gagal atau aplikasi tidak berfungsi
- Lebih mudah set sekali di awal

**Yang Bisa Di-Set Sekarang:**
```env
# Supabase (Backend)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Supabase (Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=3001
NODE_ENV=production
MAX_FILE_SIZE=10485760

# API URL (kosongkan, akan pakai relative path)
NEXT_PUBLIC_API_URL=
```

**Yang BELUM Bisa Di-Set (Akan Di-Set Setelah Deploy):**
```env
FRONTEND_URL=https://your-app.vercel.app
```
*(Karena kita belum tahu URL-nya sebelum deploy)*

---

### **Step 2: Deploy Pertama Kali**

1. Import project di Vercel
2. Set environment variables (yang bisa di-set sekarang)
3. Klik "Deploy"
4. Tunggu build selesai
5. Vercel akan generate URL: `https://your-app.vercel.app`

---

### **Step 3: Update FRONTEND_URL Setelah Deploy**

1. Copy URL dari Vercel: `https://your-app.vercel.app`
2. Kembali ke Vercel Dashboard → Settings → Environment Variables
3. Update `FRONTEND_URL` dengan URL yang baru
4. Vercel akan auto-redeploy (atau klik "Redeploy")

---

## 📋 Checklist Lengkap

### **SEBELUM Deploy (Set Sekarang):**

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `GEMINI_API_KEY`
- [ ] `PORT=3001`
- [ ] `NODE_ENV=production`
- [ ] `MAX_FILE_SIZE=10485760`
- [ ] `NEXT_PUBLIC_API_URL=` (kosongkan)

### **SETELAH Deploy Pertama (Update):**

- [ ] `FRONTEND_URL=https://your-app.vercel.app` (update dengan URL Vercel)

---

## 🎯 Cara Set Environment Variables di Vercel

1. **Buka Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Pilih project Anda

2. **Masuk ke Settings:**
   - Klik "Settings" tab
   - Klik "Environment Variables" di sidebar

3. **Add Variables:**
   - Klik "Add New"
   - Masukkan Key dan Value
   - Pilih Environment: **Production, Preview, Development** (atau pilih sesuai kebutuhan)
   - Klik "Save"

4. **Redeploy (Jika Sudah Deploy):**
   - Setelah add/update variables, Vercel akan tanya apakah mau redeploy
   - Klik "Redeploy" untuk apply changes

---

## 💡 Tips

1. **Set Semua Sekarang:**
   - Set semua environment variables yang bisa di-set sekarang
   - Hanya `FRONTEND_URL` yang perlu di-update setelah deploy

2. **Copy-Paste dengan Hati-Hati:**
   - Pastikan tidak ada spasi di awal/akhir value
   - Pastikan tidak ada typo

3. **Test Setelah Deploy:**
   - Setelah deploy, test apakah aplikasi berfungsi
   - Jika ada error, cek logs di Vercel Dashboard

4. **Update FRONTEND_URL:**
   - Setelah deploy pertama, langsung update `FRONTEND_URL`
   - Ini penting untuk CORS configuration di backend

---

## 🐛 Troubleshooting

### **Error: "Environment variable not found"**
- Pastikan sudah di-set di Vercel Dashboard
- Pastikan sudah redeploy setelah set variables

### **Error: "CORS policy blocked"**
- Pastikan `FRONTEND_URL` sudah di-update dengan URL Vercel
- Pastikan URL sudah benar (dengan `https://`)

### **Error: "Failed to connect to database"**
- Cek `SUPABASE_URL` dan keys sudah benar
- Pastikan tidak ada typo

---

## ✅ Kesimpulan

**URUTAN YANG BENAR:**
1. ✅ Set environment variables SEBELUM deploy (kecuali `FRONTEND_URL`)
2. ✅ Deploy pertama kali
3. ✅ Update `FRONTEND_URL` setelah deploy
4. ✅ Redeploy (otomatis atau manual)

**TIDAK PERLU NUNGGU DEPLOY DULU!** Set environment variables sekarang, lalu deploy. Hanya `FRONTEND_URL` yang perlu di-update setelah deploy karena kita belum tahu URL-nya.
