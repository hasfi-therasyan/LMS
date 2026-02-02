# Database Schema Documentation

## Overview

This database schema is designed for Supabase PostgreSQL and implements a complete LMS system with role-based access control.

## Key Design Decisions

### Why Separate Profiles Table?
Supabase Auth manages authentication in the `auth.users` table, but we need additional fields (role, full_name) that are specific to our application. The `profiles` table extends the auth users with application-specific data.

### Row Level Security (RLS)
All tables use Supabase's Row Level Security to ensure users can only access data they're authorized to see:
- Students can only see their own submissions and enrolled classes
- Lecturers can see their own classes, modules, and quizzes
- Admins can see everything

### Foreign Key Constraints
All foreign keys use `ON DELETE CASCADE` or `ON DELETE SET NULL` appropriately:
- User deletion cascades to their submissions
- Module deletion cascades to quizzes
- Quiz deletion cascades to questions and submissions

## Tables

### Core Tables
1. **profiles** - User profiles (extends auth.users)
2. **classes** - Course/class information
3. **enrollments** - Student-class relationships
4. **modules** - Learning modules/jobsheets
5. **quizzes** - Quiz definitions
6. **quiz_questions** - Individual quiz questions
7. **quiz_submissions** - Student quiz submissions
8. **quiz_answers** - Individual answers within submissions
9. **ai_chat_sessions** - AI chatbot conversation sessions
10. **ai_chat_messages** - Individual messages in chat sessions

## Setup Instructions

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Execute the script
5. Verify tables are created in the Table Editor

## Important Notes

- Always test RLS policies after setup
- Create an admin user through Supabase Auth first, then update their profile role
- The `extracted_text` field in modules is populated by the backend after PDF upload
- Chat sessions are created automatically when a student has incorrect answers
