# LMS Backend API

Express + TypeScript backend for the Learning Management System.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

3. Set up Supabase Storage bucket:
   - Go to Supabase Dashboard → Storage
   - Create a bucket named `modules`
   - Set it to public (or configure proper RLS policies)

4. Run the database migrations (see `../database/schema.sql`)

5. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (keep secret!)
- `SUPABASE_ANON_KEY` - Anonymous key
- `GEMINI_API_KEY` - Google Gemini API key
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS
- `MAX_FILE_SIZE` - Max file upload size in bytes (default: 10MB)

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/create-lecturer` - Create lecturer account (Admin only)

### Modules
- `POST /api/modules` - Upload module PDF (Lecturer/Admin)
- `GET /api/modules` - Get all modules (filtered by role)
- `GET /api/modules/:id` - Get specific module

### Quizzes
- `POST /api/quizzes` - Create quiz (Lecturer/Admin)
- `GET /api/quizzes` - Get all quizzes (filtered by role)
- `GET /api/quizzes/:id` - Get specific quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers (Student)

### AI Chatbot
- `POST /api/ai/chat/start` - Start chat session for incorrect question
- `POST /api/ai/chat/:sessionId/message` - Send message in chat
- `GET /api/ai/chat/:sessionId` - Get chat session with messages

## Authentication

All endpoints (except `/health`) require authentication via Bearer token:

```
Authorization: Bearer <supabase_jwt_token>
```

The token is obtained from Supabase Auth on the frontend.

## Error Handling

All errors follow this format:
```json
{
  "error": "Error type",
  "message": "Human-readable error message"
}
```

## Security Features

- JWT token validation
- Role-based access control (RBAC)
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet.js security headers
- Input validation with Zod
- File type validation (PDF only)
