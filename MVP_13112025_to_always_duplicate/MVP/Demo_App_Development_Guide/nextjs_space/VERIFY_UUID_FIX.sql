-- ============================================
-- VERIFICATION & TESTING SCRIPT
-- ============================================
-- Run this AFTER applying COMPLETE_UUID_FIX.sql
-- to verify everything is working correctly

-- ============================================
-- 1. CHECK TRIGGERS ARE INSTALLED
-- ============================================
DO $$ 
BEGIN 
  RAISE NOTICE ''; 
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  1. Checking Triggers...';
  RAISE NOTICE '══════════════════════════════════════════';
END $$;

SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_timing,
  CASE 
    WHEN trigger_name = 'on_auth_user_created' THEN '✅ User creation trigger'
    WHEN trigger_name = 'on_auth_user_email_verified' THEN '✅ Email verification trigger'
    ELSE '⚠️ Unknown trigger'
  END as description
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users'
ORDER BY trigger_name;

-- Expected: 2 triggers (on_auth_user_created, on_auth_user_email_verified)

-- ============================================
-- 2. CHECK TRIGGER FUNCTIONS EXIST
-- ============================================
DO $$ 
BEGIN 
  RAISE NOTICE ''; 
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  2. Checking Trigger Functions...';
  RAISE NOTICE '══════════════════════════════════════════';
END $$;

SELECT 
  routine_name,
  routine_type,
  CASE 
    WHEN routine_name = 'handle_new_user' THEN '✅ Creates user in public.users'
    WHEN routine_name = 'sync_email_verification' THEN '✅ Syncs email verification'
    WHEN routine_name = 'update_user_role' THEN '✅ Updates user role (OAuth)'
    ELSE '📋 ' || routine_name
  END as description
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('handle_new_user', 'sync_email_verification', 'update_user_role')
ORDER BY routine_name;

-- Expected: 3 functions

-- ============================================
-- 3. CHECK RLS IS ENABLED
-- ============================================
DO $$ 
BEGIN 
  RAISE NOTICE ''; 
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  3. Checking Row Level Security...';
  RAISE NOTICE '══════════════════════════════════════════';
END $$;

SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Enabled'
    ELSE '❌ RLS Disabled (SECURITY RISK!)'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'startup_profiles', 'investor_profiles', 'campaigns', 'investments', 'watchlists')
ORDER BY tablename;

-- Expected: All should have RLS enabled (rowsecurity = true)

-- ============================================
-- 4. CHECK RLS POLICIES EXIST
-- ============================================
DO $$ 
BEGIN 
  RAISE NOTICE ''; 
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  4. Checking RLS Policies...';
  RAISE NOTICE '══════════════════════════════════════════';
END $$;

SELECT 
  tablename, 
  policyname,
  cmd,
  CASE cmd
    WHEN 'SELECT' THEN '👁️ Read'
    WHEN 'INSERT' THEN '➕ Create'
    WHEN 'UPDATE' THEN '✏️ Update'
    WHEN 'DELETE' THEN '🗑️ Delete'
    WHEN 'ALL' THEN '🔓 All Operations'
    ELSE cmd
  END as operation
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('users', 'startup_profiles', 'investor_profiles', 'campaigns', 'investments', 'watchlists')
ORDER BY tablename, cmd, policyname;

-- Expected: Multiple policies for each table

-- ============================================
-- 5. COUNT POLICIES PER TABLE
-- ============================================
DO $$ 
BEGIN 
  RAISE NOTICE ''; 
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  5. Policy Count Summary...';
  RAISE NOTICE '══════════════════════════════════════════';
END $$;

SELECT 
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✅ Has policies'
    WHEN COUNT(*) = 1 THEN '⚠️ Only 1 policy'
    ELSE '❌ No policies!'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('users', 'startup_profiles', 'investor_profiles', 'campaigns', 'investments', 'watchlists')
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 6. CHECK USERS TABLE STRUCTURE
-- ============================================
DO $$ 
BEGIN 
  RAISE NOTICE ''; 
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  6. Checking users Table Structure...';
  RAISE NOTICE '══════════════════════════════════════════';
END $$;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name = 'id' AND data_type = 'text' THEN '✅ Correct (TEXT for Prisma)'
    WHEN column_name = 'id' AND data_type != 'text' THEN '❌ Wrong type!'
    WHEN column_name = 'password' AND is_nullable = 'YES' THEN '✅ Nullable (OAuth users)'
    WHEN column_name = 'emailVerified' THEN '✅ Tracks verification'
    ELSE '📋 ' || column_name
  END as notes
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
ORDER BY ordinal_position;

-- ============================================
-- 7. TEST UUID CASTING (Simulated)
-- ============================================
DO $$ 
BEGIN 
  RAISE NOTICE ''; 
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  7. Testing UUID↔TEXT Casting...';
  RAISE NOTICE '══════════════════════════════════════════';
END $$;

-- Test that UUID can be cast to TEXT and compared
DO $$ 
DECLARE
  test_uuid uuid := gen_random_uuid();
  test_text text := test_uuid::text;
  match_result boolean;
BEGIN
  -- Test: Can we compare UUID::text with TEXT?
  match_result := (test_uuid::text = test_text);
  
  IF match_result THEN
    RAISE NOTICE '✅ UUID to TEXT casting works correctly';
    RAISE NOTICE '   UUID:  %', test_uuid;
    RAISE NOTICE '   TEXT:  %', test_text;
    RAISE NOTICE '   Match: %', match_result;
  ELSE
    RAISE WARNING '❌ UUID to TEXT casting failed!';
  END IF;
END $$;

-- ============================================
-- 8. CHECK AUTH.USERS vs PUBLIC.USERS SYNC
-- ============================================
DO $$ 
BEGIN 
  RAISE NOTICE ''; 
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  8. Checking User Sync (auth vs public)...';
  RAISE NOTICE '══════════════════════════════════════════';
END $$;

SELECT 
  COUNT(DISTINCT a.id) as auth_users_count,
  COUNT(DISTINCT u.id) as public_users_count,
  COUNT(DISTINCT a.id) - COUNT(DISTINCT u.id) as missing_in_public,
  CASE 
    WHEN COUNT(DISTINCT a.id) = COUNT(DISTINCT u.id) THEN '✅ All synced'
    WHEN COUNT(DISTINCT a.id) > COUNT(DISTINCT u.id) THEN '⚠️ Some auth users missing in public.users'
    ELSE '❌ More public users than auth users (impossible!)'
  END as sync_status
FROM auth.users a
FULL OUTER JOIN public.users u ON a.id::text = u.id;

-- ============================================
-- 9. LIST USERS WITH SYNC STATUS
-- ============================================
DO $$ 
BEGIN 
  RAISE NOTICE ''; 
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  9. User Details (Last 10)...';
  RAISE NOTICE '══════════════════════════════════════════';
END $$;

SELECT 
  COALESCE(a.id::text, u.id) as user_id,
  COALESCE(a.email, u.email) as email,
  u.role,
  u.name,
  CASE 
    WHEN a.id IS NOT NULL AND u.id IS NOT NULL THEN '✅ Synced'
    WHEN a.id IS NOT NULL AND u.id IS NULL THEN '❌ Missing in public.users'
    WHEN a.id IS NULL AND u.id IS NOT NULL THEN '⚠️ Orphaned in public.users'
  END as sync_status,
  a.created_at as auth_created,
  u."createdAt" as public_created
FROM auth.users a
FULL OUTER JOIN public.users u ON a.id::text = u.id
ORDER BY COALESCE(a.created_at, u."createdAt") DESC
LIMIT 10;

-- ============================================
-- 10. CHECK FOR UNSYNCED USERS
-- ============================================
DO $$ 
BEGIN 
  RAISE NOTICE ''; 
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  10. Finding Unsynced Users...';
  RAISE NOTICE '══════════════════════════════════════════';
END $$;

-- Users in auth.users but NOT in public.users
SELECT 
  a.id::text as user_id,
  a.email,
  a.created_at,
  '❌ Missing in public.users - Trigger may have failed' as issue
FROM auth.users a
LEFT JOIN public.users u ON a.id::text = u.id
WHERE u.id IS NULL;

-- If this returns rows, the trigger is not working properly!

-- ============================================
-- 11. PERMISSIONS CHECK
-- ============================================
DO $$ 
BEGIN 
  RAISE NOTICE ''; 
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  11. Checking Table Permissions...';
  RAISE NOTICE '══════════════════════════════════════════';
END $$;

SELECT 
  grantee,
  table_schema,
  table_name,
  string_agg(privilege_type, ', ' ORDER BY privilege_type) as privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'users'
AND grantee IN ('postgres', 'anon', 'authenticated', 'service_role')
GROUP BY grantee, table_schema, table_name
ORDER BY grantee;

-- ============================================
-- FINAL SUMMARY
-- ============================================
DO $$ 
DECLARE
  trigger_count int;
  function_count int;
  rls_enabled_count int;
  policy_count int;
  unsynced_count int;
BEGIN 
  -- Count checks
  SELECT COUNT(*) INTO trigger_count 
  FROM information_schema.triggers 
  WHERE event_object_schema = 'auth' AND event_object_table = 'users';
  
  SELECT COUNT(*) INTO function_count 
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  AND routine_name IN ('handle_new_user', 'sync_email_verification', 'update_user_role');
  
  SELECT COUNT(*) INTO rls_enabled_count 
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND rowsecurity = true 
  AND tablename IN ('users', 'startup_profiles', 'investor_profiles', 'campaigns', 'investments', 'watchlists');
  
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  SELECT COUNT(*) INTO unsynced_count
  FROM auth.users a
  LEFT JOIN public.users u ON a.id::text = u.id
  WHERE u.id IS NULL;
  
  RAISE NOTICE ''; 
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '  📊 VERIFICATION SUMMARY';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Triggers:        % / 2 expected %', 
    trigger_count, 
    CASE WHEN trigger_count = 2 THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'Functions:       % / 3 expected %', 
    function_count,
    CASE WHEN function_count = 3 THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'RLS Enabled:     % / 6 tables %', 
    rls_enabled_count,
    CASE WHEN rls_enabled_count = 6 THEN '✅' ELSE '⚠️' END;
  RAISE NOTICE 'RLS Policies:    % total %', 
    policy_count,
    CASE WHEN policy_count > 0 THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'Unsynced Users:  % %', 
    unsynced_count,
    CASE WHEN unsynced_count = 0 THEN '✅' ELSE '⚠️ (trigger may be failing)' END;
  RAISE NOTICE '';
  
  IF trigger_count = 2 AND function_count = 3 AND rls_enabled_count = 6 AND policy_count > 0 AND unsynced_count = 0 THEN
    RAISE NOTICE '🎉 ALL CHECKS PASSED! UUID/TEXT fix is working correctly.';
  ELSE
    RAISE WARNING '⚠️ SOME CHECKS FAILED. Review the output above for details.';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Test Google OAuth signup in your app';
  RAISE NOTICE '  2. Check Supabase logs for any errors';
  RAISE NOTICE '  3. Verify new users appear in public.users';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
END $$;
