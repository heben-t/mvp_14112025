-- =====================================================
-- HEBED AI - CLEANUP OLD TABLES & FIX RLS
-- =====================================================
-- This script:
-- 1. Drops all old/unused tables
-- 2. Ensures RLS is enabled on all new tables
-- 3. Adds missing policies for unrestricted access
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: DROP OLD TABLES
-- =====================================================

DO $$ 
BEGIN
    -- Drop old tables that aren't needed for MVP
    DROP TABLE IF EXISTS campaign_analytics CASCADE;
    DROP TABLE IF EXISTS campaign_questions CASCADE;
    DROP TABLE IF EXISTS campaign_templates CASCADE;
    DROP TABLE IF EXISTS campaign_updates CASCADE;
    DROP TABLE IF EXISTS csv_upload_history CASCADE;
    DROP TABLE IF EXISTS investment_activity CASCADE;
    DROP TABLE IF EXISTS investment_calculations CASCADE;
    DROP TABLE IF EXISTS plugin_integrations CASCADE;
    DROP TABLE IF EXISTS saved_searches CASCADE;
    DROP TABLE IF EXISTS user_profiles CASCADE;
    DROP TABLE IF EXISTS watchlist_folders CASCADE;
    
    -- Drop any other legacy tables
    DROP TABLE IF EXISTS alerts CASCADE;
    DROP TABLE IF EXISTS benchmarks CASCADE;
    DROP TABLE IF EXISTS operations CASCADE;
    DROP TABLE IF EXISTS portfolio_companies CASCADE;
    DROP TABLE IF EXISTS time_series_data CASCADE;
    DROP TABLE IF EXISTS metrics CASCADE;
    DROP TABLE IF EXISTS watchlist CASCADE;
    DROP TABLE IF EXISTS recommendations CASCADE;
    DROP TABLE IF EXISTS chat_messages CASCADE;
    
    RAISE NOTICE '✅ Old tables dropped';
END $$;

-- =====================================================
-- STEP 2: ENABLE RLS ON ALL TABLES
-- =====================================================

DO $$
BEGIN
    -- Enable RLS on all core tables
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
    ALTER TABLE startup_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
    ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
    ALTER TABLE startup_metrics ENABLE ROW LEVEL SECURITY;
    ALTER TABLE campaign_comments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE campaign_followers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE investor_preferences ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ RLS enabled on all tables';
END $$;

-- =====================================================
-- STEP 3: DROP ALL EXISTING POLICIES
-- =====================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
    
    RAISE NOTICE '✅ All existing policies dropped';
END $$;

-- =====================================================
-- STEP 4: CREATE UNRESTRICTED POLICIES (MVP MODE)
-- =====================================================

DO $$
DECLARE
    table_names TEXT[] := ARRAY[
        'users',
        'accounts',
        'sessions',
        'verification_tokens',
        'startup_profiles',
        'investor_profiles',
        'campaigns',
        'investments',
        'watchlists',
        'startup_metrics',
        'campaign_comments',
        'campaign_followers',
        'subscriptions',
        'investor_preferences'
    ];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
        -- Allow all operations for authenticated users
        EXECUTE format('
            CREATE POLICY %I ON %I
            FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true)
        ', 'allow_all_authenticated_' || table_name, table_name);
        
        -- Allow all operations for service role
        EXECUTE format('
            CREATE POLICY %I ON %I
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true)
        ', 'allow_all_service_' || table_name, table_name);
    END LOOP;
    
    RAISE NOTICE '✅ Unrestricted policies created for all tables';
END $$;

-- =====================================================
-- STEP 5: GRANT PERMISSIONS
-- =====================================================

DO $$
BEGIN
    -- Grant all permissions on all tables to authenticated users
    GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    
    -- Grant all permissions to service role
    GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
    
    -- Grant usage on schema
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT USAGE ON SCHEMA public TO service_role;
    
    RAISE NOTICE '✅ Permissions granted';
END $$;

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    rls_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public';
    
    -- Count tables with RLS enabled
    SELECT COUNT(*) INTO rls_count
    FROM pg_tables
    WHERE schemaname = 'public' AND rowsecurity = true;
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ CLEANUP & RLS FIX COMPLETE!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'Tables in database: %', table_count;
    RAISE NOTICE 'Tables with RLS enabled: %', rls_count;
    RAISE NOTICE 'Total policies: %', policy_count;
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
END $$;

-- Show final table list
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
