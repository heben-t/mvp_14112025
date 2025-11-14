# Supabase Setup Instructions

This guide will help you set up Supabase for your AI ROI Dashboard application.

## Prerequisites

- Supabase account (https://supabase.com)
- Project created in Supabase

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (xbinlxkkfxmgjdukxtbn)
3. Navigate to the **SQL Editor** from the left sidebar

## Step 2: Run the Database Schema

1. Open the file `supabase_schema.sql` in this directory
2. Copy all the contents of the file
3. In the Supabase SQL Editor, paste the entire contents
4. Click the **Run** button (or press Ctrl/Cmd + Enter)

This will create:
- All necessary database tables
- Enum types for roles and statuses
- Indexes for better performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates
- A trigger to auto-create user profiles when users sign up

## Step 3: Verify the Setup

After running the SQL, verify that the following tables were created:

### Core Tables
- `user_profiles` - User account information
- `startup_profiles` - Startup-specific data
- `investor_profiles` - Investor-specific data
- `investor_preferences` - Investor preferences and filters

### Business Tables
- `campaigns` - Fundraising campaigns
- `investments` - Investment records
- `watchlist` - Investor watchlist
- `subscriptions` - Subscription management

### Metrics Tables
- `startup_metrics` - Startup performance metrics
- `portfolio_companies` - Portfolio company data
- `time_series_data` - Historical metrics data
- `operations` - Operation efficiency data
- `alerts` - Alert notifications
- `benchmarks` - Benchmark comparisons

## Step 4: Verify Row Level Security (RLS)

The schema includes RLS policies to ensure data security:

1. Go to **Authentication** > **Policies** in your Supabase dashboard
2. Verify that policies exist for:
   - `user_profiles`
   - `startup_profiles`
   - `investor_profiles`
   - `campaigns`
   - `investments`

These policies ensure users can only access their own data.

## Step 5: Enable Email Auth (if not already enabled)

1. Go to **Authentication** > **Providers** in your Supabase dashboard
2. Ensure **Email** provider is enabled
3. Configure email templates if needed

## Step 6: Test the Setup

You can test the database by creating a test user:

```sql
-- This is just for testing - the app will handle user creation
SELECT auth.uid(); -- Should return null if not authenticated
```

## Environment Variables

Make sure your `.env` file has the following variables set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xbinlxkkfxmgjdukxtbn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

These are already configured in your `.env` file.

## Database Schema Overview

### User Authentication Flow

1. User signs up through `/api/auth/register`
2. Supabase Auth creates user in `auth.users` table
3. Trigger automatically creates record in `user_profiles`
4. API creates role-specific profile (`startup_profiles` or `investor_profiles`)

### Role-Based Access

- **STARTUP**: Can create campaigns, view metrics, manage company data
- **INVESTOR**: Can view campaigns, create investments, manage portfolio
- **ADMIN**: Full access (not currently implemented in UI)

## Troubleshooting

### Error: "permission denied for table user_profiles"

Make sure RLS policies are created. Re-run the RLS policy section of the SQL.

### Error: "relation does not exist"

The table wasn't created. Re-run the entire `supabase_schema.sql` file.

### Error: "duplicate key value violates unique constraint"

This means you're trying to run the schema twice. You can either:
1. Drop all tables and re-run (use with caution!)
2. Skip tables that already exist

To drop all tables (WARNING: This deletes all data):

```sql
DROP TABLE IF EXISTS public.benchmarks CASCADE;
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.operations CASCADE;
DROP TABLE IF EXISTS public.time_series_data CASCADE;
DROP TABLE IF EXISTS public.portfolio_companies CASCADE;
DROP TABLE IF EXISTS public.startup_metrics CASCADE;
DROP TABLE IF EXISTS public.watchlist CASCADE;
DROP TABLE IF EXISTS public.investments CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.investor_preferences CASCADE;
DROP TABLE IF EXISTS public.investor_profiles CASCADE;
DROP TABLE IF EXISTS public.startup_profiles CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

DROP TYPE IF EXISTS data_verification_level CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS investment_status CASCADE;
DROP TYPE IF EXISTS verification_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
```

## Next Steps

After setting up the database:

1. Start the development server: `npm run dev`
2. Navigate to the signup page: `http://localhost:3000/auth/signup`
3. Create a test account
4. Verify the user is created in Supabase Dashboard > Authentication > Users
5. Check that the profile tables have the corresponding records

## Support

If you encounter any issues, check:
1. Supabase Dashboard logs
2. Browser console for errors
3. Server console (terminal running `npm run dev`)
