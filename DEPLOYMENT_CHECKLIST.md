# ✅ Deployment Checklist

Gunakan checklist ini sebelum dan sesudah deploy ke Vercel.

## Pre-Deployment

### Code Preparation
- [ ] Semua code sudah di-commit
- [ ] Code sudah di-push ke repository (GitHub/GitLab/Bitbucket)
- [ ] Tidak ada uncommitted changes
- [ ] Build lokal berhasil (`cd frontend && npm run build`)

### Dependencies
- [ ] Semua dependencies ada di `package.json`
- [ ] `node_modules` tidak di-commit (ada di `.gitignore`)
- [ ] `package-lock.json` sudah di-commit

### Configuration Files
- [ ] `vercel.json` sudah dikonfigurasi dengan benar
- [ ] `next.config.js` sudah dikonfigurasi
- [ ] `tsconfig.json` sudah dikonfigurasi
- [ ] Tidak ada hardcoded secrets di code

### Environment Variables (Siapkan Nilai)
- [ ] `SUPABASE_URL` - Sudah disiapkan
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Sudah disiapkan
- [ ] `SUPABASE_ANON_KEY` - Sudah disiapkan
- [ ] `GEMINI_API_KEY` - Sudah disiapkan
- [ ] `MAX_FILE_SIZE` (optional) - Sudah disiapkan
- [ ] `GEMINI_MODEL` (optional) - Sudah disiapkan

### Database & Storage
- [ ] Supabase project sudah dibuat
- [ ] Database schema sudah di-setup
- [ ] RLS policies sudah dikonfigurasi
- [ ] Storage buckets sudah dibuat:
  - [ ] `modules` (Public)
  - [ ] `jobsheets` (Public)
  - [ ] `jobsheet-submissions` (Public)
  - [ ] `jobsheet-assignments` (Public)
  - [ ] `jobsheet-assignments-2` (Public)
  - [ ] `jobsheet-assignments-3` (Public)
  - [ ] `jobsheet-assignments-4` (Public)

### Testing
- [ ] Test login berhasil
- [ ] Test API routes lokal berhasil
- [ ] Test file upload lokal berhasil
- [ ] Test semua fitur utama berfungsi

## Vercel Setup

### Project Configuration
- [ ] Repository sudah di-import ke Vercel
- [ ] Root Directory: `frontend`
- [ ] Framework: Next.js (auto-detect)
- [ ] Build Command: `npm run build` (default)
- [ ] Output Directory: `.next` (default)

### Environment Variables (Set di Vercel)
- [ ] `SUPABASE_URL` - Sudah di-set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Sudah di-set
- [ ] `SUPABASE_ANON_KEY` - Sudah di-set
- [ ] `GEMINI_API_KEY` - Sudah di-set
- [ ] `MAX_FILE_SIZE` (optional) - Sudah di-set
- [ ] `GEMINI_MODEL` (optional) - Sudah di-set
- [ ] Semua variables di-set untuk Production, Preview, dan Development

## Post-Deployment

### Build Verification
- [ ] Build berhasil tanpa error
- [ ] Tidak ada warning yang critical
- [ ] Build time reasonable (< 5 menit)

### URL & Access
- [ ] Production URL bisa diakses
- [ ] Preview URL bisa diakses (jika ada)
- [ ] Custom domain sudah dikonfigurasi (jika ada)

### API Routes Testing
- [ ] `GET /api/auth/me` - Berhasil
- [ ] `GET /api/modules` - Berhasil
- [ ] `GET /api/quizzes` - Berhasil
- [ ] `POST /api/auth/signup` - Berhasil
- [ ] Test semua API routes penting

### Frontend Testing
- [ ] Homepage bisa diakses
- [ ] Login page bisa diakses
- [ ] Login berhasil
- [ ] Dashboard bisa diakses setelah login
- [ ] Navigation berfungsi
- [ ] File upload berfungsi
- [ ] PDF viewer berfungsi

### Functionality Testing
- [ ] User bisa login
- [ ] User bisa signup
- [ ] Admin bisa create quiz
- [ ] Student bisa take quiz
- [ ] Student bisa submit jobsheet
- [ ] AI chatbot berfungsi
- [ ] File upload berfungsi
- [ ] File download berfungsi

### Performance
- [ ] Page load time < 3 detik
- [ ] API response time < 2 detik
- [ ] No memory leaks
- [ ] Function execution time reasonable

### Security
- [ ] Environment variables tidak exposed di browser
- [ ] Service keys tidak accessible dari frontend
- [ ] CORS properly configured
- [ ] Authentication working correctly

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking setup (optional)
- [ ] Logs accessible
- [ ] Alerts configured (optional)

## Troubleshooting Checklist

Jika ada masalah, check:

### Build Errors
- [ ] Check build logs di Vercel
- [ ] Verify semua dependencies ada
- [ ] Check TypeScript errors
- [ ] Verify file paths correct

### Runtime Errors
- [ ] Check function logs di Vercel
- [ ] Check browser console
- [ ] Verify environment variables
- [ ] Check database connection

### API Errors
- [ ] Verify API routes exist
- [ ] Check authentication headers
- [ ] Verify database queries
- [ ] Check Supabase connection

### File Upload Errors
- [ ] Verify storage buckets exist
- [ ] Check bucket permissions (Public)
- [ ] Verify file size limits
- [ ] Check CORS settings

## Maintenance

### Regular Checks
- [ ] Monitor Vercel usage
- [ ] Check error rates
- [ ] Review performance metrics
- [ ] Update dependencies regularly
- [ ] Backup database regularly

### Updates
- [ ] Keep Next.js updated
- [ ] Keep dependencies updated
- [ ] Monitor security advisories
- [ ] Test updates in preview first

---

**Catatan**: Centang setiap item setelah selesai untuk tracking progress.
