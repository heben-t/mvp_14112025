# 🚀 Quick Start: Google OAuth Setup

## ⚡ TL;DR - Run This Now

```bash
# 1. Run the database setup
npx tsx setup-google-oauth.ts

# 2. Enable Google in Supabase Dashboard
# Go to: https://app.supabase.com/project/gnzcvhyxiatcjofywkdq/auth/providers
# Toggle Google ON
# Paste credentials:
#   Client ID: 827886733055-tbn7nm5k2j6ktiou29rki9j6rk911ata.apps.googleusercontent.com
#   Client Secret: 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
# Click SAVE

# 3. Add redirect URIs in Google Console
# Go to: https://console.cloud.google.com/apis/credentials
# Add to "Authorized redirect URIs":
#   https://gnzcvhyxiatcjofywkdq.supabase.co/auth/v1/callback
#   http://localhost:3000/auth/callback
# Click SAVE

# 4. Test it!
npm run dev
# Open: http://localhost:3000/auth/signup
# Click "Continue with Google"
```

---

## 🎯 What Changed

### ✅ Removed NextAuth
- No more conflicts between NextAuth and Supabase Auth
- Cleaner, simpler authentication flow
- Better TypeScript support

### ✅ Pure Supabase Auth
- Email/password authentication
- Google OAuth (sign up & sign in)
- Automatic user creation in database
- Session management handled by Supabase

### ✅ New Files Created

1. **`lib/supabase-client.ts`** - Client-side Supabase helper
2. **`types/supabase.ts`** - TypeScript database types
3. **`app/auth/verify-email/page.tsx`** - Email verification page
4. **`setup-google-oauth-database.sql`** - Database migration
5. **`setup-google-oauth.ts`** - Setup script
6. **`GOOGLE_OAUTH_REBUILD_COMPLETE.md`** - Full documentation

### 🔄 Modified Files

1. **`lib/auth.ts`** - Now uses Supabase server client
2. **`app/auth/signin/page.tsx`** - Google sign-in with Supabase
3. **`app/auth/signup/page.tsx`** - Google sign-up with Supabase
4. **`app/auth/callback/route.ts`** - Enhanced OAuth callback
5. **`app/api/auth/[...nextauth]/route.ts`** - Deprecated

---

## 🔧 How It Works

### Sign Up Flow

```
User → Select Role (Startup/Investor) → Click "Google"
  ↓
Supabase redirects to Google
  ↓
User authenticates with Google
  ↓
Google → Supabase callback → Your app callback
  ↓
Database trigger creates user in public.users
  ↓
Redirect to onboarding based on role
```

### Sign In Flow

```
User → Click "Google" → Already authenticated
  ↓
Quick redirect to app
  ↓
Check onboarding status
  ↓
Redirect to dashboard or onboarding
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "redirect_uri_mismatch"

**Fix:** Add this EXACT URL to Google Console:
```
https://gnzcvhyxiatcjofywkdq.supabase.co/auth/v1/callback
```

### Issue 2: "Invalid client"

**Fix:** 
1. Go to Supabase Dashboard → Auth → Providers
2. Enable Google
3. Paste Client ID and Secret
4. Click **Save**

### Issue 3: User not created in database

**Fix:** Run the database setup:
```bash
npx tsx setup-google-oauth.ts
```

Or manually execute `setup-google-oauth-database.sql` in Supabase SQL Editor.

### Issue 4: Session not persisting

**Fix:**
1. Use `http://localhost:3000` (not 127.0.0.1)
2. Clear cookies and localStorage
3. Try in incognito mode

---

## ✅ Verification Checklist

**Before testing:**
- [ ] Database setup executed (`setup-google-oauth.sql`)
- [ ] Google enabled in Supabase Dashboard
- [ ] Client ID & Secret saved in Supabase
- [ ] Redirect URIs added in Google Console
- [ ] All changes saved (clicked Save buttons!)

**During testing:**
- [ ] Click "Continue with Google" on signup
- [ ] Redirects to Google
- [ ] Redirects back to app
- [ ] No errors in console
- [ ] User created in database

**After successful test:**
- [ ] User record exists in `public.users`
- [ ] Role is correct (STARTUP or INVESTOR)
- [ ] Session persists on page refresh
- [ ] Redirected to correct onboarding

---

## 📞 Need Help?

**Check these in order:**

1. **Browser Console** (F12 → Console tab)
   - Look for errors
   - Check network requests

2. **Terminal/Server Logs**
   - Look for callback route logs
   - Check for database errors

3. **Supabase Dashboard**
   - Go to Logs → Auth Logs
   - Check for failed OAuth attempts

4. **Database**
   - Go to Table Editor → users
   - Verify user was created

**Still stuck?**
- Read `GOOGLE_OAUTH_REBUILD_COMPLETE.md` for detailed docs
- Check that ALL setup steps are completed
- Try in incognito mode
- Clear all cookies and try again

---

## 🎉 Success Indicators

You know it's working when:

✅ Clicking "Google" opens Google login  
✅ After login, returns to your app  
✅ User appears in `public.users` table  
✅ Correct role is assigned  
✅ Redirects to onboarding  
✅ Session stays logged in on refresh

---

## 📚 Documentation

- **Full Guide:** `GOOGLE_OAUTH_REBUILD_COMPLETE.md`
- **Database Setup:** `setup-google-oauth-database.sql`
- **Database Script:** `setup-google-oauth.ts`

---

**Status:** ✅ Ready to test  
**Next:** Run setup script → Enable in Supabase → Test OAuth flow
