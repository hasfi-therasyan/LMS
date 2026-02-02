# LMS Frontend

Learning Management System Frontend built with Next.js 14, React, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **API Client:** Axios
- **Authentication:** Supabase Auth
- **Notifications:** React Hot Toast
- **PDF Viewer:** React PDF

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── student/           # Student dashboard
│   │   ├── lecturer/          # Lecturer dashboard (admin role)
│   │   ├── login/             # Login/Signup page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx          # Home/redirect page
│   │   └── globals.css       # Global styles
│   ├── components/            # React components
│   │   ├── AIChatbot.tsx     # AI chatbot for quiz discussion
│   │   ├── QuizComponent.tsx # Quiz taking interface
│   │   ├── UploadModuleModal.tsx
│   │   ├── CreateQuizModal.tsx
│   │   ├── QuizSubmissionsModal.tsx
│   │   ├── CreateClassModal.tsx
│   │   ├── CreateLecturerModal.tsx
│   │   ├── EnrollStudentModal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   └── Navbar.tsx
│   ├── lib/                  # Utilities
│   │   ├── api.ts           # API client
│   │   └── supabase.ts      # Supabase client
│   └── store/               # Zustand stores
│       └── authStore.ts     # Authentication state
├── public/                   # Static assets
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## 🎨 Features

### Admin Dashboard
- User management (create admin, view users)
- Class management (create classes)
- Student enrollment
- Statistics overview

### Lecturer Dashboard (Admin Role)
- Upload modules/jobsheets (PDF)
- Create quizzes with multiple choice questions
- View quiz submissions and analytics
- Manage classes

### Student Dashboard
- View enrolled modules
- Take quizzes
- View grades
- AI chatbot for incorrect quiz answers

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Components

### Reusable Components

- **LoadingSpinner** - Loading indicator with different sizes
- **EmptyState** - Empty state with icon, title, description, and action
- **Navbar** - Consistent navigation bar with logout

### Feature Components

- **AIChatbot** - AI-powered chatbot for quiz discussion
- **QuizComponent** - Quiz taking interface with submission
- **UploadModuleModal** - Modal for uploading PDF modules
- **CreateQuizModal** - Modal for creating quizzes
- **QuizSubmissionsModal** - Modal for viewing quiz submissions

## 🎯 Routes

- `/` - Home (redirects based on auth)
- `/login` - Login/Signup page
- `/admin` - Admin dashboard
- `/lecturer` - Lecturer dashboard (admin role)
- `/student` - Student dashboard

## 🔐 Authentication

Uses Supabase Auth:
- Email/Password authentication
- Role-based access control (admin, mahasiswa)
- Session management with Zustand

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Primary Color:** Blue (#0284c7)
- **Responsive Design:** Mobile-first approach
- **Components:** Consistent card, button, and input styles

## 📱 Responsive Design

- **Mobile:** Single column layout
- **Tablet:** 2-column grid (`md:` breakpoint)
- **Desktop:** 3-column grid (`lg:` breakpoint)

## 🚀 Build for Production

```bash
npm run build
npm start
```

## 📝 Notes

- All API calls go through `/api` client in `lib/api.ts`
- Authentication state managed by Zustand store
- Toast notifications for user feedback
- Error handling with try-catch and user-friendly messages
