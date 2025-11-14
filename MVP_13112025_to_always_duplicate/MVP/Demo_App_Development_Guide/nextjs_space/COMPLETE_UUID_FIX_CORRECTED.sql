-- ============================================
-- COMPLETE UUID/TEXT FIX - CORRECTED COLUMN NAMES
-- ============================================
-- This fixes the "operator does not exist: text = uuid" error
-- WITH CORRECT SNAKE_CASE COLUMN NAMES for PostgreSQL

-- ============================================
-- STEP 1: Drop existing triggers to avoid conflicts
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;

-- ============================================
-- STEP 2: Create updated trigger function with proper casting
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
  user_name text;
  user_id_text text;
BEGIN
  -- Convert UUID to TEXT for public.users table
  user_id_text := NEW.id::text;
  
  -- Check if user already exists (avoid duplicate errors)
  IF EXISTS (SELECT 1 FROM public.users WHERE id = user_id_text) THEN
    RAISE NOTICE 'User already exists: %', user_id_text;
    RETURN NEW;
  END IF;

  -- Extract metadata from Supabase Auth
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role', 
    'INVESTOR'  -- Default role
  );
  
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'user_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Insert user into public.users with TEXT id
  INSERT INTO public.users (
    id,
    email,
    password,
    role,
    name,
    "emailVerified",
    image,
    "createdAt",
    "updatedAt"
  )
  VALUES (
    user_id_text,  -- ← UUID converted to TEXT
    NEW.email,
    NULL,  -- Password is NULL for all Supabase Auth users
    user_role::text,
    user_name,
    NEW.email_confirmed_at,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NEW.raw_user_meta_data->>'avatar'
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    "emailVerified" = EXCLUDED."emailVerified",
    image = COALESCE(EXCLUDED.image, public.users.image),
    "updatedAt" = NOW();

  RAISE NOTICE 'Created/updated user: % (role: %)', user_id_text, user_role;
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail auth
    RAISE WARNING 'Error in handle_new_user for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 3: Create email verification sync function
-- ============================================
CREATE OR REPLACE FUNCTION public.sync_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET "emailVerified" = NEW.email_confirmed_at,
      "updatedAt" = NOW()
  WHERE id = NEW.id::text;  -- ← Cast UUID to TEXT
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 4: Create the triggers
-- ============================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.sync_email_verification();

-- ============================================
-- STEP 5: Fix RLS policies with CORRECT column names
-- ============================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on watchlist table (conditional)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'watchlist') THEN
    ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'watchlists') THEN
    ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.users;
DROP POLICY IF EXISTS "Allow insert via trigger" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;

DROP POLICY IF EXISTS "Startup users can view own profile" ON public.startup_profiles;
DROP POLICY IF EXISTS "Startup users can update own profile" ON public.startup_profiles;
DROP POLICY IF EXISTS "Startup users can insert own profile" ON public.startup_profiles;
DROP POLICY IF EXISTS "Anyone can view published startup profiles" ON public.startup_profiles;

DROP POLICY IF EXISTS "Investor users can view own profile" ON public.investor_profiles;
DROP POLICY IF EXISTS "Investor users can update own profile" ON public.investor_profiles;
DROP POLICY IF EXISTS "Investor users can insert own profile" ON public.investor_profiles;

DROP POLICY IF EXISTS "Anyone can view published campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Startup can manage own campaigns" ON public.campaigns;

DROP POLICY IF EXISTS "Investor can view own investments" ON public.investments;
DROP POLICY IF EXISTS "Investor can create investments" ON public.investments;
DROP POLICY IF EXISTS "Startup can view received investments" ON public.investments;

-- Drop watchlist policies (both singular and plural)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'watchlist') THEN
    DROP POLICY IF EXISTS "Investor can manage own watchlist" ON public.watchlist;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'watchlists') THEN
    DROP POLICY IF EXISTS "Investor can manage own watchlists" ON public.watchlists;
  END IF;
END $$;

-- ============================================
-- PUBLIC.USERS policies (with UUID::TEXT casting)
-- ============================================
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid()::text = id);  -- ← Cast UUID to TEXT

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid()::text = id);  -- ← Cast UUID to TEXT

-- Allow service role full access
CREATE POLICY "Service role full access"
  ON public.users
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Allow insert via trigger (triggered by auth.users insert)
CREATE POLICY "Allow insert via trigger"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- STARTUP_PROFILES policies (CORRECTED: user_id not userId)
-- ============================================
CREATE POLICY "Startup users can view own profile"
  ON public.startup_profiles
  FOR SELECT
  USING (auth.uid()::text = user_id);  -- ← CORRECTED: user_id (snake_case)

CREATE POLICY "Startup users can update own profile"
  ON public.startup_profiles
  FOR UPDATE
  USING (auth.uid()::text = user_id);  -- ← CORRECTED: user_id

CREATE POLICY "Startup users can insert own profile"
  ON public.startup_profiles
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);  -- ← CORRECTED: user_id

CREATE POLICY "Anyone can view published startup profiles"
  ON public.startup_profiles
  FOR SELECT
  USING (true);  -- Public read for marketplace

-- ============================================
-- INVESTOR_PROFILES policies (CORRECTED: user_id not userId)
-- ============================================
CREATE POLICY "Investor users can view own profile"
  ON public.investor_profiles
  FOR SELECT
  USING (auth.uid()::text = user_id);  -- ← CORRECTED: user_id

CREATE POLICY "Investor users can update own profile"
  ON public.investor_profiles
  FOR UPDATE
  USING (auth.uid()::text = user_id);  -- ← CORRECTED: user_id

CREATE POLICY "Investor users can insert own profile"
  ON public.investor_profiles
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);  -- ← CORRECTED: user_id

-- ============================================
-- CAMPAIGNS policies (CORRECTED: startup_profile_id)
-- ============================================
CREATE POLICY "Anyone can view published campaigns"
  ON public.campaigns
  FOR SELECT
  USING (status = 'published' OR status = 'live');

CREATE POLICY "Startup can manage own campaigns"
  ON public.campaigns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.startup_profiles
      WHERE id = campaigns.startup_profile_id  -- ← CORRECTED: startup_profile_id
      AND user_id = auth.uid()::text  -- ← CORRECTED: user_id + UUID::TEXT cast
    )
  );

-- ============================================
-- INVESTMENTS policies (CORRECTED: investor_profile_id, campaign_id)
-- ============================================
CREATE POLICY "Investor can view own investments"
  ON public.investments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.investor_profiles
      WHERE id = investments.investor_profile_id  -- ← CORRECTED: investor_profile_id
      AND user_id = auth.uid()::text  -- ← CORRECTED: user_id + UUID::TEXT cast
    )
  );

CREATE POLICY "Investor can create investments"
  ON public.investments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.investor_profiles
      WHERE id = investments.investor_profile_id  -- ← CORRECTED: investor_profile_id
      AND user_id = auth.uid()::text
    )
  );

CREATE POLICY "Startup can view received investments"
  ON public.investments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.startup_profiles sp ON c.startup_profile_id = sp.id  -- ← CORRECTED
      WHERE c.id = investments.campaign_id  -- ← CORRECTED: campaign_id
      AND sp.user_id = auth.uid()::text  -- ← CORRECTED: user_id
    )
  );

-- ============================================
-- WATCHLIST policies (singular table, snake_case columns)
-- ============================================
CREATE POLICY "Investor can manage own watchlist"
  ON public.watchlist
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.investor_profiles
      WHERE id = watchlist.investor_profile_id::text  -- ← CORRECTED: investor_profile_id + cast to TEXT
      AND user_id = auth.uid()::text
    )
  );

-- ============================================
-- WATCHLISTS policies (plural table, if it exists with camelCase)
-- Note: Only needed if you're using the 'watchlists' table
-- ============================================
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'watchlists') THEN
    DROP POLICY IF EXISTS "Investor can manage own watchlists" ON public.watchlists;
    
    EXECUTE 'CREATE POLICY "Investor can manage own watchlists"
      ON public.watchlists
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.investor_profiles
          WHERE id = watchlists."investorProfileId"
          AND user_id = auth.uid()::text
        )
      )';
    
    RAISE NOTICE 'Created policy for watchlists (plural) table';
  END IF;
END $$;

-- ============================================
-- STEP 6: Grant permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ============================================
-- STEP 7: Helper function for user role updates (OAuth callback)
-- ============================================
CREATE OR REPLACE FUNCTION public.update_user_role(user_id_param uuid, new_role text)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET role = new_role::text,
      "updatedAt" = NOW()
  WHERE id = user_id_param::text;  -- ← Cast UUID to TEXT
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 8: Verification queries
-- ============================================

-- Check triggers are installed
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users'
ORDER BY trigger_name;

-- Check RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'startup_profiles', 'investor_profiles', 'campaigns', 'investments')
ORDER BY tablename;

-- Check policies exist
SELECT 
  schemaname,
  tablename, 
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$ 
BEGIN 
  RAISE NOTICE ''; 
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '  ✅ UUID/TEXT Fix Applied (CORRECTED COLUMN NAMES)!';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Key Changes:';
  RAISE NOTICE '  • Triggers now cast auth.uid() (UUID) to TEXT';
  RAISE NOTICE '  • All RLS policies use SNAKE_CASE column names:';
  RAISE NOTICE '    - user_id (not userId)';
  RAISE NOTICE '    - startup_profile_id (not startupProfileId)';
  RAISE NOTICE '    - investor_profile_id (not investorProfileId)';
  RAISE NOTICE '    - campaign_id (not campaignId)';
  RAISE NOTICE '  • All comparisons use UUID::TEXT casting';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Test Google OAuth signup flow';
  RAISE NOTICE '  2. Verify user appears in public.users table';
  RAISE NOTICE '  3. Check Supabase logs for any warnings';
  RAISE NOTICE '';
  RAISE NOTICE 'The "column does not exist" error should now be fixed!';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
END $$;
