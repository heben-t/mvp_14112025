# ✅ Auth with Google OAuth - Complete Setup Guide

## Current Status
✅ **Both authentication methods enabled**:
- Email/Password signin
- Google OAuth signin

## Authentication Flow

```
SIGN IN (Email or Google)
    ↓
NextAuth Authentication
    ↓
Success → Redirect to /auth/onboarding/check
    ↓
Check user role (STARTUP | INVESTOR)
    ↓
Redirect to /auth/onboarding/{startup|investor}
    ↓
Onboarding page checks for profile
    ↓
├─ HAS PROFILE → Auto-redirect to /dashboard/{startup|investor}
└─ NO PROFILE → Show onboarding wizard
```

## 🔑 Required: Google OAuth Setup

### Step 1: Get Google OAuth Credentials

1. **Go to**: https://console.cloud.google.com/
2. **Create a new project** or select existing
3. **Enable Google+ API**:
   - APIs & Services → Library
   - Search "Google+ API"
   - Click Enable

4. **Create OAuth Credentials**:
   - APIs & Services → Credentials
   - Click "CREATE CREDENTIALS"
   - Select "OAuth client ID"
   
5. **Configure OAuth consent screen** (if first time):
   - User Type: External (for testing)
   - App name: Hebed AI
   - User support email: your@email.com
   - Developer contact: your@email.com
   - Save and Continue

6. **Create OAuth Client ID**:
   - Application type: **Web application**
   - Name: Hebed AI Web Client
   
7. **Add Authorized redirect URIs**:
   ```
   http://localhost:3002/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```

8. **Copy credentials**:
   - Client ID (starts with `xxx.apps.googleusercontent.com`)
   - Client Secret

### Step 2: Add to `.env` File

```bash
# Add these lines to your .env file
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🧪 Testing

### Test Email/Password Signin
1. Go to `http://localhost:3002/auth/signin`
2. Enter email/password
3. Expected redirect: `/auth/onboarding/{startup|investor}`

### Test Google OAuth Signin
1. Go to `http://localhost:3002/auth/signin`
2. Click "Continue with Google"
3. Complete Google authentication
4. Expected redirect: `/auth/onboarding/{startup|investor}`

### What Happens on Each Page

**`/auth/onboarding/check`**:
- Fetches user session
- Checks user role
- Redirects to appropriate onboarding

**`/auth/onboarding/startup`** or **`/auth/onboarding/investor`**:
- Checks if profile exists (via API call to `/api/profile/check`)
- If profile exists → redirect to `/dashboard/{role}`
- If no profile → show onboarding wizard

## 📋 Files Modified

1. ✅ `lib/auth.ts` - Google provider + signIn callback
2. ✅ `app/auth/signin/page.tsx` - Google button + NextAuth
3. ✅ `app/auth/onboarding/check/page.tsx` - Role-based redirect
4. ✅ `app/auth/onboarding/startup/page.tsx` - Profile check
5. ✅ `app/auth/onboarding/investor/page.tsx` - Profile check
6. ✅ `app/api/profile/check/route.ts` - Profile existence API

## 🔍 How the Redirect Works

### Email/Password Flow:
```typescript
// In signin page
const result = await signIn('credentials', {
  email,
  password,
  redirect: false,
});

if (result?.ok) {
  router.push('/auth/onboarding/check'); // ← Redirect here
}
```

### Google OAuth Flow:
```typescript
// In signin page
await signIn('google', {
  callbackUrl: '/auth/onboarding/check', // ← Redirect here after Google
});
```

### Onboarding Check:
```typescript
// In /auth/onboarding/check/page.tsx
const userRole = session.user.role;

if (userRole === 'STARTUP') {
  router.push('/auth/onboarding/startup'); // ← Final redirect
} else {
  router.push('/auth/onboarding/investor'); // ← Final redirect
}
```

## 🐛 Debugging

### If Google OAuth doesn't work:

1. **Check redirect URI**:
   - Must exactly match in Google Console
   - `http://localhost:3002/api/auth/callback/google`

2. **Check credentials in .env**:
   ```bash
   # View credentials (Windows)
   type .env | findstr GOOGLE
   ```

3. **Check browser console**:
   - F12 → Console tab
   - Look for errors

4. **Verify Google OAuth consent screen**:
   - Make sure it's published or in testing mode
   - Add your test email to test users

5. **Clear cookies**:
   - Dev Tools → Application → Cookies
   - Clear all for localhost

### If redirects don't work:

1. **Check session**:
   ```typescript
   // Add to any page
   const { data: session } = useSession();
   console.log('Session:', session);
   ```

2. **Check database**:
   ```sql
   SELECT id, email, role FROM users WHERE email = 'your@email.com';
   ```

3. **Check profile exists**:
   ```sql
   -- For startup
   SELECT * FROM startup_profiles WHERE user_id = 'user_id_here';
   
   -- For investor
   SELECT * FROM investor_profiles WHERE user_id = 'user_id_here';
   ```

## ✅ Expected Behavior

### New User (First Time):
1. Sign in with Google or email
2. → `/auth/onboarding/check`
3. → `/auth/onboarding/{startup|investor}`
4. No profile found
5. **Shows onboarding wizard**
6. Complete wizard
7. → `/dashboard/{startup|investor}`

### Existing User (Has Profile):
1. Sign in with Google or email
2. → `/auth/onboarding/check`
3. → `/auth/onboarding/{startup|investor}`
4. Profile exists
5. **Auto-redirect to dashboard** (in ~200-500ms)
6. → `/dashboard/{startup|investor}`

## 📝 Important Notes

- ⚠️ **Google credentials are REQUIRED** for Google OAuth to work
- ✅ Email/password works without Google credentials
- ✅ All redirects now go through `/auth/onboarding/{role}` first
- ✅ Onboarding pages handle dashboard redirect if profile exists
- ✅ No more redirect loops or `/auth/signin#` issues

## 🚀 Next Steps

1. **Add Google credentials to `.env`**
2. **Restart dev server**
3. **Test both signin methods**
4. **Verify redirect to onboarding pages**
5. **Complete onboarding wizard (if new user)**

---

**Status**: ✅ Code ready | ⚠️ Needs Google OAuth credentials
