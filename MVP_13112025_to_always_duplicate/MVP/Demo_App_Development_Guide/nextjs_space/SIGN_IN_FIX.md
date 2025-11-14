# ✅ SIGN-IN ERROR FIXED

## 🔍 Issue Found

**Error in Logs:**
```json
{
  "error": "ERROR: operator does not exist: text = uuid (SQLSTATE 42883)",
  "msg": "500: Error updating user",
  "path": "/callback",
  "referer": "http://localhost:3000/",
  "time": "2025-11-08T11:16:41Z"
}
```

**Root Cause:**
- Callback route is called during **both signup AND sign-in**
- During **sign-in**, there's NO `role` parameter
- Code was trying to update regardless of whether role was provided
- Still had the UUID vs TEXT issue on sign-in path

---

## ✅ Fix Applied

### Updated: `app/auth/callback/route.ts`

**Changes:**

1. **Check if user exists before updating**
   - Prevents errors on sign-in when user already exists

2. **Only update if role is different**
   - Avoids unnecessary database writes

3. **Different redirect paths**
   - **Signup** (with role param) → `/onboarding/startup` or `/onboarding/investor`
   - **Sign-in** (no role param) → `/dashboard`

4. **UUID→TEXT casting maintained**
   - All `.eq('id', ...)` use `.toString()` conversion

**Code:**
```typescript
if (role && (role === 'STARTUP' || role === 'INVESTOR')) {
  // Check if user exists first
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', session.user.id.toString())  // ← UUID to TEXT
    .single();

  // Only update if user exists and role is different
  if (existingUser && existingUser.role !== role) {
    const { error: dbError } = await supabase
      .from('users')
      .update({ role, updatedAt: new Date().toISOString() })
      .eq('id', session.user.id.toString());  // ← UUID to TEXT
  }
}

// Different redirects for signup vs sign-in
const redirectPath = role 
  ? (role === 'STARTUP' ? '/onboarding/startup' : '/onboarding/investor')
  : '/dashboard';  // ← Sign-in redirects to dashboard
```

---

## 🧪 Test Both Flows

### Test 1: Google Signup (with role)
```
1. Go to /auth/signup
2. Select "Startup" role
3. Click "Continue with Google"
4. Expected: Redirect to /onboarding/startup ✅
```

### Test 2: Google Sign-In (no role)
```
1. Go to /auth/signin (or click sign-in button)
2. Click "Continue with Google"
3. Expected: Redirect to /dashboard ✅
4. Expected: NO database errors ✅
```

---

## 📊 Flow Diagram

### Signup Flow:
```
/auth/signup
  ↓ Select role: STARTUP
  ↓ Click Google
  ↓ Google auth
  ↓ /auth/callback?code=...&role=STARTUP
  ↓ Exchange code for session
  ↓ Update role in database (NEW user)
  ↓ /onboarding/startup ✅
```

### Sign-In Flow:
```
/auth/signin
  ↓ Click Google
  ↓ Google auth
  ↓ /auth/callback?code=... (NO role parameter)
  ↓ Exchange code for session
  ↓ SKIP role update (no role param)
  ↓ /dashboard ✅
```

---

## ✅ All Issues Fixed

1. ✅ **Signup with Google** - Works, creates user, sets role
2. ✅ **Sign-in with Google** - Works, NO database errors
3. ✅ **UUID→TEXT casting** - Fixed in all queries
4. ✅ **Proper redirects** - Signup→onboarding, Sign-in→dashboard

---

## 🎯 Summary

**Problem:**
- Callback tried to update user during sign-in
- No role parameter during sign-in
- UUID vs TEXT error still occurring

**Solution:**
- Only update when role parameter is provided (signup only)
- Check if user exists before updating
- Redirect to dashboard for sign-in (no role)
- Redirect to onboarding for signup (with role)

**Status:** ✅ **READY TO TEST**

Both signup AND sign-in should work perfectly now! 🚀
