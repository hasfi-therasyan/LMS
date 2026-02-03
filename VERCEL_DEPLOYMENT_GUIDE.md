# 🚀 Panduan Deploy ke Vercel

Panduan lengkap step-by-step untuk deploy LMS ke Vercel.

## 📋 Prasyarat

1. ✅ Akun GitHub (sudah ada)
2. ✅ Akun Vercel (buat di https://vercel.com)
3. ✅ Akun Railway/Render untuk backend (opsional, jika backend terpisah)
4. ✅ Supabase project sudah setup
5. ✅ Gemini API key sudah ada

---

## 🎯 Opsi Deployment

### **Opsi 1: Frontend di Vercel + Backend di Railway (RECOMMENDED) ⭐**

Ini adalah opsi termudah dan tercepat. Tidak perlu migrate code.

### **Opsi 2: Full Stack di Vercel (Next.js API Routes)**

Lebih kompleks, perlu migrate backend Express ke Next.js API Routes.

---

## 🚀 Opsi 1: Frontend Vercel + Backend Railway

### **Step 1: Deploy Backend ke Railway**

1. **Sign up di Railway:**
   - Buka https://railway.app
   - Login dengan GitHub

2. **Create New Project:**
   - Klik "New Project"
   - Pilih "Deploy from GitHub repo"
   - Pilih repository `LMS`

3. **Configure Backend:**
   - Railway akan auto-detect Node.js
   - Set **Root Directory**: `backend`
   - Railway akan otomatis run `npm install` dan `npm start`

4. **Set Environment Variables di Railway:**
   
   Di Railway Dashboard → Project → Variables, tambahkan:
   
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_ANON_KEY=your_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   MAX_FILE_SIZE=10485760
   ```
   
   **Catatan:** `FRONTEND_URL` akan di-update setelah frontend di-deploy.

5. **Get Backend URL:**
   - Railway akan generate URL seperti: `https://your-backend.railway.app`
   - Copy URL ini untuk digunakan di frontend

---

### **Step 2: Deploy Frontend ke Vercel**

1. **Sign up di Vercel:**
   - Buka https://vercel.com
   - Login dengan GitHub

2. **Import Project:**
   - Klik "Add New..." → "Project"
   - Pilih repository `LMS`
   - Vercel akan auto-detect Next.js

3. **Configure Project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (auto-detect)
   - **Output Directory:** `.next` (auto-detect)
   - **Install Command:** `npm install` (auto-detect)

4. **Set Environment Variables di Vercel:**
   
   Di Vercel Dashboard → Project → Settings → Environment Variables, tambahkan:
   
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
   
   **PENTING:** Ganti `https://your-backend.railway.app` dengan URL backend dari Railway!

5. **Deploy:**
   - Klik "Deploy"
   - Tunggu build selesai (sekitar 2-5 menit)
   - Vercel akan generate URL seperti: `https://your-app.vercel.app`

6. **Update Backend CORS:**
   - Kembali ke Railway
   - Update `FRONTEND_URL` dengan URL Vercel yang baru
   - Restart backend di Railway

---

### **Step 3: Update Supabase CORS (Jika Perlu)**

1. Buka Supabase Dashboard
2. Settings → API
3. Pastikan CORS sudah allow domain Vercel dan Railway

---

## 🚀 Opsi 2: Full Stack di Vercel (Advanced)

Jika ingin semua di Vercel, perlu migrate backend ke Next.js API Routes.

**Catatan:** Ini memerlukan refactoring code yang cukup banyak. Lebih baik gunakan Opsi 1 jika ingin cepat.

---

## ✅ Checklist Setelah Deploy

- [ ] Backend URL bisa diakses: `https://your-backend.railway.app/health`
- [ ] Frontend bisa diakses: `https://your-app.vercel.app`
- [ ] Bisa login ke aplikasi
- [ ] Database connection berfungsi
- [ ] AI chatbot berfungsi
- [ ] File upload berfungsi
- [ ] Quiz submission berfungsi

---

## 🧪 Testing

1. **Test Login:**
   - Buka `https://your-app.vercel.app/login`
   - Coba login dengan akun yang sudah ada

2. **Test Database:**
   - Setelah login, cek apakah data ter-load
   - Cek apakah jobsheets, quizzes, dll muncul

3. **Test AI Chatbot:**
   - Submit quiz dengan jawaban salah
   - Cek apakah AI chatbot bisa respond

4. **Test File Upload:**
   - Upload jobsheet PDF
   - Upload assignment PDF
   - Cek apakah file tersimpan

---

## 🐛 Troubleshooting

### **Error: "Failed to connect to backend"**
- Cek `NEXT_PUBLIC_API_URL` sudah benar di Vercel
- Cek backend URL di Railway masih aktif
- Cek CORS configuration di backend

### **Error: "Failed to connect to database"**
- Cek `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah benar
- Cek Supabase project masih aktif

### **Error: "Failed to generate AI response"**
- Cek `GEMINI_API_KEY` sudah benar di Railway
- Cek API key tidak exceed quota

### **Build Error di Vercel**
- Cek `package.json` sudah benar
- Cek semua dependencies ter-install
- Cek TypeScript errors

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 💡 Tips

1. **Gunakan Environment Variables:**
   - Jangan hardcode API keys di code
   - Gunakan environment variables di Vercel dan Railway

2. **Monitor Logs:**
   - Vercel: Dashboard → Project → Logs
   - Railway: Dashboard → Project → Deployments → Logs

3. **Auto-Deploy:**
   - Vercel dan Railway akan auto-deploy setiap push ke GitHub
   - Pastikan branch yang di-deploy adalah `main`

4. **Custom Domain (Opsional):**
   - Vercel: Settings → Domains
   - Railway: Settings → Custom Domain

---

## 🎉 Selesai!

Setelah semua step selesai, aplikasi Anda akan live di:
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-backend.railway.app`

Selamat! 🎊
