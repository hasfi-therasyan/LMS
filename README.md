# Learning Management System (LMS) with AI Chatbot

A comprehensive LMS platform for higher education with AI-powered post-quiz learning assistance.

## Features

- 🔐 Role-based authentication (Admin, Lecturer, Student)
- 📚 Module management with PDF upload
- 📝 Quiz system with auto-grading
- 🤖 AI chatbot for post-quiz learning discussions
- 📊 Analytics dashboard for lecturers
- 🎓 Student grade tracking

## Tech Stack

- **Frontend**: Next.js 14+ (React, TypeScript, Tailwind CSS)
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Google Gemini API

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Google Gemini API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. Set up environment variables (see `.env.example` files)

4. Run migrations (see `database/schema.sql`)

5. Start development servers:
   ```bash
   # Backend (from backend directory)
   npm run dev
   
   # Frontend (from frontend directory)
   npm run dev
   ```

## Project Structure

```
LMS/
├── frontend/          # Next.js application
├── backend/           # Express API server
├── database/          # SQL schema and migrations
├── ARCHITECTURE.md    # System architecture documentation
└── README.md          # This file
```

## Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [API Documentation](./backend/README.md)
- [Database Schema](./database/README.md)

## License

MIT
