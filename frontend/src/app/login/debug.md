# Debug Login Issue

## Quick Checks:

1. **Open Browser Console (F12)**
   - Look for errors when clicking login button
   - Check Network tab for failed requests

2. **Check Backend is Running:**
   - Open: http://localhost:3001/health
   - Should return: `{"status":"ok"}`

3. **Check Environment Variables:**
   - File: `frontend/.env.local`
   - Must have: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Test in Browser Console:**
```javascript
// Test Supabase connection
const testLogin = async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    'https://ngxlniymmmmkijefhjbm.supabase.co',
    'sb_publishable_j5ChkdsoOLSF9otCH5lZog_6F5V78C7'
  );
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'wiwik@unp.id',
    password: 'wr77hs20'
  });
  
  console.log('Result:', { data, error });
};

testLogin();
```
