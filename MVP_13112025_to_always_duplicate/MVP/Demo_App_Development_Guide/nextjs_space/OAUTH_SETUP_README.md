# 🎯 Google OAuth Rebuild - Complete Implementation

## 📋 Overview

This is a **complete rebuild** of Google OAuth authentication from scratch, removing NextAuth and using **pure Supabase Auth** for both email/password and Google OAuth sign-in/sign-up.

### Why This Rebuild?

- ✅ **Removed conflicts** between NextAuth and Supabase Auth
- ✅ **Simpler architecture** - one authentication system instead of two
- ✅ **Better type safety** with TypeScript and Supabase types
- ✅ **Automatic user creation** via database triggers
- ✅ **Proper RLS policies** for security
- ✅ **Role-based routing** (Startup vs Investor)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Database Setup

```bash
npm run setup:oauth
```

This creates the necessary tables, RLS policies, and triggers for OAuth.

### Step 2: Supabase Dashboard Configuration

1. **Go to:** https://app.supabase.com/project/gnzcvhyxiatcjofywkdq/auth/providers

2. **Enable Google Provider:**
   - Toggle "Enable Google provider" to **ON**
   - Enter credentials:
     ```
     Client ID: 827886733055-tbn7nm5k2j6ktiou29rki9j6rk911ata.apps.googleusercontent.com
     Client Secret: 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
     ```
   - Click **"Save"**

3. **Configure Site URL:**
   - Go to: Auth → URL Configuration
   - Set Site URL: `http://localhost:3000`
   - Add Redirect URLs:
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000/auth/onboarding/startup
     http://localhost:3000/auth/onboarding/investor
     ```

### Step 3: Google Cloud Console Configuration

1. **Go to:** https://console.cloud.google.com/apis/credentials

2. **Edit your OAuth 2.0 Client**

3. **Add Authorized redirect URIs:**
   ```
   https://gnzcvhyxiatcjofywkdq.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```

4. **Add Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://gnzcvhyxiatcjofywkdq.supabase.co
   ```

5. **Click "Save"**

---

## ✅ Verification

```bash
npm run verify:oauth
```

This checks:
- ✅ Environment variables are set
- ✅ Database tables exist
- ✅ RLS policies are configured
- ✅ Supabase connection works

---

## 🧪 Testing

### Test Sign Up with Google

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Open: http://localhost:3000/auth/signup

3. Select role (Startup or Investor)

4. Click "Continue with Google"

5. **Expected flow:**
   - Redirects to Google login
   - After authentication, returns to app
   - User created in database with selected role
   - Redirects to onboarding page

### Test Sign In with Google

1. Open: http://localhost:3000/auth/signin

2. Click "Continue with Google"

3. **Expected flow:**
   - Quick redirect (already logged in with Google)
   - Session created
   - Redirects to dashboard or onboarding

### Test Email/Password

1. Open: http://localhost:3000/auth/signup

2. Fill in name, email, password

3. Click "Create Account"

4. **Expected flow:**
   - Email verification sent (if enabled)
   - Or immediately logged in (if email verification disabled)
   - Redirects to onboarding

---

## 📁 New Files Created

### Authentication Files

1. **`lib/supabase-client.ts`**
   - Client-side Supabase helper for browser components
   - Used in sign-in/sign-up pages

2. **`lib/auth.ts`** (rewritten)
   - Server-side Supabase client
   - Session and user utilities

3. **`types/supabase.ts`**
   - TypeScript types for database tables
   - Enables type-safe queries

### Pages

4. **`app/auth/verify-email/page.tsx`**
   - Email verification instructions page
   - Shows after email sign-up (if verification enabled)

5. **`app/auth/signin/page.tsx`** (updated)
   - Now uses Supabase Auth instead of NextAuth
   - Google OAuth + email/password sign-in

6. **`app/auth/signup/page.tsx`** (updated)
   - Now uses Supabase Auth
   - Google OAuth + email/password sign-up
   - Role selection (Startup/Investor)

7. **`app/auth/callback/route.ts`** (enhanced)
   - Handles OAuth callback from Google/Supabase
   - Creates user in database
   - Role-based routing

### Setup & Documentation

8. **`setup-google-oauth-database.sql`**
   - Complete database migration
   - Creates tables, RLS policies, triggers

9. **`setup-google-oauth.ts`**
   - Script to execute database setup
   - Run with: `npm run setup:oauth`

10. **`verify-oauth-setup.ts`**
    - Verification script
    - Run with: `npm run verify:oauth`

11. **`GOOGLE_OAUTH_REBUILD_COMPLETE.md`**
    - Comprehensive documentation
    - Detailed setup instructions
    - Troubleshooting guide

12. **`QUICK_START_OAUTH.md`**
    - Quick reference guide
    - Common issues & fixes

13. **`OAUTH_SETUP_README.md`** (this file)
    - Complete implementation guide

---

## 🔄 Modified Files

1. **`app/api/auth/[...nextauth]/route.ts`**
   - Deprecated (returns 410 Gone)
   - NextAuth no longer used

2. **`package.json`**
   - Added scripts: `setup:oauth`, `verify:oauth`

---

## 🏗️ Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Authentication                       │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
         ┌──────▼──────┐            ┌──────▼──────┐
         │   Google    │            │Email/Password│
         │    OAuth    │            │   Sign Up    │
         └──────┬──────┘            └──────┬───────┘
                │                           │
                │    ┌──────────────────────┘
                │    │
         ┌──────▼────▼──────┐
         │  Supabase Auth   │
         │  (auth.users)    │
         └──────┬────────────┘
                │
         ┌──────▼──────┐
         │  Database   │ ← Trigger creates user in public.users
         │   Trigger   │   with role, name, email, etc.
         └──────┬──────┘
                │
         ┌──────▼──────┐
         │public.users │
         │    table    │
         └──────┬──────┘
                │
      ┌─────────┴─────────┐
      │                   │
┌─────▼─────┐      ┌─────▼─────┐
│  Startup  │      │ Investor  │
│  Profile  │      │  Profile  │
└───────────┘      └───────────┘
```

### OAuth Flow Diagram

```
1. User clicks "Continue with Google"
   ↓
2. createClient().auth.signInWithOAuth({ provider: 'google' })
   ↓
3. Redirect to Google OAuth consent screen
   ↓
4. User authenticates with Google
   ↓
5. Google redirects to Supabase:
   https://PROJECT.supabase.co/auth/v1/callback?code=...
   ↓
6. Supabase creates session & user in auth.users
   ↓
7. Database trigger fires → creates user in public.users
   ↓
8. Supabase redirects to your app:
   http://localhost:3000/auth/callback?code=...&role=STARTUP
   ↓
9. /auth/callback/route.ts:
   - Exchanges code for session
   - Verifies user in public.users
   - Checks onboarding status
   - Redirects to appropriate page
   ↓
10. User lands on:
    - NEW user → /auth/onboarding/{role}
    - EXISTING incomplete → /auth/onboarding/{role}
    - EXISTING complete → /{role}/dashboard
```

---

## 🔒 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with these policies:

**Users Table:**
- ✅ Users can view their own profile
- ✅ Users can view all users (for browsing)
- ✅ Users can update their own profile
- ✅ Service role can insert (for OAuth)

**Startup/Investor Profiles:**
- ✅ Users can only view/update their own profile
- ✅ Automatic creation via foreign key relationships

### Database Triggers

**`on_auth_user_created` Trigger:**
- Automatically creates user in `public.users` when created in `auth.users`
- Extracts name, role, avatar from OAuth metadata
- Sets email verification status
- Handles Google OAuth and email/password signup

---

## 🔧 Environment Variables

Required in `.env`:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://gnzcvhyxiatcjofywkdq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth (REFERENCE ONLY - configured in Supabase Dashboard)
GOOGLE_CLIENT_ID=827886733055-tbn7nm5k2j6ktiou29rki9j6rk911ata.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

**Important:** Google credentials must be configured in **Supabase Dashboard**, not just in `.env`!

---

## 🐛 Troubleshooting

### "redirect_uri_mismatch" Error

**Problem:** Google doesn't recognize the redirect URI

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client
3. Add **exactly**: `https://gnzcvhyxiatcjofywkdq.supabase.co/auth/v1/callback`
4. Click **Save**

### "Invalid client" Error

**Problem:** Client ID or Secret mismatch

**Solution:**
1. Go to Supabase Dashboard → Auth → Providers → Google
2. Re-enter Client ID and Secret
3. Click **Save**
4. Verify they match Google Console

### User Not Created in Database

**Problem:** OAuth works but no user record

**Solution:**
```bash
# Run database setup
npm run setup:oauth

# Or manually execute in Supabase SQL Editor:
# Copy contents of setup-google-oauth-database.sql
```

### Session Not Persisting

**Problem:** User logged out on page refresh

**Solution:**
- Use `http://localhost:3000` not `127.0.0.1`
- Clear browser cookies and localStorage
- Try in incognito mode
- Check Supabase Auth logs for errors

### Google Button Does Nothing

**Problem:** Click does nothing or shows error in console

**Solution:**
1. Check browser console for errors
2. Verify Google provider enabled in Supabase
3. Check network tab for redirect
4. Verify `createClient()` is imported correctly

---

## 📊 Database Schema

### `public.users` Table

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,                    -- Matches auth.users.id
  email TEXT UNIQUE NOT NULL,             -- User's email
  name TEXT,                              -- Display name
  role TEXT NOT NULL,                     -- 'STARTUP' or 'INVESTOR'
  image TEXT,                             -- Avatar URL
  "emailVerified" TIMESTAMPTZ,            -- Email verification date
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),  -- Account creation
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()   -- Last update
);
```

### `public.startup_profiles` Table

```sql
CREATE TABLE public.startup_profiles (
  id UUID PRIMARY KEY,
  "userId" UUID UNIQUE REFERENCES users(id),
  "companyName" TEXT,
  industry TEXT,
  stage TEXT,
  "onboardingComplete" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ,
  "updatedAt" TIMESTAMPTZ
);
```

### `public.investor_profiles` Table

```sql
CREATE TABLE public.investor_profiles (
  id UUID PRIMARY KEY,
  "userId" UUID UNIQUE REFERENCES users(id),
  "onboardingComplete" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ,
  "updatedAt" TIMESTAMPTZ
);
```

---

## 🎯 Next Steps

After completing the setup:

1. **✅ Test the full OAuth flow** (signup + signin)
2. **✅ Complete onboarding pages** for both roles
3. **✅ Implement dashboard pages**
4. **✅ Add sign-out functionality**
5. **✅ Set up email templates** in Supabase
6. **✅ Configure password requirements**
7. **✅ Add profile editing**
8. **✅ Implement password reset**

---

## 📞 Support & Resources

### Documentation
- **Full Guide:** `GOOGLE_OAUTH_REBUILD_COMPLETE.md`
- **Quick Start:** `QUICK_START_OAUTH.md`
- **This File:** `OAUTH_SETUP_README.md`

### Supabase Resources
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [OAuth with Supabase](https://supabase.com/docs/guides/auth/social-login)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

### Google OAuth Resources
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)

---

## ✅ Checklist

**Setup Complete When:**

- [x] Database tables created
- [x] RLS policies enabled
- [x] Triggers configured
- [ ] Google enabled in Supabase Dashboard ← **DO THIS**
- [ ] Google credentials saved in Supabase ← **DO THIS**
- [ ] Redirect URIs added in Google Console ← **DO THIS**
- [ ] Verification script passes: `npm run verify:oauth`
- [ ] Test signup works with Google
- [ ] Test signin works with Google
- [ ] Test email/password signup works
- [ ] User created in database with correct role
- [ ] Session persists on page refresh
- [ ] Redirects to correct onboarding/dashboard

---

**Status:** ✅ Code complete, ready for configuration  
**Last Updated:** 2025-11-09  
**Version:** 2.0 (Supabase Auth)  
**Previous:** 1.0 (NextAuth - deprecated)
