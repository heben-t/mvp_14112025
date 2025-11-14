# Troubleshooting Signup Issues

## Common 400 Bad Request Errors

### Step 1: Restart Development Server

After updating `.env` files, **you must restart** the development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd Demo_App_Development_Guide/ai_roi_dashboard/nextjs_space
npm run dev
```

### Step 2: Check if Database Schema is Set Up

The most common cause of 400 errors is that the database tables don't exist yet.

1. Go to https://supabase.com/dashboard
2. Select your project: **xbinlxkkfxmgjdukxtbn**
3. Navigate to **SQL Editor** in the left sidebar
4. Copy all contents from `supabase_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)

You should see a success message. If you get errors about tables already existing, that's OK - it means they're already created.

### Step 3: Check Console Logs

Open your terminal where `npm run dev` is running and look for error messages. The detailed logging will show:

- "Registration attempt: ..." - Shows the data being received
- "Supabase client created successfully" - Confirms env vars are loaded
- "Creating user in Supabase Auth..." - Shows auth process
- Any error messages with details

**Common error messages and solutions:**

#### "Missing Supabase environment variables"
- **Cause**: `.env` file not loaded or server not restarted
- **Solution**: Restart the dev server

#### "Database not set up. Please run the SQL schema in Supabase."
- **Cause**: Tables don't exist in Supabase
- **Solution**: Run the `supabase_schema.sql` in Supabase SQL Editor

#### "User already exists"
- **Cause**: Email is already registered
- **Solution**: Try a different email or delete the user from Supabase Dashboard > Authentication > Users

#### "Failed to create user in authentication system"
- **Cause**: Password too weak or email format invalid
- **Solution**: Use a stronger password (at least 6 characters)

### Step 4: Check Browser Console

Open browser DevTools (F12) and check the Console and Network tabs:

1. **Console Tab**: Look for JavaScript errors
2. **Network Tab**:
   - Find the request to `/api/auth/register`
   - Check the **Request Payload** - should have email, password, name, role
   - Check the **Response** - will show the specific error message

### Step 5: Verify Environment Variables

Check that your `.env` file has these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xbinlxkkfxmgjdukxtbn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXTAUTH_SECRET=3Y+2FzmY9CO...
NEXTAUTH_URL=http://localhost:3000
```

### Step 6: Test Supabase Connection Manually

Create a test API endpoint to verify Supabase is working:

Create `app/api/test-supabase/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getServiceRoleClient();

    // Try to query user_profiles table
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connected successfully',
      hasData: data && data.length > 0
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

Then visit: `http://localhost:3000/api/test-supabase`

**Expected responses:**

- **Success**: `{"success": true, "message": "Supabase connected successfully"}`
- **Table doesn't exist**: `{"success": false, "error": "...", "code": "42P01"}` → Run the SQL schema
- **Auth error**: `{"success": false, "error": "..."}` → Check environment variables

### Step 7: Check Signup Form Data

Make sure the signup form is sending the correct data format:

**Required fields:**
- `email` (string): Valid email format
- `password` (string): At least 6 characters
- `role` (string): Must be exactly "STARTUP" or "INVESTOR" (uppercase)
- `name` (string, optional): User's name

### Step 8: Verify Supabase Project Status

1. Go to https://supabase.com/dashboard
2. Check your project status (should be active, not paused)
3. Go to **Settings** > **API**
4. Verify the URL and keys match your `.env` file

### Step 9: Check Row Level Security (RLS)

If tables exist but you're getting permission errors:

1. Go to Supabase Dashboard > **Authentication** > **Policies**
2. Check that policies exist for `user_profiles`, `startup_profiles`, `investor_profiles`
3. The SQL schema should have created these automatically
4. If missing, re-run the RLS policy section of `supabase_schema.sql`

### Step 10: Try Signup Again

1. Make sure dev server is running: `npm run dev`
2. Open: `http://localhost:3000/auth/signup`
3. Fill in the form:
   - **Email**: test@example.com
   - **Password**: Test123!
   - **Name**: Test User
   - **Role**: Select either Startup or Investor
4. Submit

**Watch the terminal** for detailed logs showing each step of the process.

## Still Having Issues?

If none of the above works, please provide:

1. The exact error message from browser console
2. The terminal output (server logs)
3. The response from the test-supabase endpoint
4. Screenshot of the Network tab showing the failed request

## Quick Checklist

- [ ] Ran `supabase_schema.sql` in Supabase SQL Editor
- [ ] Restarted development server after updating `.env`
- [ ] Verified `.env` has all Supabase variables
- [ ] Checked Supabase project is active (not paused)
- [ ] Password is at least 6 characters
- [ ] Role is either "STARTUP" or "INVESTOR" (uppercase)
- [ ] No console errors in browser
- [ ] Server is running on http://localhost:3000
