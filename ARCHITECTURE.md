# LMS System Architecture

## High-Level Overview

This Learning Management System (LMS) is designed for higher education institutions with three distinct user roles: Admin, Lecturer (Dosen), and Student (Mahasiswa). The system includes an AI-powered chatbot that assists students with learning discussions after quiz completion.

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Modules │  │  Quizzes │  │  Chatbot │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Modules │  │  Quizzes │  │    AI    │   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         │              │              │              │
         ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE (PostgreSQL + Auth)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │  Modules │  │  Quizzes │  │  Chat    │   │
│  │  Tables  │  │  Tables  │  │  Tables  │  │  History │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Call
                            │
┌─────────────────────────────────────────────────────────────┐
│              GOOGLE GEMINI API                               │
│              (AI Chatbot Service)                            │
└─────────────────────────────────────────────────────────────┘
```

## System Flow

### 1. Authentication Flow
```
User → Frontend Login → Supabase Auth → JWT Token → Backend Validation → Role-based Access
```

### 2. Module Upload Flow (Lecturer)
```
Lecturer → Upload PDF → Backend → Store in Supabase Storage → Extract Text → Store in DB
```

### 3. Quiz Taking Flow (Student)
```
Student → View Module → Take Quiz → Submit Answers → Backend Evaluates → Store Results
```

### 4. AI Chatbot Flow (Post-Quiz)
```
Quiz Submission → Incorrect Answers Detected → Trigger Chatbot → 
Send to Gemini API (with context) → Receive Response → Display to Student
```

## Technology Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL with Vector extension)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **AI Service**: Google Gemini API
- **Deployment**: Frontend → Netlify, Backend → (TBD - Vercel/Railway/Render)

## Security Considerations

1. **Authentication**: All routes protected with JWT validation
2. **Authorization**: Role-based access control (RBAC) at API level
3. **Input Validation**: All user inputs validated and sanitized
4. **Rate Limiting**: API rate limiting to prevent abuse
5. **CORS**: Configured for frontend domain only
6. **Environment Variables**: Sensitive data stored in .env files

## Key Design Decisions

### Why Supabase?
- Built-in authentication reduces development time
- PostgreSQL provides robust relational data management
- Vector extension enables future AI enhancements
- Real-time capabilities for live updates

### Why Gemini API?
- Strong reasoning capabilities for educational content
- Cost-effective for educational use cases
- Good support for structured prompts
- Multimodal capabilities (future: image support)

### Why Separate Backend?
- Centralized business logic
- Better security (API keys not exposed to frontend)
- Easier to scale and maintain
- Clear separation of concerns

## Data Flow Example: Quiz → AI Chatbot

1. Student submits quiz answers
2. Backend evaluates answers against correct answers
3. Backend identifies incorrect questions
4. For each incorrect question:
   - Fetch module content (text extraction)
   - Build context: question, student answer, correct answer, module text
   - Send to Gemini API with educational prompt
   - Store conversation in database
5. Frontend displays chatbot interface
6. Student interacts with AI about incorrect questions
7. AI provides hints, explanations, and guided questions
