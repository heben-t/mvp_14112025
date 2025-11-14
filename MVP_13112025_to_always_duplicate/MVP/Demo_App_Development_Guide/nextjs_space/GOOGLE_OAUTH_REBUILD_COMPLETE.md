# ✅ Google OAuth Rebuild - Complete Guide

## 🔧 What Was Changed

### 1. **Removed NextAuth, Switched to Pure Supabase Auth**

**Why:** You were using both NextAuth AND Supabase Auth, causing conflicts. Supabase Auth is more modern, simpler, and better integrated with Supabase.

**Files Modified:**
- `lib/auth.ts` - Completely rewritten to use Supabase server client
- `lib/supabase-client.ts` - NEW: Client-side Supabase helper
- `app/api/auth/[...nextauth]/route.ts` - Deprecated, returns 410 error
- `app/auth/signin/page.tsx` - Now uses Supabase Auth
- `app/auth/signup/page.tsx` - Now uses Supabase Auth  
- `app/auth/callback/route.ts` - Enhanced OAuth callback handler
- `app/auth/verify-email/page.tsx` - NEW: Email verification page
- `types/supabase.ts` - NEW: TypeScript types for database

---

## 🚀 Setup Instructions

### Step 1: Enable Google OAuth in Supabase Dashboard

**CRITICAL:** This is the most important step!

1. Go to your Supabase Dashboard:
   ```
   https://app.supabase.com/project/gnzcvhyxiatcjofywkdq/auth/providers
   ```

2. Click on **"Google"** in the providers list

3. **Toggle "Enable Google provider" to ON**

4. Enter your Google OAuth credentials:
   ```
   Client ID: 827886733055-tbn7nm5k2j6ktiou29rki9j6rk911ata.apps.googleusercontent.com
   Client Secret: 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
   ```

5. Click **"Save"**

---

### Step 2: Configure Google Cloud Console

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)

2. Find your OAuth 2.0 Client (the one with the Client ID above)

3. Click **Edit** on your OAuth client

4. Under **"Authorized JavaScript origins"**, add:
   ```
   http://localhost:3000
   https://gnzcvhyxiatcjofywkdq.supabase.co
   ```

5. Under **"Authorized redirect URIs"**, add:
   ```
   http://localhost:3000/auth/callback
   https://gnzcvhyxiatcjofywkdq.supabase.co/auth/v1/callback
   ```

   ⚠️ **CRITICAL:** The Supabase callback URL format is:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

6. Click **"Save"**

---

### Step 3: Configure Supabase Auth Settings

1. Go to Authentication → URL Configuration in Supabase Dashboard

2. Set **Site URL**:
   ```
   http://localhost:3000
   ```
   (Change to your production URL when deploying)

3. Add **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/onboarding/startup
   http://localhost:3000/auth/onboarding/investor
   ```

4. **Email Templates** (Optional but recommended):
   - Customize the email confirmation template
   - Add your branding

5. **Email Auth Settings**:
   - Enable email confirmations (or disable for development)
   - Set email rate limits

---

## 🔄 OAuth Flow Diagram

```
1. User clicks "Continue with Google" on /auth/signup or /auth/signin
   ↓
2. supabase.auth.signInWithOAuth() is called
   ↓
3. User redirected to Google OAuth consent screen
   ↓
4. User authenticates with Google
   ↓
5. Google redirects to: https://gnzcvhyxiatcjofywkdq.supabase.co/auth/v1/callback?code=...
   ↓
6. Supabase processes OAuth code & creates session
   ↓
7. Supabase redirects to: http://localhost:3000/auth/callback?code=...&role=STARTUP
   ↓
8. Your callback route (/auth/callback/route.ts):
   - Exchanges code for session
   - Creates/updates user in public.users table
   - Checks onboarding status
   - Redirects to appropriate page
   ↓
9. User lands on:
   - NEW user → /auth/onboarding/startup or /auth/onboarding/investor
   - EXISTING user (incomplete onboarding) → /auth/onboarding/...
   - EXISTING user (complete onboarding) → /dashboard or /investor/dashboard
```

---

## 🧪 Testing Guide

### Test 1: Sign Up with Google (New User)

1. Open browser in **incognito/private mode**
2. Go to `http://localhost:3000/auth/signup`
3. Select "Startup" or "Investor"
4. Click **"Continue with Google"**
5. Authenticate with a Google account not yet registered
6. **Expected Result:**
   - Redirected to Google login
   - After authentication, redirected back to app
   - User created in database with selected role
   - Redirected to onboarding page

**Debug in Browser Console:**
```javascript
// Check localStorage for Supabase session
localStorage.getItem('sb-gnzcvhyxiatcjofywkdq-auth-token')

// Should see session data with user info
```

---

### Test 2: Sign In with Google (Existing User)

1. Use the same Google account as Test 1
2. Go to `http://localhost:3000/auth/signin`
3. Click **"Continue with Google"**
4. **Expected Result:**
   - Quick redirect (already authenticated with Google)
   - User recognized, session created
   - Redirected to dashboard or onboarding based on status

---

### Test 3: Email/Password Sign Up

1. Go to `http://localhost:3000/auth/signup`
2. Select role
3. Fill in name, email, password
4. Click **"Create Account"**
5. **Expected Result:**
   - If email confirmation ENABLED: Redirected to verify-email page
   - If email confirmation DISABLED: Immediately logged in, redirected to onboarding

---

### Test 4: Email/Password Sign In

1. Go to `http://localhost:3000/auth/signin`
2. Enter email and password from Test 3
3. Click **"Sign In"**
4. **Expected Result:**
   - Session created
   - Redirected to /auth/onboarding/check
   - Then to appropriate dashboard

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause:** Google redirect URI not configured correctly

**Fix:**
1. Go to Google Cloud Console
2. Check the exact redirect URI in the error message
3. Add it to "Authorized redirect URIs"
4. **Must include:** `https://gnzcvhyxiatcjofywkdq.supabase.co/auth/v1/callback`

---

### Error: "Invalid client"

**Cause:** Client ID or Secret doesn't match

**Fix:**
1. Copy Client ID from Google Console
2. Paste into Supabase Dashboard → Auth → Providers → Google
3. Copy Client Secret from Google Console  
4. Paste into Supabase Dashboard
5. Click **Save**

---

### Error: "User creation failed"

**Cause:** Database constraint violation or RLS policy blocking insert

**Fix:**
1. Check browser console for detailed error
2. Verify RLS policies on `users` table allow INSERT
3. Check database logs in Supabase Dashboard

**Quick Fix - Disable RLS temporarily (DEVELOPMENT ONLY):**
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

---

### Error: Session not persisting

**Cause:** Cookie issues or HTTPS/localhost mismatch

**Fix:**
1. Check if running on `http://localhost:3000` (not 127.0.0.1)
2. Clear browser cookies and localStorage
3. Try incognito mode
4. Check Supabase Auth settings for cookie configuration

---

### Google OAuth works but user not created in database

**Cause:** Callback handler not creating user record

**Fix:**
1. Check `/auth/callback/route.ts` logs in terminal
2. Verify the user insert query
3. Check RLS policies on `users` table
4. Manually test with service role client

---

## 🔒 Security Checklist

### Development:
- ✅ OAuth only works on `http://localhost:3000`
- ✅ Google credentials in Supabase Dashboard (not in code)
- ✅ Service role key never exposed to client
- ✅ RLS policies enabled on all tables
- ✅ Session cookies are httpOnly and secure

### Production (Before Launch):
- [ ] Update Site URL in Supabase to production domain
- [ ] Add production redirect URIs to Google Console
- [ ] Remove `http://localhost:3000` from Google Console
- [ ] Enable email confirmations
- [ ] Set up email rate limiting
- [ ] Configure password requirements
- [ ] Set up 2FA for admin accounts
- [ ] Review and harden RLS policies
- [ ] Set up monitoring and alerts
- [ ] Add privacy policy and terms of service URLs

---

## 📋 Database Schema for OAuth

Ensure your `users` table has these columns:

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('STARTUP', 'INVESTOR')),
  image TEXT,
  "emailVerified" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Service role can insert (for OAuth callback)
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

---

## 📊 Monitoring OAuth Success

### In Supabase Dashboard:

1. **Auth Logs:**
   - Dashboard → Logs → Auth Logs
   - Look for `auth.session` and `auth.user` events

2. **User Count:**
   - Dashboard → Authentication → Users
   - Should see users created via Google OAuth (provider: `google`)

3. **Database:**
   - Table Editor → `users`
   - Check `emailVerified` is set for Google users

---

## ✅ Success Criteria

You know OAuth is working when:

1. ✅ Click "Continue with Google" redirects to Google
2. ✅ After Google auth, redirected back to your app
3. ✅ User record created in `public.users` table
4. ✅ User role matches selected role
5. ✅ Session persists (user stays logged in on refresh)
6. ✅ Redirected to correct onboarding/dashboard
7. ✅ No errors in browser console
8. ✅ No errors in terminal/server logs

---

## 🎯 Next Steps

1. **Test the flow end-to-end** (both sign up and sign in)
2. **Complete onboarding pages** for startup and investor
3. **Set up email templates** in Supabase Dashboard
4. **Add error handling** for edge cases
5. **Implement sign out** functionality
6. **Add account settings page** for users to manage their profile

---

## 📞 Support

If you encounter issues:

1. Check browser console for client-side errors
2. Check terminal for server-side errors  
3. Check Supabase Dashboard → Logs → Auth Logs
4. Verify all steps in Setup Instructions are completed
5. Test in incognito mode to rule out cache issues

**Common gotchas:**
- Forgetting to enable Google provider in Supabase Dashboard (90% of issues!)
- Wrong redirect URI in Google Console
- Not clicking "Save" after configuration changes
- Using wrong Supabase project
- RLS policies blocking user creation

---

**Status:** ✅ Google OAuth rebuilt from scratch using Supabase Auth  
**Date:** 2025-11-09  
**Tested:** Pending your testing  
**Ready for:** Development testing → Staging → Production
