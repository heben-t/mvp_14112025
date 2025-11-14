-- Run this to remove ALL triggers on auth.users and related functions
-- This will ensure nothing interferes with user creation

-- Drop all possible trigger names
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users CASCADE;
DROP TRIGGER IF EXISTS create_profile_for_new_user ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_trigger ON auth.users CASCADE;

-- Drop all related functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Verify no triggers remain
SELECT
    trigger_name,
    event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';

-- This should return 0 rows if successful
