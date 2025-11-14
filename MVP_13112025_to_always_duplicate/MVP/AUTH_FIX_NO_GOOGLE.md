# ✅ Auth Fixed - Email/Password Only (No Google OAuth Needed!)

## What Was Wrong
- App used **two different auth systems** (Supabase + NextAuth)
- Caused `/auth/signin#` redirect loops
- Sessions weren't compatible

## What I Fixed
- ✅ Removed Supabase Auth completely
- ✅ Using **NextAuth only** with email/password
- ✅ Removed Google OAuth (no credentials needed!)
- ✅ Fixed redirect flow

## Current Authentication Flow

```
1. User enters email/password on /auth/signin
2. NextAuth validates credentials
3. Creates session
4. Redirects to /auth/onboarding/check
5. Check redirects to /auth/onboarding/{startup|investor}
6. Onboarding page checks if profile exists:
   ├─ Has profile → Auto-redirect to /dashboard/{startup|investor}
   └─ No profile → Show onboarding wizard
```

## Test It Now!

**Server running on**: `http://localhost:3002`

### Test Steps:
1. **Go to**: `http://localhost:3002/auth/signin`
2. **Enter existing user** credentials from database
3. **Expected**: 
   - Sign in successful
   - Redirect to `/auth/onboarding/check`
   - Then redirect to `/auth/onboarding/{startup|investor}`
   - If you have a profile → dashboard
   - If no profile → onboarding form

### Create Test User (Optional)
If you need a test account:

```sql
-- Run in Supabase SQL editor
INSERT INTO users (email, password, role, name, created_at, updated_at)
VALUES (
  'test@example.com',
  '$2a$10$YourBcryptHashHere', -- You'll need to hash the password
  'STARTUP',
  'Test User',
  NOW(),
  NOW()
);
```

Or use the signup page:
- Go to `http://localhost:3002/auth/signup`
- Create account
- Sign in

## Files Changed

1. ✅ `lib/auth.ts` - Removed Google provider
2. ✅ `app/auth/signin/page.tsx` - Removed Google button
3. ✅ `app/auth/onboarding/startup/page.tsx` - Uses NextAuth
4. ✅ `app/auth/onboarding/investor/page.tsx` - Uses NextAuth
5. ✅ `app/auth/onboarding/check/page.tsx` - NEW (role-based redirect)
6. ✅ `app/api/profile/check/route.ts` - NEW (profile check)

## Why No Google OAuth Needed?

Google OAuth requires:
- Google Cloud Console setup
- OAuth 2.0 credentials (Client ID + Secret)
- Redirect URI configuration

**For email/password only**, you just need:
- ✅ Database with users table (you have this)
- ✅ NextAuth configured (done)
- ✅ Password hashing with bcrypt (done)

## If You Want Google OAuth Later

Just uncomment the Google provider in `lib/auth.ts` and add:
```env
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
```

## Debugging

If signin doesn't work:

1. **Check database has users**:
   ```sql
   SELECT id, email, role FROM users;
   ```

2. **Check password is hashed**:
   - Must be bcrypt hash (starts with `$2a$` or `$2b$`)

3. **Clear browser cookies**:
   - Dev tools → Application → Cookies → Clear all for localhost

4. **Check console for errors**:
   - F12 → Console tab

## Status: ✅ READY TO TEST

No credentials needed - just test with email/password!
