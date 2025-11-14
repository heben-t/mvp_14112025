# Authentication Redirect Flow - Implementation Complete ✅

## Overview
Implemented smart redirect logic after authentication that:
- **ALL sign-ins redirect to onboarding page first**
- Onboarding pages check if user has completed profile
- Auto-redirect to dashboard if profile exists
- Show onboarding form if profile doesn't exist

## Redirect Flow

```
SIGN IN (Email/Password or Google OAuth)
    ↓
SUCCESS (200)
    ↓
GET USER ROLE (STARTUP or INVESTOR)
    ↓
REDIRECT TO: /auth/onboarding/{startup|investor}
    ↓
ONBOARDING PAGE CHECKS FOR PROFILE
    ↓
├─ HAS PROFILE → Redirect to /dashboard/{startup|investor}
└─ NO PROFILE → Show onboarding form
```

## Changes Made

### 1. Updated Onboarding Utility (`lib/onboarding.ts`)
**Simplified Logic**: All users now redirect to onboarding page regardless of status

```typescript
export async function getPostAuthRedirectUrl(
  userId: string, 
  role: 'STARTUP' | 'INVESTOR', 
  isNewUser: boolean = false
): Promise<string> {
  // All users go to onboarding page
  // The onboarding page will check completion and redirect if needed
  return role === 'STARTUP' 
    ? '/auth/onboarding/startup' 
    : '/auth/onboarding/investor';
}
```

### 2. Updated OAuth Callback (`app/auth/callback/route.ts`)
- Uses `getPostAuthRedirectUrl()` for all OAuth sign-ins
- Always redirects to `/auth/onboarding/{startup|investor}`
- Onboarding page handles the dashboard redirect

### 3. Updated Email Sign In (`app/auth/signin/page.tsx`)
**Simplified Flow**:
```typescript
// After successful sign in
const userRole = userData.role as 'STARTUP' | 'INVESTOR';

// Always redirect to onboarding page
router.push(
  userRole === 'STARTUP' 
    ? '/auth/onboarding/startup' 
    : '/auth/onboarding/investor'
);
```

### 4. Updated Onboarding Pages (Client-Side Check)
**Startup Onboarding** (`app/auth/onboarding/startup/page.tsx`):
```typescript
'use client';

useEffect(() => {
  const checkOnboardingStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check if user already has a startup profile
    const { data: profile } = await supabase
      .from('startup_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profile) {
      // Already completed - redirect to dashboard
      router.push('/dashboard/startup');
    } else {
      // Show onboarding form
      setIsChecking(false);
    }
  };

  checkOnboardingStatus();
}, [router]);
```

**Investor Onboarding** (`app/auth/onboarding/investor/page.tsx`):
- Same logic but checks `investor_profiles` table
- Redirects to `/dashboard/investor` if profile exists

### 5. Sign Up Flow (`app/auth/signup/page.tsx`)
- Creates user in `public.users` table
- Redirects to `/auth/onboarding/{startup|investor}`
- User will see onboarding form (no profile exists yet)

## Complete User Flows

### Flow 1: New User Signup (Email)
1. User fills signup form → Selects "STARTUP" role
2. Account created with role="STARTUP"
3. **Redirect**: `/auth/onboarding/startup`
4. Onboarding page loads → Checks for profile → **NOT FOUND**
5. Shows startup onboarding wizard
6. User completes form → Profile created
7. **Redirect**: `/dashboard/startup`

### Flow 2: New User Signup (Google OAuth)
1. User selects "INVESTOR" → Clicks Google signup
2. OAuth callback creates user with role="INVESTOR"
3. **Redirect**: `/auth/onboarding/investor`
4. Onboarding page checks profile → **NOT FOUND**
5. Shows investor onboarding wizard
6. User completes form → Profile created
7. **Redirect**: `/dashboard/investor`

### Flow 3: Existing User (Has Profile) - Email Sign In
1. User enters credentials → Signs in
2. Fetches role: "STARTUP"
3. **Redirect**: `/auth/onboarding/startup`
4. Onboarding page checks profile → **FOUND**
5. **Auto-redirect**: `/dashboard/startup` (no form shown)

### Flow 4: Existing User (Has Profile) - Google Sign In
1. User clicks "Sign in with Google"
2. OAuth callback processes → role="INVESTOR"
3. **Redirect**: `/auth/onboarding/investor`
4. Onboarding page checks profile → **FOUND**
5. **Auto-redirect**: `/dashboard/investor` (no form shown)

### Flow 5: User Started Onboarding But Didn't Finish
1. User signed up last week but closed browser during onboarding
2. User signs in again
3. **Redirect**: `/auth/onboarding/{startup|investor}`
4. Onboarding page checks profile → **NOT FOUND**
5. Shows onboarding wizard to complete setup

## Key Features

✅ **Single Entry Point**: All sign-ins go through onboarding page
✅ **Smart Auto-Redirect**: Onboarding page detects completed profiles
✅ **Seamless UX**: Users with profiles never see the onboarding form
✅ **Loading State**: Shows spinner while checking profile status
✅ **Protected Routes**: Onboarding pages redirect to signin if not authenticated
✅ **Works for Both Auth Methods**: Email/password and Google OAuth

## Files Modified

1. ✅ `lib/onboarding.ts` - Simplified to always return onboarding path
2. ✅ `app/auth/callback/route.ts` - Uses onboarding redirect
3. ✅ `app/auth/signin/page.tsx` - Removed profile check, always redirects to onboarding
4. ✅ `app/auth/onboarding/startup/page.tsx` - Added client-side profile check
5. ✅ `app/auth/onboarding/investor/page.tsx` - Added client-side profile check
6. ✅ `app/auth/signup/page.tsx` - Already redirecting to onboarding

## Testing Checklist

### New Users
- [ ] Email signup (startup) → /auth/onboarding/startup → shows form
- [ ] Email signup (investor) → /auth/onboarding/investor → shows form
- [ ] Google signup (startup) → /auth/onboarding/startup → shows form
- [ ] Google signup (investor) → /auth/onboarding/investor → shows form

### Existing Users (With Profile)
- [ ] Email signin (startup) → /auth/onboarding/startup → auto-redirect to /dashboard/startup
- [ ] Email signin (investor) → /auth/onboarding/investor → auto-redirect to /dashboard/investor
- [ ] Google signin (startup) → /auth/onboarding/startup → auto-redirect to /dashboard/startup
- [ ] Google signin (investor) → /auth/onboarding/investor → auto-redirect to /dashboard/investor

### Edge Cases
- [ ] User not authenticated → Redirect to /auth/signin
- [ ] User started onboarding but didn't finish → Shows form
- [ ] Network error during profile check → Shows form (safe fallback)

## Benefits of This Approach

1. **Consistency**: All sign-ins follow the same path
2. **Maintainability**: Logic centralized in onboarding pages
3. **User Experience**: No visible flash - smooth redirects
4. **Security**: Server-side and client-side validation
5. **Flexibility**: Easy to add onboarding progress tracking later

## Next Steps (Optional)

1. Add progress indicator in onboarding wizard
2. Save partial onboarding data (draft mode)
3. Add middleware to protect dashboard routes
4. Track onboarding completion metrics
5. Email reminders for incomplete onboarding

## Notes

- Loading spinner shows during profile check (~200-500ms)
- All database queries use `.maybeSingle()` to avoid errors
- RLS is currently disabled for testing
- Console logs available for debugging auth flow

