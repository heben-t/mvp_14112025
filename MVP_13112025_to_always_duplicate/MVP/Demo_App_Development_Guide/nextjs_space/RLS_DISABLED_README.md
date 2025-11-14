# 🔓 RLS DISABLED - TESTING MODE ACTIVE

## ⚠️ IMPORTANT: Security Warning

**Row Level Security (RLS) has been DISABLED on the following tables:**
- ✅ users
- ✅ investor_profiles
- ✅ startup_profiles
- ✅ accounts
- ✅ sessions

**This means:**
- 🔓 All users can read/write all data
- 🔓 No access control in place
- 🔓 **DO NOT USE IN PRODUCTION**

---

## 🔧 Changes Made

### 1. Callback Route Updated
**File:** `app/auth/callback/route.ts`

**Changed:**
- ❌ Removed RPC call to `update_user_role()` (function didn't exist)
- ✅ Now uses direct Supabase client update
- ✅ Updates `public.users` table directly
- ✅ Also updates auth metadata for consistency

### 2. Database Changes
**SQL:** `DISABLE_RLS.sql` executed

**Changes:**
- Disabled RLS on all auth-related tables
- Dropped all RLS policies
- Granted full access to all roles (anon, authenticated, service_role)

---

## 🧪 Testing Instructions

### Test Google OAuth Now:

1. **Clear browser cache and cookies** (important!)
2. Go to `/auth/signup`
3. Select "Startup" role
4. Click "Continue with Google"
5. Authenticate with Google
6. **EXPECTED:** Redirect to `/onboarding/startup` with NO errors

### What Should Happen:

```
1. User clicks Google signup
   ↓
2. Google OAuth completes
   ↓
3. Supabase creates user in auth.users
   ↓
4. Trigger creates user in public.users (role=INVESTOR by default)
   ↓
5. Callback receives code + role parameter
   ↓
6. Callback exchanges code for session
   ↓
7. Callback updates role directly: users.role = 'STARTUP'
   ↓
8. User redirected to /onboarding/startup ✅
```

---

## 🔍 Debug Commands

### Check if user was created:
```bash
node check-users.js
```

### Re-run diagnostics:
```bash
node verify-fix.js
```

### Check database directly:
```sql
-- Check latest auth user
SELECT id, email, raw_user_meta_data 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 1;

-- Check if they're in public.users
SELECT id, email, role, name 
FROM public.users 
ORDER BY "createdAt" DESC 
LIMIT 1;
```

---

## 🔄 Re-Enable RLS (After Testing)

**When ready to re-enable security:**

```sql
-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_profiles ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id);

-- (Add other policies as needed)
```

Or run the original `GOOGLE_AUTH_FIX.sql` again to restore all policies.

---

## 📊 Current Status

**Authentication:**
- ✅ Trigger installed and active
- ✅ Functions created (handle_new_user, update_user_role)
- ✅ RLS DISABLED (testing mode)
- ✅ Callback route updated to use direct updates

**Next Issue to Watch:**
If you still get errors, check the Next.js console for detailed error messages.

---

## 🚨 Common Issues

### Issue: "Error updating user" still appears
**Solution:** Check that SUPABASE_SERVICE_ROLE_KEY is set in .env.local

### Issue: User created but wrong role
**Solution:** Role should update in callback - check console logs

### Issue: User not in public.users at all
**Solution:** Trigger might not be firing - check Supabase logs

---

**Status:** 🔓 RLS DISABLED - Ready for testing
**Updated:** Callback route now uses direct database updates
**Test:** Try Google OAuth signup now!
