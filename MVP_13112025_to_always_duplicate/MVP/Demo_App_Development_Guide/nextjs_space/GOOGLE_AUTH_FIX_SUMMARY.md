# Google Auth Database Error - Complete Fix Summary

## 🔴 Problem
When users sign up with Google OAuth, they encounter:
```
Error: onboarding/startup#error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user
```

## 🔍 Root Cause

### The Issue Chain:
1. **User clicks "Continue with Google"** → Redirected to Google OAuth
2. **Google authenticates** → Returns to `/auth/callback?role=STARTUP`
3. **Supabase creates auth.users entry** → Triggers `handle_new_user()` function
4. **Trigger tries to insert into public.users** → **FAILS** because:
   - Role not in `raw_user_meta_data` (passed via URL instead)
   - Trigger lacks error handling
   - RLS policies may block insertion
   - No graceful fallback

### Key Problems Identified:
❌ OAuth flow doesn't pass metadata during signup (role comes from URL)
❌ Database trigger expects role in metadata
❌ No error handling in trigger function
❌ RLS policies not optimized for trigger context
❌ Callback route doesn't exchange code or update user data

---

## ✅ Complete Solution

### Step 1: Apply SQL Fix
**File**: `GOOGLE_AUTH_FIX.sql`

**Run this in Supabase Dashboard → SQL Editor**

Key changes:
- ✅ Updated `handle_new_user()` trigger with error handling
- ✅ Added default role (INVESTOR) if metadata missing
- ✅ Created `update_user_role()` RPC function for post-OAuth update
- ✅ Fixed RLS policies to allow trigger insertion
- ✅ Added try-catch to prevent auth failure on DB errors

```sql
-- Just run the entire GOOGLE_AUTH_FIX.sql file
-- It's safe to run multiple times (uses CREATE OR REPLACE)
```

### Step 2: Updated Callback Route
**File**: `app/auth/callback/route.ts`

Key changes:
- ✅ Exchanges OAuth code for session
- ✅ Updates user metadata with role
- ✅ Calls `update_user_role()` RPC to set role in public.users
- ✅ Properly redirects to onboarding path

### Step 3: Enhanced Signup Page
**File**: `app/auth/signup/page.tsx`

Key changes:
- ✅ Stores role in sessionStorage
- ✅ Passes role via redirect URL
- ✅ Adds proper OAuth query params

---

## 📋 Implementation Checklist

### ☑️ Step-by-Step Guide:

#### 1. Run SQL Fix (5 minutes)
```bash
1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Click "New Query"
4. Copy entire contents of GOOGLE_AUTH_FIX.sql
5. Click "RUN" button
6. Verify success message appears
```

**Expected output:**
```
Google Auth fix applied successfully!
```

#### 2. Verify Database Changes
Run `DIAGNOSTICS.sql` to confirm:
```sql
-- Should show on_auth_user_created trigger exists
-- Should show handle_new_user function with SECURITY DEFINER
-- Should show 4-5 RLS policies on users table
```

#### 3. Deploy Code Changes (Already done)
Files modified:
- ✅ `app/auth/callback/route.ts` - Enhanced OAuth callback
- ✅ `app/auth/signup/page.tsx` - Improved signup flow

#### 4. Test the Fix
**Test Case 1: Google OAuth Signup**
```
1. Navigate to /auth/signup
2. Select "Startup" role
3. Click "Continue with Google"
4. Authenticate with Google
5. EXPECTED: Redirect to /onboarding/startup
6. EXPECTED: No error message
7. EXPECTED: User created in database
```

**Verification Query:**
```sql
SELECT 
  au.email,
  au.raw_user_meta_data->>'role' as auth_role,
  pu.role as public_role,
  pu.name
FROM auth.users au
JOIN public.users pu ON au.id::text = pu.id
WHERE au.email = 'your-test-email@gmail.com';
```

---

## 🔧 Technical Details

### Database Trigger Flow (Fixed)

**Before (Broken):**
```
1. Google Auth → auth.users INSERT
2. Trigger fires → handle_new_user()
3. Looks for role in metadata → NOT FOUND
4. Tries to insert with NULL role → FAILS
5. Error propagates to client → User sees error
```

**After (Fixed):**
```
1. Google Auth → auth.users INSERT
2. Trigger fires → handle_new_user()
3. Looks for role in metadata → NOT FOUND
4. Uses default: 'INVESTOR'
5. Inserts successfully with error handling
6. User continues to callback
7. Callback updates role from URL param
8. Final state: correct role in database
```

### RLS Policy Changes

**New Policies:**
```sql
-- Allows trigger to insert (critical!)
"Allow insert via trigger" - WITH CHECK (true)

-- Service role has full access
"Service role full access" - FOR ALL (service_role only)

-- Users access own data
"Users can view own profile" - FOR SELECT (auth.uid() = id)
"Users can update own profile" - FOR UPDATE (auth.uid() = id)
```

### Callback Route Logic

```typescript
1. Extract code and role from URL
2. Exchange code for session (Supabase Auth)
3. Update auth.users metadata with role
4. Call update_user_role() RPC to update public.users
5. Redirect to onboarding with correct role
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

**✅ Google OAuth - Startup Role**
- [ ] Can signup as STARTUP
- [ ] Redirects to /onboarding/startup
- [ ] User in auth.users
- [ ] User in public.users with role='STARTUP'
- [ ] No error messages

**✅ Google OAuth - Investor Role**
- [ ] Can signup as INVESTOR
- [ ] Redirects to /onboarding/investor
- [ ] User in auth.users
- [ ] User in public.users with role='INVESTOR'
- [ ] No error messages

**✅ Email/Password Signup**
- [ ] Still works as before
- [ ] No regression

**✅ Edge Cases**
- [ ] Duplicate signup (same email) handled
- [ ] Network errors handled gracefully
- [ ] Missing role defaults to INVESTOR

### Database Verification Queries

**Check user sync:**
```sql
-- Should show matching data
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'role' as auth_metadata_role,
  pu.role as public_table_role,
  pu.name,
  pu."createdAt"
FROM auth.users au
LEFT JOIN public.users pu ON au.id::text = pu.id
ORDER BY au.created_at DESC
LIMIT 10;
```

**Check for orphaned users:**
```sql
-- Should return 0 rows
SELECT * FROM public.users pu
LEFT JOIN auth.users au ON pu.id = au.id::text
WHERE au.id IS NULL;
```

**Check trigger status:**
```sql
-- Should show trigger as active
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

---

## 🚨 Troubleshooting

### Issue: Still getting database error

**Check:**
1. Did you run `GOOGLE_AUTH_FIX.sql` completely?
2. Check Supabase logs: Dashboard → Logs → Database
3. Verify trigger exists:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

**Solution:**
```sql
-- Recreate trigger manually
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Issue: Role is NULL in database

**Check:**
1. Verify callback route is updating role
2. Check if `update_user_role()` function exists:
```sql
SELECT * FROM information_schema.routines 
WHERE routine_name = 'update_user_role';
```

**Solution:**
- Ensure callback route uses service role client
- Check SUPABASE_SERVICE_ROLE_KEY in .env.local

### Issue: RLS policy blocks insertion

**Check:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

**Solution:**
```sql
-- Ensure this policy exists
CREATE POLICY "Allow insert via trigger"
  ON public.users
  FOR INSERT
  WITH CHECK (true);
```

### Issue: Password constraint violation

**Check if password is nullable:**
```sql
SELECT column_name, is_nullable 
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'password';
```

**Solution:**
```sql
ALTER TABLE public.users 
  ALTER COLUMN password DROP NOT NULL;
```

---

## 📊 Monitoring

### Supabase Dashboard Logs

**Auth Logs:**
- Dashboard → Logs → Auth
- Filter for errors
- Look for failed signups

**Database Logs:**
- Dashboard → Logs → Database  
- Check for trigger errors
- Check for RLS violations

**Edge Function Logs:**
- Dashboard → Logs → Edge Functions
- If using edge functions

### Success Metrics

After fix is deployed:
- ✅ 0 "Database error saving new user" errors
- ✅ 100% OAuth signup success rate
- ✅ All users in both auth.users and public.users
- ✅ Correct role assigned

---

## 🔐 Security Considerations

✅ **RLS Enabled:** Users can only access their own data
✅ **Service Role Limited:** Only callback route uses service role
✅ **Trigger Security:** SECURITY DEFINER ensures proper permissions
✅ **OAuth State:** Role passed via URL param, validated on server

---

## 📝 Files Created/Modified

### New Files:
1. `GOOGLE_AUTH_FIX.sql` - Main SQL fix
2. `GOOGLE_AUTH_DEBUG_GUIDE.md` - Detailed debugging guide
3. `DIAGNOSTICS.sql` - Diagnostic queries
4. `THIS_FILE.md` - Complete summary

### Modified Files:
1. `app/auth/callback/route.ts` - Enhanced OAuth callback
2. `app/auth/signup/page.tsx` - Improved signup flow

---

## ✨ Expected Outcome

After applying all fixes:

1. **Google OAuth works perfectly**
   - Users select role
   - Click "Continue with Google"
   - Authenticate
   - Seamlessly redirect to onboarding
   - No errors

2. **Database sync is perfect**
   - User in auth.users
   - User in public.users
   - Roles match
   - Metadata synced

3. **No breaking changes**
   - Email/password signup still works
   - Existing users unaffected
   - All other features functional

---

## 🎯 Next Steps

After verifying the fix works:

1. **Monitor Supabase logs** for first few days
2. **Track signup completion rates**
3. **Collect user feedback** on auth flow
4. **Consider email verification flow** enhancement
5. **Add analytics** to track OAuth vs email signup

---

## 📞 Support

If you encounter issues:
1. Run `DIAGNOSTICS.sql` and share output
2. Check Supabase Dashboard logs
3. Verify environment variables
4. Test with fresh incognito window
5. Clear browser cache and cookies

---

**Status:** ✅ Ready to deploy
**Priority:** 🔴 Critical (blocking user signups)
**Estimated Fix Time:** 10 minutes
**Testing Time:** 15 minutes
