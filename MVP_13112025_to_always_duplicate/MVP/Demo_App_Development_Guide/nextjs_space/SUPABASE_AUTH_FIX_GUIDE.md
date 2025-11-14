# 🔧 FIXING SUPABASE AUTH DATABASE ERROR

## ❌ Error You're Seeing
```
http://localhost:3000/auth/signin#error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user
```

## 🎯 Root Cause
The `users` table in your database requires a `password` field (NOT NULL), but OAuth users (Google sign-in) don't have passwords. This causes the database insert to fail.

---

## ✅ SOLUTION - Follow These Steps

### **Step 1: Update Prisma Schema** ✅ DONE
The schema has been updated to make `password` optional:

```prisma
model users {
  id                String             @id
  email             String             @unique
  password          String?            // ✅ Now optional
  role              UserRole           @default(INVESTOR) // ✅ Added default
  name              String?
  emailVerified     DateTime?
  image             String?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @default(now()) // ✅ Added default
  // ... rest of fields
}
```

### **Step 2: Run SQL Migration in Supabase**

#### A. Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar

#### B. Copy and Run the SQL Script
Copy the entire contents of `FIX_SUPABASE_AUTH.sql` and paste into the SQL editor, then click **Run**.

**What this script does:**
1. ✅ Makes `password` field nullable
2. ✅ Adds default values for `role` and `updatedAt`
3. ✅ Creates a trigger function `handle_new_user()` 
4. ✅ Sets up automatic user creation when someone signs up via Supabase Auth
5. ✅ Configures Row Level Security (RLS) policies
6. ✅ Syncs email verification status

---

## 📋 SQL Script to Run (Also in FIX_SUPABASE_AUTH.sql)

```sql
-- Make password nullable for OAuth users
ALTER TABLE public.users 
  ALTER COLUMN password DROP NOT NULL;

-- Add defaults
ALTER TABLE public.users 
  ALTER COLUMN "updatedAt" SET DEFAULT NOW();

ALTER TABLE public.users 
  ALTER COLUMN role SET DEFAULT 'INVESTOR';

-- Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
  user_name text;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'INVESTOR');
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name', 
    split_part(NEW.email, '@', 1)
  );
  
  INSERT INTO public.users (
    id, email, password, role, name, 
    "emailVerified", image, "createdAt", "updatedAt"
  )
  VALUES (
    NEW.id, NEW.email, NULL, user_role::text, user_name,
    NEW.email_confirmed_at, NEW.raw_user_meta_data->>'avatar_url',
    NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    "emailVerified" = EXCLUDED."emailVerified",
    image = COALESCE(EXCLUDED.image, public.users.image),
    "updatedAt" = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow insert via trigger" ON public.users;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow insert via trigger"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
```

---

## 🧪 Step 3: Test the Fix

### Test with Email/Password Signup
```bash
npm run dev
# Visit http://localhost:3000/auth/signup
# Fill in the form and submit
# Should work now!
```

### Test with Google OAuth
```bash
# Visit http://localhost:3000/auth/signin
# Click "Continue with Google"
# Should redirect to Google and back successfully
```

---

## 🔍 How to Verify It's Working

### Check if trigger is active:
Run this in Supabase SQL Editor:
```sql
SELECT 
  trigger_name, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

You should see:
- `trigger_name`: on_auth_user_created
- `event_object_table`: users
- `action_statement`: EXECUTE FUNCTION public.handle_new_user()

### Check users table:
```sql
SELECT id, email, role, name, "emailVerified", "createdAt" 
FROM public.users 
ORDER BY "createdAt" DESC 
LIMIT 5;
```

After a successful signup, you should see the new user here.

---

## 📊 What Happens Now (Flow)

### Email/Password Signup:
1. User fills signup form
2. Supabase Auth creates user in `auth.users`
3. **Trigger fires** → `handle_new_user()` function runs
4. User automatically created in `public.users` with role from form
5. Redirect to onboarding

### Google OAuth:
1. User clicks "Continue with Google"
2. Redirects to Google for authentication
3. Google redirects back to `/auth/callback`
4. Supabase Auth creates user in `auth.users`
5. **Trigger fires** → User created in `public.users`
6. Redirect to dashboard/onboarding

---

## 🐛 Troubleshooting

### Error still occurs after running SQL
**Check:**
1. Did the SQL run without errors? Look for success message
2. Is the trigger active? Run the verification query above
3. Check Supabase logs: Dashboard → Logs → check for errors

### Users not appearing in public.users
**Solution:**
```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check auth.users
SELECT id, email, email_confirmed_at, raw_user_meta_data 
FROM auth.users;

-- Manually test trigger
-- (Sign up a test user and check if they appear in public.users)
```

### Password field error persists
**Run this:**
```sql
-- Verify password is nullable
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'password';

-- Should show is_nullable = 'YES'
```

---

## 🔄 Alternative: Reset and Recreate

If issues persist, you can drop and recreate the trigger:

```sql
-- Drop everything
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate (run the full script from FIX_SUPABASE_AUTH.sql)
```

---

## ✅ Verification Checklist

After running the fix:

- [ ] SQL script ran without errors
- [ ] Trigger `on_auth_user_created` exists in database
- [ ] Function `handle_new_user()` exists
- [ ] `password` column is nullable (check with query above)
- [ ] `role` has default value 'INVESTOR'
- [ ] RLS policies are active
- [ ] Test signup works (both email and Google)
- [ ] New users appear in `public.users` table
- [ ] No error in browser URL after signup

---

## 📝 Files Updated

1. ✅ `prisma/schema.prisma` - Made password optional, added defaults
2. ✅ `FIX_SUPABASE_AUTH.sql` - Complete SQL migration script
3. ✅ `SUPABASE_AUTH_FIX_GUIDE.md` - This guide

---

## 🚀 Next Steps After Fix

1. **Test all auth flows:**
   - Email signup
   - Email signin
   - Google OAuth signup
   - Google OAuth signin

2. **Check user creation:**
   - Verify users table has new entries
   - Check that role is set correctly
   - Verify email verification works

3. **Test onboarding redirect:**
   - STARTUP users → `/onboarding/startup`
   - INVESTOR users → `/onboarding/investor`

---

## 💡 Understanding the Fix

**Before:**
- Supabase Auth creates user in `auth.users` ✅
- App tries to manually create in `public.users` ❌
- Password field is required but OAuth has no password ❌
- **ERROR: Database error saving new user**

**After:**
- Supabase Auth creates user in `auth.users` ✅
- **Trigger automatically creates in `public.users`** ✅
- Password is optional (NULL for OAuth) ✅
- Role extracted from signup metadata ✅
- **SUCCESS: User created automatically** ✅

---

## 📞 Still Having Issues?

If you still get the error after running the SQL script:

1. **Check Supabase logs:**
   - Dashboard → Logs → Search for errors
   
2. **Verify table permissions:**
   ```sql
   SELECT grantee, privilege_type 
   FROM information_schema.role_table_grants 
   WHERE table_name = 'users';
   ```

3. **Check Prisma schema is synced:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Clear browser cache and cookies**

5. **Try in incognito/private mode**

---

**Last Updated:** November 7, 2025  
**Status:** ✅ Fix ready to apply  
**Tested:** Pending (run SQL in Supabase first)
