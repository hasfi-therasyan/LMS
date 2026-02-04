# Ringkasan Setup Vercel - LMS System

## ✅ Yang Sudah Selesai

### 1. Struktur File
- ✅ Config files dipindah ke `frontend/src/lib/api/config/`
- ✅ Middleware/helpers dipindah ke `frontend/src/lib/api/middleware/`
- ✅ Utilities dipindah ke `frontend/src/lib/api/utils/`
- ✅ API routes dibuat di `frontend/src/app/api/`

### 2. Dependencies
- ✅ `package.json` sudah diupdate dengan dependencies backend:
  - `@google/genai` - Gemini AI
  - `pdf-parse` - PDF extraction
  - `zod` - Validation

### 3. Vercel Configuration
- ✅ `vercel.json` sudah dikonfigurasi untuk Next.js
- ✅ Root directory: `frontend`
- ✅ Build command: `npm run build`
- ✅ Output directory: `.next`

### 4. API Routes yang Sudah Dibuat

#### Auth Routes
- ✅ `GET /api/auth/me` - Get current user profile
- ✅ `POST /api/auth/signup` - Sign up new student
- ✅ `POST /api/auth/create-admin` - Create admin account

#### Modules Routes
- ✅ `GET /api/modules` - Get all modules
- ✅ `POST /api/modules` - Upload module (Admin)
- ✅ `GET /api/modules/:id` - Get specific module

#### Quizzes Routes
- ✅ `GET /api/quizzes` - Get all quizzes
- ✅ `POST /api/quizzes` - Create quiz (Admin)
- ✅ `GET /api/quizzes/:id` - Get specific quiz
- ✅ `POST /api/quizzes/:id/submit` - Submit quiz (Student)
- ✅ `DELETE /api/quizzes/:id` - Delete quiz (Admin)

#### Admin Routes
- ✅ `GET /api/admin/users` - Get all users (Admin)

## ⚠️ Yang Masih Perlu Dibuat

### 1. AI Chat Routes
- `POST /api/ai/chat/start` - Start AI chat session
- `POST /api/ai/chat/:sessionId/message` - Send message
- `GET /api/ai/chat/:sessionId` - Get chat session

### 2. Jobsheet Routes
- `GET /api/jobsheet` - Get all jobsheets
- `POST /api/jobsheet` - Create jobsheet (Admin)
- `GET /api/jobsheet/:id` - Get specific jobsheet
- `DELETE /api/jobsheet/:id` - Delete jobsheet (Admin)

### 3. Submissions Routes
- `GET /api/submissions/quiz/:quizId` - Get quiz submissions
- `GET /api/submissions/analytics/:quizId` - Get quiz analytics
- `GET /api/submissions/student` - Get student submissions
- `GET /api/submissions/all` - Get all submissions

### 4. Jobsheet Submissions Routes
- `POST /api/jobsheet-submissions` - Submit jobsheet
- `GET /api/jobsheet-submissions/module/:moduleId` - Get module submissions
- `GET /api/jobsheet-submissions/student` - Get student submissions
- `PATCH /api/jobsheet-submissions/:submissionId/grade` - Grade submission

### 5. Jobsheet Assignments Routes
- `POST /api/jobsheet-assignments` - Upload assignment
- `GET /api/jobsheet-assignments/student` - Get student assignments
- `GET /api/jobsheet-assignments/jobsheet/:jobsheetId` - Get jobsheet assignments
- `GET /api/jobsheet-assignments/all` - Get all assignments
- `PUT /api/jobsheet-assignments/:assignmentId/grade` - Grade assignment
- `DELETE /api/jobsheet-assignments/:assignmentId` - Delete assignment

## 📋 Cara Menyelesaikan Route yang Masih Missing

### Pattern untuk Membuat Route Baru

1. **Buat file route** di `frontend/src/app/api/[path]/route.ts`
2. **Import dependencies**:
   ```typescript
   import { NextRequest } from 'next/server';
   import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
   import { supabase } from '@/lib/api/config/supabase';
   ```

3. **Export handler functions**:
   ```typescript
   export async function GET(request: NextRequest) { ... }
   export async function POST(request: NextRequest) { ... }
   ```

4. **Untuk file upload**, gunakan:
   ```typescript
   import { parseFormData, fileToBuffer, validateFileType, validateFileSize } from '@/lib/api/utils/fileUpload';
   ```

5. **Untuk dynamic routes**, gunakan:
   ```typescript
   export async function GET(
     request: NextRequest,
     { params }: { params: { id: string } }
   ) { ... }
   ```

### Contoh: Membuat AI Chat Route

Lihat file `backend/src/routes/ai.ts` sebagai referensi, lalu konversi ke Next.js format.

## 🔧 Environment Variables di Vercel

Set di Vercel Dashboard → Settings → Environment Variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key (optional)
GEMINI_API_KEY=your_gemini_api_key
MAX_FILE_SIZE=10485760 (optional, default 10MB)
GEMINI_MODEL=gemini-2.0-flash-lite (optional)
```

## 🚀 Deploy Steps

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Test build locally**:
   ```bash
   npm run build
   ```

3. **Deploy ke Vercel**:
   - Connect GitHub repository
   - Set root directory: `frontend`
   - Vercel akan auto-detect Next.js
   - Add environment variables
   - Deploy!

4. **Verify deployment**:
   - Check API routes: `https://your-app.vercel.app/api/auth/me`
   - Test dengan Postman/curl

## 📝 Catatan Penting

1. **File Upload**: Next.js menggunakan `FormData`, bukan `multer`
2. **Authentication**: Masih menggunakan `Authorization: Bearer <token>` header
3. **Error Handling**: Gunakan helper functions `createErrorResponse` dan `createSuccessResponse`
4. **Type Safety**: Semua routes menggunakan TypeScript
5. **Path Aliases**: Import menggunakan `@/lib/api/...`

## 🔍 Testing

Setelah semua routes dibuat:

1. **Local testing**:
   ```bash
   cd frontend
   npm run dev
   # Test di http://localhost:3000/api/...
   ```

2. **Production testing**:
   - Deploy ke Vercel preview
   - Test semua endpoints
   - Verify file uploads
   - Test authentication

## 📚 Referensi

- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Vercel Deployment: https://vercel.com/docs
- File Uploads: https://nextjs.org/docs/app/building-your-application/routing/route-handlers#request-body

## ⚡ Next Steps

1. Buat semua route yang masih missing (lihat list di atas)
2. Test semua endpoints
3. Update `frontend/src/lib/api.ts` jika perlu
4. Deploy ke Vercel production
5. Monitor logs di Vercel dashboard
