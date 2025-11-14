-- ============================================
-- COMPLETE UUID/TEXT TYPE MISMATCH FIX
-- ============================================
-- This fixes the "operator does not exist: text = uuid" error
-- caused by comparing public.users (text IDs) with auth.users (UUID IDs)

-- PROBLEM: 
-- - auth.users.id is UUID
-- - public.users.id is TEXT (from Prisma schema)
-- - Triggers and RLS policies fail when comparing these

-- SOLUTION: Always cast to the same type in comparisons

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
-- STEP 5: Fix RLS policies with proper UUID casting
-- ============================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.users;
DROP POLICY IF EXISTS "Allow insert via trigger" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;

-- PUBLIC.USERS policies (with UUID::TEXT casting)
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
-- STARTUP_PROFILES policies
-- ============================================
DROP POLICY IF EXISTS "Startup users can view own profile" ON public.startup_profiles;
DROP POLICY IF EXISTS "Startup users can update own profile" ON public.startup_profiles;
DROP POLICY IF EXISTS "Startup users can insert own profile" ON public.startup_profiles;
DROP POLICY IF EXISTS "Anyone can view published startup profiles" ON public.startup_profiles;

CREATE POLICY "Startup users can view own profile"
  ON public.startup_profiles
  FOR SELECT
  USING (auth.uid()::text = "userId");  -- ← Cast UUID to TEXT

CREATE POLICY "Startup users can update own profile"
  ON public.startup_profiles
  FOR UPDATE
  USING (auth.uid()::text = "userId");

CREATE POLICY "Startup users can insert own profile"
  ON public.startup_profiles
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Anyone can view published startup profiles"
  ON public.startup_profiles
  FOR SELECT
  USING (true);  -- Public read for marketplace

-- ============================================
-- INVESTOR_PROFILES policies
-- ============================================
DROP POLICY IF EXISTS "Investor users can view own profile" ON public.investor_profiles;
DROP POLICY IF EXISTS "Investor users can update own profile" ON public.investor_profiles;
DROP POLICY IF EXISTS "Investor users can insert own profile" ON public.investor_profiles;

CREATE POLICY "Investor users can view own profile"
  ON public.investor_profiles
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Investor users can update own profile"
  ON public.investor_profiles
  FOR UPDATE
  USING (auth.uid()::text = "userId");

CREATE POLICY "Investor users can insert own profile"
  ON public.investor_profiles
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- ============================================
-- CAMPAIGNS policies
-- ============================================
DROP POLICY IF EXISTS "Anyone can view published campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Startup can manage own campaigns" ON public.campaigns;

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
      WHERE id = campaigns."startupProfileId"
      AND "userId" = auth.uid()::text  -- ← Cast UUID to TEXT
    )
  );

-- ============================================
-- INVESTMENTS policies
-- ============================================
DROP POLICY IF EXISTS "Investor can view own investments" ON public.investments;
DROP POLICY IF EXISTS "Investor can create investments" ON public.investments;
DROP POLICY IF EXISTS "Startup can view received investments" ON public.investments;

CREATE POLICY "Investor can view own investments"
  ON public.investments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.investor_profiles
      WHERE id = investments."investorProfileId"
      AND "userId" = auth.uid()::text  -- ← Cast UUID to TEXT
    )
  );

CREATE POLICY "Investor can create investments"
  ON public.investments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.investor_profiles
      WHERE id = investments."investorProfileId"
      AND "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Startup can view received investments"
  ON public.investments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.startup_profiles sp ON c."startupProfileId" = sp.id
      WHERE c.id = investments."campaignId"
      AND sp."userId" = auth.uid()::text
    )
  );

-- ============================================
-- WATCHLISTS policies
-- ============================================
DROP POLICY IF EXISTS "Investor can manage own watchlist" ON public.watchlists;

CREATE POLICY "Investor can manage own watchlist"
  ON public.watchlists
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.investor_profiles
      WHERE id = watchlists."investorProfileId"
      AND "userId" = auth.uid()::text
    )
  );

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
  RAISE NOTICE '  ✅ UUID/TEXT Type Mismatch Fix Applied Successfully!';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Key Changes:';
  RAISE NOTICE '  • Triggers now cast auth.uid() (UUID) to TEXT';
  RAISE NOTICE '  • All RLS policies updated with proper UUID::TEXT casting';
  RAISE NOTICE '  • Email verification sync function updated';
  RAISE NOTICE '  • Helper function for OAuth role updates created';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Test Google OAuth signup flow';
  RAISE NOTICE '  2. Verify user appears in public.users table';
  RAISE NOTICE '  3. Check Supabase logs for any warnings';
  RAISE NOTICE '';
  RAISE NOTICE 'The error "operator does not exist: text = uuid" should now be fixed!';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
END $$;
