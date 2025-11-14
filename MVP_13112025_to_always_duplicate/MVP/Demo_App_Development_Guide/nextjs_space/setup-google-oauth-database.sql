-- ===================================================================
-- Google OAuth Database Setup for Supabase Auth
-- ===================================================================
-- This migration ensures the users table is properly configured
-- for Google OAuth authentication with Supabase Auth
-- ===================================================================

-- 1. Ensure users table exists with correct schema
-- -----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('STARTUP', 'INVESTOR')),
  image TEXT,
  "emailVerified" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 2. Enable Row Level Security
-- -----------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON public.users;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.users;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can read other users (for browsing startups/investors)
CREATE POLICY "Users can view all users"
  ON public.users
  FOR SELECT
  USING (true);

-- Policy: Allow insert during authentication (service role or auth.uid matches)
CREATE POLICY "Enable insert for authentication"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- Policy: Users can update their own data
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Create function to handle new user creation from auth.users
-- -----------------------------------------------------------------

-- This function automatically creates a user record in public.users
-- when a new user signs up via Supabase Auth (including Google OAuth)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, name, role, image, "emailVerified", "createdAt", "updatedAt")
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'INVESTOR'), -- Default to INVESTOR if not specified
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    NEW.email_confirmed_at,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    image = COALESCE(EXCLUDED.image, public.users.image),
    "emailVerified" = EXCLUDED."emailVerified",
    "updatedAt" = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger for automatic user creation
-- -----------------------------------------------------------------

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Create startup_profiles table if not exists
-- -----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.startup_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "companyName" TEXT,
  industry TEXT,
  stage TEXT,
  "onboardingComplete" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.startup_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for startup_profiles
DROP POLICY IF EXISTS "Users can view own startup profile" ON public.startup_profiles;
DROP POLICY IF EXISTS "Users can insert own startup profile" ON public.startup_profiles;
DROP POLICY IF EXISTS "Users can update own startup profile" ON public.startup_profiles;

CREATE POLICY "Users can view own startup profile"
  ON public.startup_profiles
  FOR SELECT
  USING (auth.uid() = "userId");

CREATE POLICY "Users can insert own startup profile"
  ON public.startup_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update own startup profile"
  ON public.startup_profiles
  FOR UPDATE
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

-- 6. Create investor_profiles table if not exists
-- -----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.investor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "onboardingComplete" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for investor_profiles
DROP POLICY IF EXISTS "Users can view own investor profile" ON public.investor_profiles;
DROP POLICY IF EXISTS "Users can insert own investor profile" ON public.investor_profiles;
DROP POLICY IF EXISTS "Users can update own investor profile" ON public.investor_profiles;

CREATE POLICY "Users can view own investor profile"
  ON public.investor_profiles
  FOR SELECT
  USING (auth.uid() = "userId");

CREATE POLICY "Users can insert own investor profile"
  ON public.investor_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update own investor profile"
  ON public.investor_profiles
  FOR UPDATE
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

-- 7. Grant necessary permissions
-- -----------------------------------------------------------------

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

GRANT ALL ON public.startup_profiles TO authenticated;
GRANT ALL ON public.investor_profiles TO authenticated;

-- Grant sequence permissions if needed
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ===================================================================
-- Verification Queries (Run these after migration)
-- ===================================================================

-- Check if RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('users', 'startup_profiles', 'investor_profiles');

-- Check policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('users', 'startup_profiles', 'investor_profiles')
-- ORDER BY tablename, policyname;

-- Check trigger exists
-- SELECT trigger_name, event_manipulation, event_object_table, action_statement
-- FROM information_schema.triggers
-- WHERE trigger_name = 'on_auth_user_created';

-- ===================================================================
-- Test Data (Optional - for development)
-- ===================================================================

-- To test, you can manually create a test user:
-- INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data)
-- VALUES (
--   gen_random_uuid(),
--   'test@example.com',
--   NOW(),
--   '{"name": "Test User", "role": "STARTUP"}'::jsonb
-- );

-- ===================================================================
-- Rollback Instructions (if needed)
-- ===================================================================

-- To rollback this migration:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP TABLE IF EXISTS public.investor_profiles CASCADE;
-- DROP TABLE IF EXISTS public.startup_profiles CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;
