# Fixed: Auth Redirect Loop Issue ✅

## Problem Identified
The app was using **two different authentication systems**:
- Sign-in pages were using **Supabase Auth** 
- Dashboard/protected routes were using **NextAuth**

This caused redirect loops and `/auth/signin#` URLs.

## Solution Implemented

### Migrated to NextAuth completely

1. **Updated `lib/auth.ts`**
   - Added GoogleProvider for OAuth
   - Added signIn callback to create/fetch users from database
   - Handles user creation for OAuth sign-ins

2. **Updated `app/auth/signin/page.tsx`**
   - Removed Supabase Auth imports
   - Now uses `signIn` from `next-auth/react`
   - Email sign-in uses NextAuth credentials provider
   - Google sign-in uses NextAuth google provider

3. **Created `/api/profile/check` API route**
   - Checks if user has completed onboarding
   - Returns `{ hasProfile: boolean }`
   - Used by onboarding pages

4. **Updated Onboarding Pages**
   - `/app/auth/onboarding/startup/page.tsx`
   - `/app/auth/onboarding/investor/page.tsx`
   - Now use `useSession` from next-auth
   - Call `/api/profile/check` to determine redirect

5. **Created `/app/auth/onboarding/check/page.tsx`**
   - Intermediate page after sign-in
   - Redirects to appropriate onboarding based on role

## Current Flow

```
SIGN IN (Email or Google)
    ↓
NextAuth handles authentication
    ↓
Redirect to /auth/onboarding/check
    ↓
Check user role (STARTUP | INVESTOR)
    ↓
Redirect to /auth/onboarding/{startup|investor}
    ↓
Onboarding page checks for profile
    ↓
├─ HAS PROFILE → /dashboard/{startup|investor}
└─ NO PROFILE → Show onboarding wizard
```

## Required Setup

### 1. Add Google OAuth Credentials to `.env`

```bash
# Add these to your .env file
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 2. Get Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create project or select existing
3. Enable **Google+ API**
4. **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. **Authorized redirect URIs**:
   ```
   http://localhost:3002/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```
7. Copy **Client ID** and **Client Secret** to `.env`

### 3. Restart Dev Server

```bash
# Stop current server
Ctrl+C

# Restart
npm run dev
```

## Testing

### Test 1: Email Sign-In
1. Go to `http://localhost:3002/auth/signin`
2. Enter credentials
3. Expect redirect to `/auth/onboarding/{role}`
4. If profile exists → auto-redirect to dashboard
5. If no profile → show onboarding form

### Test 2: Google Sign-In
1. Go to `http://localhost:3002/auth/signin`
2. Click "Continue with Google"
3. Complete Google OAuth
4. Expect redirect to `/auth/onboarding/{role}`
5. New user → show onboarding
6. Existing user with profile → dashboard

## Files Modified

1. ✅ `lib/auth.ts` - Added Google provider
2. ✅ `app/auth/signin/page.tsx` - Migrated to NextAuth
3. ✅ `app/auth/onboarding/startup/page.tsx` - Use NextAuth session
4. ✅ `app/auth/onboarding/investor/page.tsx` - Use NextAuth session
5. ✅ `app/auth/onboarding/check/page.tsx` - NEW (redirect logic)
6. ✅ `app/api/profile/check/route.ts` - NEW (profile check API)

## What's Different Now

| Before | After |
|--------|-------|
| Supabase Auth for signin | NextAuth for all auth |
| Mixed auth systems | Single auth system |
| Redirect loops | Clean redirects |
| `/auth/signin#` URLs | Proper redirects |

## Debugging

If issues persist:

1. **Check Google OAuth setup**:
   ```bash
   # Verify credentials in .env
   echo $GOOGLE_CLIENT_ID
   echo $GOOGLE_CLIENT_SECRET
   ```

2. **Check NextAuth callback URL**:
   - Should be: `http://localhost:3002/api/auth/callback/google`

3. **Check database**:
   ```sql
   SELECT id, email, role FROM users WHERE email = 'your@email.com';
   ```

4. **Check session**:
   ```typescript
   // In any client component
   const { data: session } = useSession();
   console.log('Session:', session);
   ```

5. **Clear browser data**:
   - Clear cookies for `localhost`
   - Clear Next-Auth session cookies

## Notes

- ✅ SessionProvider already set up in `components/providers.tsx`
- ✅ next-auth package already installed
- ✅ Database schema compatible (uses `users` table)
- ⚠️ Need to add Google OAuth credentials
- ⚠️ Removed Supabase Auth callback (no longer needed)

## Status

🟡 **Awaiting**: Google OAuth credentials setup
🟢 **Ready**: Code changes complete
🔵 **Testing**: Pending credentials
