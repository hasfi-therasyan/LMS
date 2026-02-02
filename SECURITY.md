# Security & Best Practices

## Overview

This document outlines security measures and best practices implemented in the LMS system.

## Authentication & Authorization

### JWT Token Validation
- All API endpoints (except `/health`) require valid JWT tokens
- Tokens are validated against Supabase Auth on every request
- Tokens are automatically refreshed by Supabase client

### Role-Based Access Control (RBAC)
- Three distinct roles: `admin`, `lecturer`, `student`
- Backend middleware enforces role checks before processing requests
- Database Row Level Security (RLS) provides additional protection

### Access Control Examples

**Students:**
- Can only view modules in enrolled classes
- Can only submit quizzes once
- Can only access their own chat sessions
- Cannot see correct answers before submission

**Lecturers:**
- Can only manage their own classes and modules
- Can view all submissions for their quizzes
- Cannot access other lecturers' content

**Admins:**
- Full system access
- Can create lecturer accounts
- Can manage all classes and users

## API Security

### Rate Limiting
- 100 requests per 15 minutes per IP address
- Prevents brute force attacks and API abuse
- Applied to all `/api/` routes

### Input Validation
- All user inputs validated using Zod schemas
- Prevents SQL injection and XSS attacks
- Type-safe request/response handling

### File Upload Security
- Only PDF files accepted
- File size limits enforced (10MB default)
- Files validated before processing
- Stored in Supabase Storage with proper access controls

### CORS Configuration
- Restricted to frontend domain only
- Credentials enabled for authenticated requests
- Prevents unauthorized cross-origin requests

## Database Security

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies enforce data access based on user role
- Prevents unauthorized data access even if API is compromised

### SQL Injection Prevention
- Supabase client uses parameterized queries
- No raw SQL strings with user input
- Type-safe database operations

### Foreign Key Constraints
- Proper cascade rules prevent orphaned records
- Data integrity maintained at database level

## Environment Variables

### Backend (.env)
- `SUPABASE_SERVICE_ROLE_KEY` - **NEVER expose to frontend**
- `GEMINI_API_KEY` - Keep secret
- All sensitive keys stored in environment variables

### Frontend (.env.local)
- Only public keys exposed (`NEXT_PUBLIC_*`)
- Service role key never sent to frontend
- API calls go through backend for security

## AI Chatbot Security

### Context Limitation
- AI only receives module content, question, and answers
- No access to other students' data
- No access to grades or scores
- Cannot modify quiz results

### Prompt Engineering
- System prompt enforces educational behavior
- AI cannot give direct answers immediately
- Focus on learning, not cheating

## Best Practices

### Error Handling
- Generic error messages to users
- Detailed errors logged server-side only
- No sensitive information in error responses

### Logging
- Authentication failures logged
- API errors logged with context
- No sensitive data in logs

### Code Quality
- TypeScript for type safety
- Consistent error handling patterns
- Clear separation of concerns

### Deployment Security

**Frontend (Netlify):**
- Environment variables set in Netlify dashboard
- HTTPS enforced
- Secure headers configured

**Backend:**
- Environment variables in secure storage
- HTTPS required
- Regular dependency updates
- Security headers via Helmet.js

## Security Checklist

- [x] JWT token validation on all protected routes
- [x] Role-based access control
- [x] Input validation with Zod
- [x] Rate limiting
- [x] CORS configuration
- [x] File upload validation
- [x] Row Level Security (RLS)
- [x] Environment variable security
- [x] Error handling without sensitive data
- [x] HTTPS enforcement
- [x] Security headers (Helmet.js)

## Regular Maintenance

1. **Dependency Updates**: Regularly update npm packages
2. **Security Audits**: Run `npm audit` regularly
3. **Token Rotation**: Rotate API keys periodically
4. **Access Reviews**: Review user roles and permissions
5. **Log Monitoring**: Monitor for suspicious activity

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:
1. Do not create public issues
2. Contact the development team directly
3. Provide detailed information about the vulnerability
4. Allow time for fix before public disclosure
