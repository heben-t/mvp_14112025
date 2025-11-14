-- Quick diagnostic queries to run before applying fixes
-- Run these in Supabase SQL Editor to understand current state

-- 1. Check if trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'
  AND event_object_schema = 'auth'
  AND event_object_table = 'users';

-- 2. Check if function exists
SELECT 
  routine_name, 
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'update_user_role');

-- 3. Check RLS status on users table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'users'
  AND schemaname = 'public';

-- 4. List all RLS policies on users table
SELECT 
  policyname,
  permissive,
  cmd,
  qual IS NOT NULL as has_using,
  with_check IS NOT NULL as has_with_check
FROM pg_policies
WHERE tablename = 'users'
  AND schemaname = 'public'
ORDER BY cmd, policyname;

-- 5. Check if password column is nullable
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name IN ('password', 'role', 'email');

-- 6. Check recent auth.users entries
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at IS NOT NULL as email_verified,
  raw_user_meta_data->>'role' as role_in_metadata,
  raw_user_meta_data->>'name' as name_in_metadata
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 7. Check if users exist in public.users but not auth.users (orphaned)
SELECT 
  pu.id,
  pu.email,
  pu.role,
  pu."createdAt"
FROM public.users pu
LEFT JOIN auth.users au ON pu.id = au.id::text
WHERE au.id IS NULL
LIMIT 5;

-- 8. Check mismatched data between auth.users and public.users
SELECT 
  au.id,
  au.email as auth_email,
  pu.email as public_email,
  au.raw_user_meta_data->>'role' as auth_role,
  pu.role as public_role,
  au.email_confirmed_at IS NOT NULL as auth_verified,
  pu."emailVerified" IS NOT NULL as public_verified
FROM auth.users au
LEFT JOIN public.users pu ON au.id::text = pu.id
WHERE au.id::text != pu.id OR au.email != pu.email OR (au.raw_user_meta_data->>'role') != pu.role
LIMIT 10;

-- 9. Test permissions
SELECT 
  has_table_privilege('authenticated', 'public.users', 'INSERT') as can_insert,
  has_table_privilege('authenticated', 'public.users', 'SELECT') as can_select,
  has_table_privilege('authenticated', 'public.users', 'UPDATE') as can_update,
  has_table_privilege('service_role', 'public.users', 'INSERT') as service_can_insert;

-- 10. Check if uuid extension is enabled
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');

COMMENT ON QUERY IS 'Run these diagnostics before applying Google Auth fix';
