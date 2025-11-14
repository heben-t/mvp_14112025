-- =====================================================
-- DISABLE RLS ON ALL TABLES - TESTING MODE ONLY
-- =====================================================
-- ⚠️ WARNING: This disables all Row Level Security policies
-- Use ONLY for development/testing
-- DO NOT run in production!
-- =====================================================

-- Disable RLS on all public tables
DO $$
DECLARE
  table_record RECORD;
BEGIN
  RAISE NOTICE '=== DISABLING RLS ON ALL TABLES ===';
  
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', table_record.tablename);
    RAISE NOTICE 'Disabled RLS on table: %', table_record.tablename;
  END LOOP;
  
  RAISE NOTICE '=== RLS DISABLED ON ALL TABLES ===';
END $$;

-- Drop all existing RLS policies
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  RAISE NOTICE '=== DROPPING ALL RLS POLICIES ===';
  
  FOR policy_record IN 
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 
      policy_record.policyname, 
      policy_record.tablename
    );
    RAISE NOTICE 'Dropped policy: % on table: %', 
      policy_record.policyname, 
      policy_record.tablename;
  END LOOP;
  
  RAISE NOTICE '=== ALL RLS POLICIES DROPPED ===';
END $$;

-- Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- TO RE-ENABLE RLS LATER (Production)
-- =====================================================
-- Run this when you're ready to enable security:
/*
DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_record.tablename);
  END LOOP;
END $$;
*/
-- =====================================================
