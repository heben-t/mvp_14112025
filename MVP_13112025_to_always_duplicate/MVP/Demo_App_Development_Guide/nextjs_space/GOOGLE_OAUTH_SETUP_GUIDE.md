# 🔧 Google OAuth Configuration Guide for Supabase

## ❌ Current Issue
The Google credentials in your `.env` file are **NOT being used** by Supabase!

**Why:** Supabase handles OAuth providers in its **own dashboard**, not from environment variables. Your app doesn't manage the OAuth flow - Supabase does.

---

## ✅ Step-by-Step Google OAuth Setup

### Step 1: Configure in Supabase Dashboard (CRITICAL!)

1. **Go to Supabase Dashboard:**
   ```
   https://app.supabase.com/project/gnzcvhyxiatcjofywkdq/auth/providers
   ```

2. **Click on "Google" provider**

3. **Enable Google Auth** - Toggle the switch to ON

4. **Enter your Google credentials:**
   ```
   Client ID: 827886733055-tbn7nm5k2j6ktiou29rki9j6rk911ata.apps.googleusercontent.com
   Client Secret: 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
   ```

5. **Save Changes**

---

### Step 2: Configure Google Cloud Console

1. **Go to Google Cloud Console:**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Select your OAuth 2.0 Client** (the one with ID above)

3. **Add Authorized JavaScript Origins:**
   ```
   http://localhost:3000
   https://gnzcvhyxiatcjofywkdq.supabase.co
   ```

4. **Add Authorized Redirect URIs:**
   ```
   http://localhost:3000/auth/callback
   https://gnzcvhyxiatcjofywkdq.supabase.co/auth/v1/callback
   ```

   ⚠️ **CRITICAL:** The Supabase callback URL must be:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   
   For you: `https://gnzcvhyxiatcjofywkdq.supabase.co/auth/v1/callback`

5. **Save Changes**

---

### Step 3: Update Your Code

Your signup code should use Supabase's built-in OAuth:

**File:** `app/auth/signup/page.tsx`

```typescript
const handleGoogleSignUp = async () => {
  setGoogleLoading(true);
  setError('');

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${formData.role}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  } catch (err: any) {
    setError('Failed to sign up with Google. Please try again.');
    setGoogleLoading(false);
  }
};
```

---

## 🔍 Verify Configuration

### Check 1: Supabase Dashboard
```
1. Go to: Authentication > Providers
2. Verify: Google is ENABLED
3. Check: Client ID and Secret are saved
```

### Check 2: Google Console Redirect URIs
**Must include:**
- ✅ `https://gnzcvhyxiatcjofywkdq.supabase.co/auth/v1/callback`
- ✅ `http://localhost:3000/auth/callback`

### Check 3: Test the Flow
```
1. Click "Continue with Google"
2. Should redirect to Google login
3. After authentication, should redirect to Supabase callback
4. Then to your app callback: /auth/callback?code=...&role=STARTUP
```

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Only Added to .env
**Problem:** Environment variables are NOT used for Supabase OAuth
**Solution:** Must configure in Supabase Dashboard

### ❌ Mistake 2: Wrong Callback URL
**Problem:** Using `http://localhost:3000/auth/callback` for Google
**Solution:** Google redirects to Supabase first: `https://PROJECT.supabase.co/auth/v1/callback`

### ❌ Mistake 3: Not Saving in Google Console
**Problem:** Forgot to click "Save" after adding redirect URIs
**Solution:** Always save changes in Google Cloud Console

### ❌ Mistake 4: Using Wrong Project
**Problem:** Multiple Google Cloud projects, configured wrong one
**Solution:** Verify Client ID matches in both Google Console and Supabase

---

## 📊 OAuth Flow Diagram

```
User clicks "Continue with Google"
    ↓
Supabase auth.signInWithOAuth()
    ↓
Redirect to Google OAuth consent screen
    ↓
User authenticates with Google
    ↓
Google redirects to: https://gnzcvhyxiatcjofywkdq.supabase.co/auth/v1/callback?code=...
    ↓
Supabase processes OAuth code
    ↓
Supabase creates user in auth.users (trigger fires here!)
    ↓
Supabase redirects to: http://localhost:3000/auth/callback?code=...&role=STARTUP
    ↓
Your callback route exchanges code for session
    ↓
Updates user role in database
    ↓
Redirects to /onboarding/startup ✅
```

---

## 🧪 Testing Checklist

### Before Testing:
- [ ] Google OAuth enabled in Supabase Dashboard
- [ ] Client ID and Secret saved in Supabase
- [ ] Redirect URIs added in Google Console
- [ ] Redirect URIs saved (clicked Save button!)
- [ ] Cleared browser cache and cookies

### During Testing:
1. Open browser in incognito/private mode
2. Go to `http://localhost:3000/auth/signup`
3. Select "Startup" role
4. Click "Continue with Google"
5. Watch network tab for redirect URLs

### Expected URLs (in order):
```
1. http://localhost:3000/auth/signup
2. https://accounts.google.com/o/oauth2/auth?...
3. https://gnzcvhyxiatcjofywkdq.supabase.co/auth/v1/callback?code=...
4. http://localhost:3000/auth/callback?code=...&role=STARTUP
5. http://localhost:3000/onboarding/startup ✅
```

### If You See Errors:

**Error: "redirect_uri_mismatch"**
- Go to Google Console
- Add exact redirect URI shown in error
- Save changes
- Try again

**Error: "Invalid client"**
- Check Client ID in Supabase matches Google Console
- Verify Client Secret is correct
- Re-save in Supabase Dashboard

**Error: "unauthorized_client"**
- OAuth consent screen not configured
- App not published (use test users)
- Domain not verified

---

## 🔐 Security Notes

### Production Checklist:
- [ ] Use production redirect URIs (your domain)
- [ ] Remove `http://localhost` from Google Console
- [ ] Verify OAuth consent screen is published
- [ ] Set up brand information in Google
- [ ] Add privacy policy and terms of service URLs
- [ ] Test with multiple Google accounts
- [ ] Monitor Supabase auth logs

### Environment Variables (Reference Only):
```bash
# These are NOT used by Supabase OAuth!
# They're here for reference/documentation only
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="827886733055-tbn7nm5k2j6ktiou29rki9j6rk911ata.apps.googleusercontent.com"
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET="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"

# These ARE used by your app:
NEXT_PUBLIC_SUPABASE_URL=https://gnzcvhyxiatcjofywkdq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 Quick Fix Checklist

**Do this RIGHT NOW:**

1. ✅ **Open Supabase Dashboard**
   - URL: `https://app.supabase.com/project/gnzcvhyxiatcjofywkdq/auth/providers`

2. ✅ **Enable Google Provider**
   - Toggle: ON
   - Client ID: `827886733055-tbn7nm5k2j6ktiou29rki9j6rk911ata.apps.googleusercontent.com`
   - Client Secret: `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`
   - Click: **Save**

3. ✅ **Open Google Cloud Console**
   - URL: `https://console.cloud.google.com/apis/credentials`
   - Find your OAuth Client
   - Add to "Authorized redirect URIs":
     ```
     https://gnzcvhyxiatcjofywkdq.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     ```
   - Click: **Save**

4. ✅ **Test Again**
   - Clear browser cache
   - Try Google signup
   - Should work! 🎉

---

## 📞 Still Not Working?

### Check Browser Console:
```javascript
// Look for these errors:
- "redirect_uri_mismatch" → Fix Google Console redirect URIs
- "Invalid client" → Re-check Client ID/Secret in Supabase
- "Access denied" → Check OAuth consent screen settings
```

### Check Supabase Logs:
```
Dashboard > Logs > Auth Logs
- Look for failed OAuth attempts
- Check error messages
```

### Check Network Tab:
```
1. Open DevTools > Network
2. Click "Continue with Google"
3. Watch redirect chain
4. Verify each redirect URL is correct
```

---

**Next Step:** Go to Supabase Dashboard and enable Google provider NOW! 🚀
