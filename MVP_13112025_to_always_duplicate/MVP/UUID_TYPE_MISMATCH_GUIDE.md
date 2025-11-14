# UUID/TEXT Type Mismatch Fix - Complete Guide

## 🔴 The Problem

**Error Message:**
```
ERROR: operator does not exist: text = uuid (SQLSTATE 42883)
```

**Root Cause:**
Your application has a type mismatch between:
- **Supabase `auth.users.id`**: Uses `UUID` type
- **Public `users.id`**: Uses `TEXT` type (from Prisma schema)

When triggers or RLS policies try to compare these without explicit casting, PostgreSQL throws an error because it can't directly compare UUID and TEXT types.

---

## 🎯 Where the Error Occurs

### 1. **Database Triggers**
```sql
-- ❌ WRONG (causes error)
INSERT INTO public.users (id, ...)
VALUES (NEW.id, ...)  -- NEW.id is UUID, public.users.id is TEXT

-- ✅ CORRECT
INSERT INTO public.users (id, ...)
VALUES (NEW.id::text, ...)  -- Explicitly cast UUID to TEXT
```

### 2. **RLS Policies**
```sql
-- ❌ WRONG (causes error)
USING (auth.uid() = id)  -- auth.uid() returns UUID, id is TEXT

-- ✅ CORRECT
USING (auth.uid()::text = id)  -- Cast UUID to TEXT before comparison
```

### 3. **Foreign Key Relationships**
```sql
-- ❌ WRONG
WHERE "userId" = auth.uid()  -- userId is TEXT, auth.uid() is UUID

-- ✅ CORRECT
WHERE "userId" = auth.uid()::text  -- Cast to match
```

---

## 🔧 The Solution

### Step 1: Apply the Complete Fix

Run this SQL file in your Supabase SQL Editor:
```
Demo_App_Development_Guide/ai_roi_dashboard/nextjs_space/COMPLETE_UUID_FIX.sql
```

This will:
- ✅ Update all triggers with proper UUID→TEXT casting
- ✅ Fix all RLS policies
- ✅ Create helper functions for OAuth
- ✅ Verify the setup

### Step 2: Verify the Fix

After running the SQL, check:

```sql
-- 1. Verify triggers exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';
-- Expected: on_auth_user_created, on_auth_user_email_verified

-- 2. Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';
-- Expected: rowsecurity = true

-- 3. Test trigger manually (optional)
SELECT public.handle_new_user();
```

### Step 3: Test Google OAuth

1. Go to your app's login page
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Check Supabase SQL Editor:

```sql
-- Verify user was created
SELECT id, email, role, name 
FROM public.users 
ORDER BY "createdAt" DESC 
LIMIT 5;

-- Check if auth.users and public.users match
SELECT 
  a.id as auth_id,
  a.email as auth_email,
  u.id as public_id,
  u.email as public_email,
  u.role
FROM auth.users a
LEFT JOIN public.users u ON a.id::text = u.id
ORDER BY a.created_at DESC
LIMIT 5;
```

---

## 📋 All Locations Fixed

### Triggers
- ✅ `handle_new_user()` - Casts `NEW.id::text`
- ✅ `sync_email_verification()` - Casts `NEW.id::text`
- ✅ `update_user_role()` - Casts `user_id_param::text`

### RLS Policies

#### public.users
- ✅ "Users can view own profile" - `auth.uid()::text = id`
- ✅ "Users can update own profile" - `auth.uid()::text = id`

#### public.startup_profiles
- ✅ "Startup users can view own profile" - `auth.uid()::text = "userId"`
- ✅ "Startup users can update own profile" - `auth.uid()::text = "userId"`
- ✅ "Startup users can insert own profile" - `auth.uid()::text = "userId"`

#### public.investor_profiles
- ✅ "Investor users can view own profile" - `auth.uid()::text = "userId"`
- ✅ "Investor users can update own profile" - `auth.uid()::text = "userId"`
- ✅ "Investor users can insert own profile" - `auth.uid()::text = "userId"`

#### public.campaigns
- ✅ "Startup can manage own campaigns" - `"userId" = auth.uid()::text`

#### public.investments
- ✅ "Investor can view own investments" - `"userId" = auth.uid()::text`
- ✅ "Investor can create investments" - `"userId" = auth.uid()::text`
- ✅ "Startup can view received investments" - `sp."userId" = auth.uid()::text`

#### public.watchlists
- ✅ "Investor can manage own watchlist" - `"userId" = auth.uid()::text`

---

## 🔍 Understanding the Types

### Supabase Auth (auth.users)
```sql
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,  -- ← UUID type
  email TEXT,
  ...
);
```

### Your Public Schema (from Prisma)
```typescript
// Prisma schema.prisma
model users {
  id    String  @id  // ← Becomes TEXT in PostgreSQL
  email String  @unique
  ...
}
```

### PostgreSQL Types
- **UUID**: 128-bit universally unique identifier (e.g., `550e8400-e29b-41d4-a716-446655440000`)
- **TEXT**: Variable-length character string (e.g., `"550e8400-e29b-41d4-a716-446655440000"`)

**Important:** While a UUID *can* be represented as text, PostgreSQL treats them as different types and won't compare them without explicit casting.

---

## 🚀 Why This Approach Works

### Option 1: Cast UUID to TEXT (Our Solution)
```sql
auth.uid()::text = users.id  -- Convert UUID to TEXT
```
**Pros:**
- ✅ No schema changes needed
- ✅ Works with existing Prisma schema
- ✅ Quick to implement

**Cons:**
- ⚠️ Slightly less efficient (minimal impact)
- ⚠️ Must remember to cast in all queries

### Option 2: Change Prisma Schema to UUID (Alternative)
```typescript
model users {
  id String @id @db.Uuid  // Force UUID type
  ...
}
```
**Pros:**
- ✅ Type-safe at database level
- ✅ No casting needed

**Cons:**
- ❌ Requires database migration
- ❌ Potential data loss if not careful
- ❌ More complex to implement

**Recommendation:** Stick with Option 1 (casting) for MVP. Consider Option 2 for future refactoring.

---

## 🧪 Testing Checklist

After applying the fix, test these scenarios:

### Email/Password Auth
- [ ] New user signup creates entry in both `auth.users` and `public.users`
- [ ] User ID matches (as UUID string in public.users)
- [ ] Email verification updates both tables
- [ ] User can log in successfully

### Google OAuth
- [ ] Google sign-in redirects correctly
- [ ] User created in `public.users` with Google email
- [ ] User avatar/name synced from Google
- [ ] No "operator does not exist" error in logs
- [ ] User can access protected routes

### RLS Policies
- [ ] Users can only view their own profile
- [ ] Users can only update their own data
- [ ] Startup users can't access investor data (and vice versa)
- [ ] Marketplace shows all published campaigns (public read)

### Database Queries
```sql
-- Test RLS as a specific user
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims.sub = 'user-uuid-here';

SELECT * FROM public.users WHERE id = current_setting('request.jwt.claims.sub');
-- Should return only that user's row
```

---

## 🐛 Troubleshooting

### Error Still Occurs
1. **Check if SQL was applied:**
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name = 'handle_new_user';
   ```
   Should return `handle_new_user`

2. **Check trigger exists:**
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

3. **View Supabase logs:**
   - Go to Supabase Dashboard → Logs → Postgres Logs
   - Look for errors during signup

### Users Not Created
1. Check trigger is enabled:
   ```sql
   SELECT tgenabled FROM pg_trigger 
   WHERE tgname = 'on_auth_user_created';
   ```
   Should be `O` (origin enabled)

2. Test trigger manually:
   ```sql
   SELECT public.handle_new_user();
   ```

### RLS Denies Access
1. Temporarily disable RLS for testing:
   ```sql
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   ```
   (Don't forget to re-enable!)

2. Check if user is authenticated:
   ```sql
   SELECT auth.uid();  -- Should return UUID, not null
   ```

---

## 📚 Additional Resources

- [PostgreSQL Type Casting](https://www.postgresql.org/docs/current/sql-expressions.html#SQL-SYNTAX-TYPE-CASTS)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)

---

## ✅ Success Indicators

After applying the fix, you should see:
- ✅ No more "operator does not exist: text = uuid" errors
- ✅ Google OAuth signup completes successfully
- ✅ User appears in both `auth.users` and `public.users`
- ✅ User can access protected routes
- ✅ RLS policies work correctly

---

## 🎯 Next Steps

1. **Run COMPLETE_UUID_FIX.sql** in Supabase SQL Editor
2. **Test Google OAuth** signup flow
3. **Verify user creation** in database
4. **Test your application** features
5. **Monitor logs** for any remaining issues

If you still encounter issues, check:
- Supabase Dashboard → Logs → Postgres Logs
- Browser console for frontend errors
- API response errors in Network tab

---

**Created:** 2025-11-08  
**Last Updated:** 2025-11-08  
**Status:** Ready to deploy
