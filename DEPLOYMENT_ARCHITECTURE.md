# 🏗️ Arsitektur Deployment LMS

## ✅ **Konsep Utama: Services Terpisah**

### **Yang TETAP SAMA, Tidak Peduli Platform Deployment:**

1. **🗄️ Database: Supabase** (Selalu)
   - PostgreSQL database
   - Supabase Auth
   - Supabase Storage
   - **Lokasi**: Cloud Supabase (terpisah dari deployment)

2. **🤖 AI: Google Gemini API** (Selalu)
   - Gemini 2.0 Flash Lite
   - **Lokasi**: Google Cloud (terpisah dari deployment)

3. **📦 File Storage: Supabase Storage** (Selalu)
   - Buckets: `jobsheets`, `jobsheet-assignments`, dll
   - **Lokasi**: Cloud Supabase (terpisah dari deployment)

---

## 🎯 **Platform Deployment: Vercel (Full Stack)**

### **Frontend & Backend di-deploy di:**

| Platform | Frontend | Backend | Keterangan |
|----------|----------|---------|------------|
| **Vercel** | ✅ Next.js | ✅ Vercel Functions | Full stack di satu platform |

**Semua tetap connect ke:**
- ✅ Supabase (Database + Storage)
- ✅ Google Gemini API (AI)

---

## 📊 **Diagram Arsitektur**

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL PLATFORM                         │
│  ┌──────────────────┐         ┌──────────────────┐       │
│  │   FRONTEND       │         │    BACKEND       │       │
│  │   (Next.js)      │◄───────►│  (Express API)   │       │
│  │                  │  HTTP   │  (Serverless)     │       │
│  │  - Vercel       │         │  - Vercel Func   │       │
│  └──────────────────┘         └──────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│   SUPABASE       │                  │  GOOGLE GEMINI   │
│                  │                  │      API        │
│  - PostgreSQL    │                  │                  │
│  - Auth          │                  │  - AI Chatbot    │
│  - Storage       │                  │  - Text Gen      │
│                  │                  │                  │
│  (Cloud Service) │                  │  (Cloud Service) │
└──────────────────┘                  └──────────────────┘
```

---

## 🔗 **Koneksi Services**

### **1. Frontend → Backend**
```
Frontend (Vercel) 
  └─► HTTP Request (/api/*)
      └─► Backend (Vercel Serverless Functions)
```

### **2. Backend → Supabase**
```
Backend 
  └─► Supabase Client (SDK)
      └─► Supabase Cloud
          ├─► PostgreSQL Database
          ├─► Supabase Auth
          └─► Supabase Storage
```

### **3. Backend → Gemini API**
```
Backend 
  └─► Google Gemini SDK
      └─► Google Gemini API (Cloud)
          └─► AI Response
```

### **4. Frontend → Supabase (Direct)**
```
Frontend 
  └─► Supabase Client (SDK)
      └─► Supabase Cloud
          ├─► Auth (Login/Register)
          └─► Storage (Direct Upload - Optional)
```

---

## 🔑 **Environment Variables**

### **Yang SELALU DIPERLUKAN:**

#### **Backend (Vercel):**
```env
# Supabase (Database + Storage)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Google Gemini (AI)
GEMINI_API_KEY=your-gemini-api-key

# Frontend URL (untuk CORS)
FRONTEND_URL=https://your-app.vercel.app

# Environment
NODE_ENV=production
MAX_FILE_SIZE=10485760
```

#### **Frontend (Vercel):**
```env
# Supabase (Auth + Direct Access)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Maintenance Mode
MAINTENANCE_MODE=false

# Note: NEXT_PUBLIC_API_URL tidak perlu di-set
# Frontend akan menggunakan relative path /api
```

---

## ✅ **Kesimpulan**

### **Yang TIDAK BERUBAH:**
- ✅ **Database**: Selalu Supabase
- ✅ **AI**: Selalu Google Gemini API
- ✅ **Storage**: Selalu Supabase Storage
- ✅ **Auth**: Selalu Supabase Auth

### **Platform Deployment:**
- 🎯 **Vercel Full Stack**: Frontend + Backend dalam satu project

### **Mengapa?**
Karena Supabase dan Gemini adalah **cloud services terpisah** yang diakses via API. Mereka tidak tergantung pada platform deployment.

---

## 🎯 **Contoh: Vercel Full Stack**

```
┌─────────────────────────────────────┐
│         VERCEL PLATFORM             │
│  ┌──────────────┐  ┌─────────────┐ │
│  │  Frontend    │  │  Backend    │ │
│  │  (Next.js)   │  │  (Functions)│ │
│  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────┘
         │                    │
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│   SUPABASE      │  │  GOOGLE GEMINI  │
│   (Database)    │  │  (AI API)       │
└─────────────────┘  └─────────────────┘
```

**Semua tetap connect ke Supabase dan Gemini!**

---

## 📝 **FAQ**

### **Q: Apakah database akan berubah jika deploy ke Vercel?**
**A:** Tidak. Database tetap Supabase, tidak peduli di mana di-deploy.

### **Q: Apakah AI akan berubah jika deploy ke Vercel?**
**A:** Tidak. AI tetap Google Gemini API, tidak peduli di mana backend di-deploy.

### **Q: Apakah perlu setup Supabase lagi jika deploy ke Vercel?**
**A:** Tidak. Supabase project yang sama digunakan, hanya perlu set environment variables di Vercel.

### **Q: Apakah perlu setup Gemini API lagi jika deploy ke Vercel?**
**A:** Tidak. Gemini API key yang sama digunakan, hanya perlu set environment variable di Vercel.

### **Q: Apakah data akan hilang jika pindah platform?**
**A:** Tidak. Data tetap di Supabase, tidak peduli di mana aplikasi di-deploy.

---

## ✅ **Summary**

**Platform deployment hanya untuk hosting kode aplikasi.**

**Services terpisah (Supabase, Gemini) tetap sama dan diakses via API.**

**Tidak ada perubahan pada database atau AI saat deploy ke Vercel.**
