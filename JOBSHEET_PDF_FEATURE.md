# Jobsheet PDF Feature Implementation

## ✅ Completed Features

### 1. Database Schema Update
- Added `file_url` column to `classes` table
- File: `database/add_file_url_to_classes.sql`
- Run this SQL in Supabase SQL Editor before using the feature

### 2. Backend Updates

**File: `backend/src/routes/jobsheet.ts`**
- Added multer configuration for PDF uploads
- Updated `POST /api/jobsheet` to handle file upload
- Added `GET /api/jobsheet/:id` endpoint
- PDF files are stored in Supabase Storage bucket `jobsheets`

**Storage Path:** `jobsheets/jobsheet-{timestamp}-{filename}.pdf`

### 3. Frontend Updates

**Create Jobsheet Modal (`frontend/src/components/CreateJobsheetModal.tsx`)**
- ✅ Jobsheet Name (required)
- ✅ Jobsheet Code (required)
- ✅ Lecturer dropdown (optional)
- ✅ Upload PDF with drag & drop (required)
- ✅ Description (optional)
- Drag and drop functionality with visual feedback
- File validation (PDF only, max 10MB)

**Jobsheet View Page (`frontend/src/app/jobsheet/[id]/page.tsx`)**
- Full-screen PDF viewer using iframe
- Download PDF button
- Back button to return to dashboard
- Responsive design
- Loading states

**Admin Dashboard (`frontend/src/app/admin/page.tsx`)**
- Updated jobsheet cards to be clickable
- "View PDF" button on each card
- Cards navigate to `/jobsheet/[id]` page
- Delete button with stopPropagation to prevent navigation

### 4. API Client Updates

**File: `frontend/src/lib/api.ts`**
- Updated `createJobsheet` to accept FormData
- Added `getJobsheet(id)` method

## 📋 Setup Required

### 1. Database Migration
Run this SQL in Supabase SQL Editor:
```sql
-- File: database/add_file_url_to_classes.sql
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS file_url TEXT;
```

### 2. Supabase Storage Bucket
Create a storage bucket named `jobsheets` in Supabase:
1. Go to Supabase Dashboard → Storage
2. Create new bucket: `jobsheets`
3. Set it to public (if you want public access) or configure RLS policies

### 3. Storage Policies (Optional)
If you want to restrict access, add RLS policies:
```sql
-- Allow authenticated users to read jobsheet files
CREATE POLICY "Authenticated users can read jobsheets" ON storage.objects
FOR SELECT USING (bucket_id = 'jobsheets' AND auth.role() = 'authenticated');
```

## 🎯 User Flow

1. **Admin creates jobsheet:**
   - Clicks "Create Jobsheet" button
   - Fills in: Name, Code, Lecturer (optional), Description (optional)
   - Drags & drops PDF or selects file
   - Clicks "Create Jobsheet"
   - PDF is uploaded to Supabase Storage
   - Jobsheet record is created with file_url

2. **Admin views jobsheet:**
   - Sees jobsheet card in dashboard
   - Clicks card or "View PDF" button
   - Navigates to `/jobsheet/[id]` page
   - PDF is displayed in full-screen viewer
   - Can download PDF using "Download PDF" button

## 🔧 Technical Details

- **File Upload:** Uses FormData with multipart/form-data
- **PDF Validation:** Backend validates PDF using `validatePDF` utility
- **Storage:** Supabase Storage bucket `jobsheets`
- **PDF Viewer:** Native browser iframe (works with public URLs)
- **Download:** Creates temporary anchor element to trigger download

## 📝 Notes

- PDF files are stored with timestamp prefix to avoid conflicts
- Maximum file size: 10MB (configurable via `MAX_FILE_SIZE` env var)
- Only PDF files are accepted (validated by MIME type)
- File cleanup happens if database insert fails
