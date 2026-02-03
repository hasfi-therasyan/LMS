# ✅ Post-Deployment Checklist

## 🎉 Build Berhasil!

URL Vercel Anda: **`https://lms-jydh-deoyz0ww0-hasfis-projects.vercel.app`**

---

## 📋 Checklist Setelah Deploy

### **1. Update FRONTEND_URL**

1. Buka **Vercel Dashboard** → **Project** → **Settings** → **Environment Variables**
2. Cari atau tambahkan variable `FRONTEND_URL`
3. Set value dengan URL lengkap:
   ```
   https://lms-jydh-deoyz0ww0-hasfis-projects.vercel.app
   ```
   **PENTING:** Pastikan ada `https://` di depan!
4. Pilih environment: **Production** (dan **Preview** jika perlu)
5. Klik **Save**

### **2. Redeploy**

Setelah update `FRONTEND_URL`, Vercel akan tanya apakah mau redeploy:
- Klik **"Redeploy"** untuk apply changes
- Atau tunggu auto-redeploy (jika enabled)

**Atau manual redeploy:**
- Buka **Deployments** tab
- Klik **"..."** pada deployment terbaru
- Pilih **"Redeploy"**

---

## ✅ Verifikasi Environment Variables

Pastikan semua environment variables sudah di-set:

```env
# Frontend (NEXT_PUBLIC_*)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL= (kosongkan atau biarkan kosong)

# Backend
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_api_key
PORT=3001
NODE_ENV=production
MAX_FILE_SIZE=10485760

# Frontend URL (UPDATE INI!)
FRONTEND_URL=https://lms-jydh-deoyz0ww0-hasfis-projects.vercel.app
```

---

## 🧪 Test Aplikasi

Setelah redeploy, test fitur-fitur berikut:

### **1. Test Homepage**
- Buka: `https://lms-jydh-deoyz0ww0-hasfis-projects.vercel.app`
- Pastikan halaman load tanpa error

### **2. Test Login**
- Buka: `https://lms-jydh-deoyz0ww0-hasfis-projects.vercel.app/login`
- Test login dengan akun yang ada
- Pastikan redirect ke dashboard sesuai role

### **3. Test Admin Dashboard**
- Login sebagai admin
- Test fitur:
  - ✅ Create Jobsheet
  - ✅ Create Quiz
  - ✅ View Assignments
  - ✅ View Grades
  - ✅ Export to Excel

### **4. Test Student Dashboard**
- Login sebagai student
- Test fitur:
  - ✅ View Jobsheets
  - ✅ Upload Assignments
  - ✅ Take Quiz
  - ✅ View Grades & Charts
  - ✅ AI Chatbot (setelah quiz)

### **5. Test API Endpoints**
- Buka browser console (F12)
- Cek Network tab untuk API calls
- Pastikan tidak ada CORS errors
- Pastikan API calls ke `/api/*` berhasil

---

## 🐛 Troubleshooting

### **Error: "CORS policy blocked"**
- Pastikan `FRONTEND_URL` sudah di-update dengan URL lengkap (dengan `https://`)
- Pastikan sudah redeploy setelah update `FRONTEND_URL`
- Cek backend logs di Vercel Dashboard → Functions

### **Error: "Failed to connect to database"**
- Cek `SUPABASE_URL` dan keys sudah benar
- Pastikan tidak ada typo
- Cek Supabase Dashboard untuk verify connection

### **Error: "Failed to generate AI response"**
- Cek `GEMINI_API_KEY` sudah benar
- Cek Gemini API quota di Google Cloud Console
- Cek backend logs untuk error details

### **Error: "Environment variable not found"**
- Pastikan semua env vars sudah di-set di Vercel
- Pastikan env vars di-set untuk **Production** environment
- Redeploy setelah set env vars

### **Pages tidak load / Blank page**
- Cek browser console untuk errors
- Cek Network tab untuk failed requests
- Cek Vercel logs untuk runtime errors

---

## 📊 Monitor Deployment

### **Vercel Dashboard**
- **Deployments**: Cek status deployment
- **Functions**: Cek backend API logs
- **Analytics**: Cek traffic dan performance

### **Browser Console**
- Buka browser console (F12)
- Cek untuk JavaScript errors
- Cek Network tab untuk API calls

### **Supabase Dashboard**
- Cek database connections
- Cek RLS policies
- Cek Storage buckets

---

## 🔗 Links Penting

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Google Cloud Console**: https://console.cloud.google.com/
- **Aplikasi Live**: https://lms-jydh-deoyz0ww0-hasfis-projects.vercel.app

---

## ✅ Next Steps

1. ✅ Update `FRONTEND_URL` di Environment Variables
2. ✅ Redeploy aplikasi
3. ✅ Test semua fitur utama
4. ✅ Monitor logs untuk errors
5. ✅ Share URL dengan tim/pengguna

---

## 🎯 Success Criteria

Aplikasi dianggap berhasil deploy jika:
- ✅ Homepage load tanpa error
- ✅ Login berfungsi
- ✅ Admin dashboard accessible
- ✅ Student dashboard accessible
- ✅ API endpoints berfungsi
- ✅ Database connection berhasil
- ✅ AI chatbot berfungsi
- ✅ File upload/download berfungsi

---

**Selamat! Aplikasi Anda sudah live di Vercel! 🚀**
