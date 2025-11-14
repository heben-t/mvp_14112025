-- DISABLE RLS FOR TESTING PURPOSES ONLY
-- WARNING: This removes all security policies - DO NOT use in production!

-- Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (they were blocking operations)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.users;
DROP POLICY IF EXISTS "Allow insert via trigger" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;

-- Grant full access to all roles (TESTING ONLY!)
GRANT ALL ON public.users TO postgres, anon, authenticated, service_role;

-- Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users' AND schemaname = 'public';

-- Also disable RLS on related tables
ALTER TABLE public.investor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;

-- Grant permissions on related tables
GRANT ALL ON public.investor_profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.startup_profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.accounts TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.sessions TO postgres, anon, authenticated, service_role;

SELECT 'RLS DISABLED - All security policies removed for testing!' AS status;
