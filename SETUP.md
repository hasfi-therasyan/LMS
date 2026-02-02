# Setup Guide

Complete step-by-step guide to set up the LMS system.

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier works)
- Google Gemini API key
- Git (optional)

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and API keys

### 1.2 Run Database Schema
1. In Supabase Dashboard, go to SQL Editor
2. Copy contents of `database/schema.sql`
3. Paste and execute
4. Verify tables are created in Table Editor

### 1.3 Create Storage Bucket
1. Go to Storage in Supabase Dashboard
2. Create a new bucket named `modules`
3. Set it to **Public** (or configure RLS policies)
4. Note: For production, use proper RLS policies instead

### 1.4 Get API Keys
1. Go to Settings → API
2. Copy:
   - Project URL
   - `anon` key (public)
   - `service_role` key (secret - backend only!)

## Step 2: Google Gemini API Setup

### 2.1 Get API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key (you'll need it for backend)

## Step 3: Backend Setup

### 3.1 Install Dependencies
```bash
cd backend
npm install
```

### 3.2 Configure Environment
1. Copy `.env.example` to `.env`
2. Fill in the values:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_ANON_KEY=your_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   ```

### 3.3 Start Backend
```bash
npm run dev
```

Backend should be running on `http://localhost:3001`

## Step 4: Frontend Setup

### 4.1 Install Dependencies
```bash
cd frontend
npm install
```

### 4.2 Configure Environment
1. Create `.env.local` file
2. Add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

### 4.3 Start Frontend
```bash
npm run dev
```

Frontend should be running on `http://localhost:3000`

## Step 5: Create Admin User

### 5.1 Create User in Supabase Auth
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter email and password
4. Copy the User ID (UUID)

### 5.2 Update Profile to Admin
1. Go to SQL Editor in Supabase
2. Run:
   ```sql
   INSERT INTO public.profiles (id, email, full_name, role)
   VALUES ('<user-id-from-step-5.1>', 'admin@example.com', 'Admin User', 'admin');
   ```
3. Replace `<user-id-from-step-5.1>` with the actual UUID

### 5.3 Login
1. Go to `http://localhost:3000/login`
2. Login with admin credentials
3. You should be redirected to admin dashboard

## Step 6: Create Lecturer Account (via Admin)

### 6.1 Create User in Supabase Auth
1. In Supabase Dashboard → Authentication → Users
2. Create a new user (lecturer email/password)
3. Copy the User ID

### 6.2 Create Lecturer Profile
1. Login as admin in the frontend
2. Use the "Create Lecturer" API endpoint (implement UI or use API directly)
3. Or use SQL:
   ```sql
   INSERT INTO public.profiles (id, email, full_name, role)
   VALUES ('<lecturer-user-id>', 'lecturer@example.com', 'Lecturer Name', 'lecturer');
   ```

## Step 7: Create Class and Enroll Students

### 7.1 Create Class (via Admin or Lecturer)
Use SQL or implement UI:
```sql
INSERT INTO public.classes (name, code, lecturer_id)
VALUES ('Introduction to Computer Science', 'CS101', '<lecturer-id>');
```

### 7.2 Enroll Students
```sql
INSERT INTO public.enrollments (student_id, class_id)
VALUES ('<student-id>', '<class-id>');
```

## Step 8: Test the System

### 8.1 Lecturer Flow
1. Login as lecturer
2. Upload a module (PDF)
3. Create a quiz with questions
4. Verify module and quiz appear

### 8.2 Student Flow
1. Sign up as student (self-registration works)
2. Get enrolled in a class (via admin/lecturer)
3. View modules
4. Take a quiz
5. Submit answers
6. If incorrect answers, AI chatbot should appear
7. Test chatbot interaction

## Troubleshooting

### Backend won't start
- Check all environment variables are set
- Verify Supabase credentials
- Check port 3001 is not in use

### Frontend won't start
- Check Node.js version (18+)
- Verify `.env.local` file exists
- Clear `.next` folder and rebuild

### Database errors
- Verify schema.sql was executed
- Check RLS policies are enabled
- Verify foreign key relationships

### AI Chatbot not working
- Verify Gemini API key is correct
- Check backend logs for errors
- Ensure module has extracted text

### File upload fails
- Verify Supabase Storage bucket exists
- Check bucket is public or RLS policies allow access
- Verify file size is under limit

## Production Deployment

### Frontend (Netlify)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Deploy

### Backend (Vercel/Railway/Render)
1. Connect repository
2. Set environment variables
3. Configure build command: `npm run build`
4. Set start command: `npm start`
5. Deploy

### Database
- Supabase handles production database
- Ensure RLS policies are correct
- Set up backups
- Monitor performance

## Next Steps

1. Implement lecturer dashboard features (upload module, create quiz forms)
2. Implement admin dashboard features (user management, class management)
3. Add student grade viewing
4. Add analytics for lecturers
5. Enhance UI/UX
6. Add email notifications
7. Add file preview (PDF viewer)
8. Add quiz timer functionality

## Support

For issues or questions:
1. Check this guide
2. Review error logs
3. Check Supabase dashboard for database issues
4. Verify all environment variables are set correctly
