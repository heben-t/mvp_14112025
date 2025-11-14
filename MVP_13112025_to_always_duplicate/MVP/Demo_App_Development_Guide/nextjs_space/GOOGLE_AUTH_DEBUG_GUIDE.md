# Google Auth Debug & Fix Guide

## Problem
When users sign up with Google OAuth, they get redirected to:
```
/onboarding/startup#error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user
```

## Root Cause Analysis

### 1. **OAuth Flow Mismatch**
- **Google OAuth** creates a user in `auth.users` table immediately
- **Database trigger** (`handle_new_user`) tries to insert into `public.users`
- **Role is missing** from `raw_user_meta_data` because OAuth doesn't pass metadata during signup
- **Trigger fails** because it can't determine the user role properly

### 2. **RLS Policy Issues**
- Trigger runs with limited permissions context
- RLS policies may be blocking the INSERT operation
- Need SECURITY DEFINER and proper policies

### 3. **Prisma Schema Constraints**
- `password` field is NOT NULL in schema but should be nullable for OAuth
- `role` enum must match exactly

## Solution Steps

### Step 1: Run SQL Fix (CRITICAL)
Execute `GOOGLE_AUTH_FIX.sql` in Supabase SQL Editor:
```bash
# Go to Supabase Dashboard > SQL Editor > New Query
# Copy and paste the contents of GOOGLE_AUTH_FIX.sql
# Click RUN
```

This SQL file:
✅ Updates trigger to handle missing role gracefully
✅ Creates function to update user role after OAuth
✅ Fixes RLS policies to allow trigger insertion
✅ Adds error handling to prevent auth failures

### Step 2: Update Callback Route (DONE)
The updated `app/auth/callback/route.ts`:
- Exchanges OAuth code for session
- Updates user metadata with role
- Calls `update_user_role()` RPC function
- Redirects to correct onboarding path

### Step 3: Update Signup Page (DONE)
The updated signup page:
- Stores role in session storage
- Passes role via redirect URL
- Adds proper OAuth options

### Step 4: Verify Prisma Schema
Ensure `schema.prisma` has:
```prisma
model users {
  id            String    @id
  email         String    @unique
  password      String?   // Must be nullable for OAuth
  role          UserRole  @default(INVESTOR)
  name          String?
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @default(now())
  // ... relations
}
```

## Testing Checklist

### Test 1: Google OAuth Signup
1. Go to `/auth/signup`
2. Select role (STARTUP or INVESTOR)
3. Click "Continue with Google"
4. Authenticate with Google
5. **Expected**: Redirect to `/onboarding/startup` or `/onboarding/investor`
6. **Expected**: User created in both `auth.users` and `public.users`

### Test 2: Email/Password Signup
1. Go to `/auth/signup`
2. Fill form with email/password
3. Submit
4. **Expected**: User created successfully
5. **Expected**: Redirect to onboarding

### Test 3: Database Verification
Run in Supabase SQL Editor:
```sql
-- Check if user exists in both tables
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'role' as auth_role,
  pu.role as public_role,
  pu.name
FROM auth.users au
LEFT JOIN public.users pu ON au.id::text = pu.id
WHERE au.email = 'test@example.com';
```

### Test 4: Trigger Verification
```sql
-- Check trigger exists and is active
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

## Common Issues & Solutions

### Issue 1: "Database error saving new user"
**Solution**: Run `GOOGLE_AUTH_FIX.sql` - the trigger lacks error handling

### Issue 2: Role is NULL in database
**Solution**: Callback route updates role after OAuth completes

### Issue 3: RLS policy blocks insertion
**Solution**: Added "Service role full access" policy in SQL fix

### Issue 4: Password constraint violation
**Solution**: Make password nullable in Prisma schema and run migration

### Issue 5: Trigger doesn't fire
**Solution**: Verify trigger exists:
```sql
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'users' AND event_object_schema = 'auth';
```

## Environment Variables Needed
Ensure `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Debugging Tips

### 1. Check Supabase Logs
- Go to Supabase Dashboard > Logs > Auth
- Filter for errors during signup
- Look for trigger execution errors

### 2. Check Database Logs
- Go to Supabase Dashboard > Logs > Database
- Look for RLS policy violations
- Check for constraint violations

### 3. Test Trigger Manually
```sql
-- Manually test trigger
DO $$
DECLARE
  test_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES (
    test_id,
    'testuser@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"role": "STARTUP", "name": "Test User"}'::jsonb
  );
  
  -- Check if user was created in public.users
  IF EXISTS (SELECT 1 FROM public.users WHERE id = test_id::text) THEN
    RAISE NOTICE 'SUCCESS: User created in public.users';
  ELSE
    RAISE NOTICE 'FAILED: User not found in public.users';
  END IF;
  
  -- Cleanup
  DELETE FROM auth.users WHERE id = test_id;
END $$;
```

### 4. Check RLS Policies
```sql
-- View all policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';
```

## Migration Path

If you've already run old SQL scripts:

### Option A: Clean Start (Recommended)
```sql
-- Remove old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_user_role(uuid, text);

-- Then run GOOGLE_AUTH_FIX.sql
```

### Option B: Keep Existing Data
```sql
-- Just update the function
-- GOOGLE_AUTH_FIX.sql uses CREATE OR REPLACE
-- Run the entire file, it will update safely
```

## Success Criteria
✅ Google OAuth signup completes without errors
✅ User appears in both `auth.users` and `public.users`
✅ Role is correctly set in `public.users`
✅ User redirected to correct onboarding path
✅ No errors in Supabase logs
✅ Email/password signup still works

## Next Steps After Fix
1. Test with real Google account
2. Verify onboarding flow works
3. Check user profile creation
4. Test logout and re-login
5. Monitor Supabase logs for any issues

## Support
If issues persist:
1. Check Supabase Dashboard > Logs
2. Run trigger verification queries
3. Test with manual SQL insertion
4. Verify environment variables
5. Check network tab in browser DevTools
