# Panduan Migrasi ke Vercel

Dokumen ini menjelaskan perubahan yang telah dilakukan untuk mengonversi aplikasi LMS dari Express backend menjadi Next.js API routes (serverless functions) yang kompatibel dengan Vercel.

## Perubahan Struktur

### Sebelum (Express Backend)
```
backend/
  src/
    routes/        # Express routes
    middleware/    # Express middleware
    config/        # Config files
    utils/         # Utilities
  index.ts         # Express server
```

### Sesudah (Next.js API Routes)
```
frontend/
  src/
    app/
      api/         # Next.js API routes (serverless)
        auth/
        modules/
        quizzes/
        ...
    lib/
      api/
        config/    # Config files
        middleware/ # Auth helpers
        utils/      # Utilities
```

## File yang Telah Dibuat

### 1. Config Files
- `frontend/src/lib/api/config/env.ts` - Environment validation
- `frontend/src/lib/api/config/supabase.ts` - Supabase client
- `frontend/src/lib/api/config/gemini.ts` - Gemini AI config

### 2. Middleware/Helpers
- `frontend/src/lib/api/middleware/auth.ts` - Authentication helpers untuk Next.js

### 3. Utilities
- `frontend/src/lib/api/utils/pdfExtractor.ts` - PDF extraction
- `frontend/src/lib/api/utils/fileUpload.ts` - File upload helpers
- `frontend/src/lib/api/utils/quizHelpers.ts` - Quiz helpers

### 4. API Routes (yang sudah dibuat)
- `frontend/src/app/api/auth/me/route.ts` - GET /api/auth/me
- `frontend/src/app/api/auth/signup/route.ts` - POST /api/auth/signup
- `frontend/src/app/api/auth/create-admin/route.ts` - POST /api/auth/create-admin
- `frontend/src/app/api/modules/route.ts` - GET/POST /api/modules
- `frontend/src/app/api/modules/[id]/route.ts` - GET /api/modules/:id

## API Routes yang Masih Perlu Dibuat

Berdasarkan route Express yang ada, berikut route yang masih perlu dikonversi:

### 1. Quizzes Routes
- `frontend/src/app/api/quizzes/route.ts` - GET/POST /api/quizzes
- `frontend/src/app/api/quizzes/[id]/route.ts` - GET/DELETE /api/quizzes/:id
- `frontend/src/app/api/quizzes/[id]/submit/route.ts` - POST /api/quizzes/:id/submit

### 2. AI Routes
- `frontend/src/app/api/ai/chat/start/route.ts` - POST /api/ai/chat/start
- `frontend/src/app/api/ai/chat/[sessionId]/message/route.ts` - POST /api/ai/chat/:sessionId/message
- `frontend/src/app/api/ai/chat/[sessionId]/route.ts` - GET /api/ai/chat/:sessionId

### 3. Jobsheet Routes
- `frontend/src/app/api/jobsheet/route.ts` - GET/POST /api/jobsheet
- `frontend/src/app/api/jobsheet/[id]/route.ts` - GET/DELETE /api/jobsheet/:id

### 4. Submissions Routes
- `frontend/src/app/api/submissions/quiz/[quizId]/route.ts` - GET /api/submissions/quiz/:quizId
- `frontend/src/app/api/submissions/analytics/[quizId]/route.ts` - GET /api/submissions/analytics/:quizId
- `frontend/src/app/api/submissions/student/route.ts` - GET /api/submissions/student
- `frontend/src/app/api/submissions/all/route.ts` - GET /api/submissions/all

### 5. Admin Routes
- `frontend/src/app/api/admin/users/route.ts` - GET /api/admin/users

### 6. Jobsheet Submissions Routes
- `frontend/src/app/api/jobsheet-submissions/route.ts` - POST /api/jobsheet-submissions
- `frontend/src/app/api/jobsheet-submissions/module/[moduleId]/route.ts` - GET /api/jobsheet-submissions/module/:moduleId
- `frontend/src/app/api/jobsheet-submissions/student/route.ts` - GET /api/jobsheet-submissions/student
- `frontend/src/app/api/jobsheet-submissions/[submissionId]/grade/route.ts` - PATCH /api/jobsheet-submissions/:submissionId/grade

### 7. Jobsheet Assignments Routes
- `frontend/src/app/api/jobsheet-assignments/route.ts` - POST /api/jobsheet-assignments
- `frontend/src/app/api/jobsheet-assignments/student/route.ts` - GET /api/jobsheet-assignments/student
- `frontend/src/app/api/jobsheet-assignments/jobsheet/[jobsheetId]/route.ts` - GET /api/jobsheet-assignments/jobsheet/:jobsheetId
- `frontend/src/app/api/jobsheet-assignments/all/route.ts` - GET /api/jobsheet-assignments/all
- `frontend/src/app/api/jobsheet-assignments/[assignmentId]/grade/route.ts` - PUT /api/jobsheet-assignments/:assignmentId/grade
- `frontend/src/app/api/jobsheet-assignments/[assignmentId]/route.ts` - DELETE /api/jobsheet-assignments/:assignmentId

## Perbedaan Express vs Next.js API Routes

### Express
```typescript
router.get('/me', authenticate, async (req, res) => {
  res.json(data);
});
```

### Next.js
```typescript
export async function GET(request: NextRequest) {
  const user = await authenticate(request);
  return Response.json(data);
}
```

### File Upload (Express dengan Multer)
```typescript
router.post('/', upload.single('file'), async (req, res) => {
  const file = req.file;
});
```

### File Upload (Next.js)
```typescript
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
}
```

## Environment Variables untuk Vercel

Pastikan semua environment variables berikut diatur di Vercel Dashboard:

### Required
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_ANON_KEY` - Supabase anonymous key (optional, untuk frontend)
- `GEMINI_API_KEY` - Google Gemini API key

### Optional
- `MAX_FILE_SIZE` - Maximum file size in bytes (default: 10485760 = 10MB)
- `GEMINI_MODEL` - Gemini model name (default: gemini-2.0-flash-lite)

## Cara Deploy ke Vercel

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Build Test (Lokal)**
   ```bash
   npm run build
   ```

3. **Deploy ke Vercel**
   - Connect repository ke Vercel
   - Set root directory ke `frontend`
   - Set build command: `npm run build`
   - Set output directory: `.next`
   - Add semua environment variables

4. **Vercel Configuration**
   - File `vercel.json` sudah dikonfigurasi
   - API routes akan otomatis menjadi serverless functions
   - Max duration: 30 detik (dapat ditingkatkan untuk Pro plan)

## Catatan Penting

1. **File Upload**: Next.js menggunakan FormData, bukan multer
2. **Authentication**: Token masih dari Authorization header
3. **Error Handling**: Gunakan `createErrorResponse` dan `createSuccessResponse` helpers
4. **Type Safety**: Semua routes menggunakan TypeScript
5. **Path Aliases**: Menggunakan `@/lib/api/...` untuk imports

## Testing

Setelah semua routes dibuat, test dengan:
1. Local development: `npm run dev`
2. Test setiap endpoint dengan Postman/curl
3. Deploy ke Vercel preview untuk testing production

## Next Steps

1. Buat semua API routes yang masih missing
2. Update `frontend/src/lib/api.ts` jika perlu (untuk API client)
3. Test semua endpoints
4. Deploy ke Vercel production
