-- ============================================
-- SUPABASE AUTH FIX - Complete Solution
-- ============================================
-- Run this in Supabase SQL Editor to fix the authentication error

-- STEP 1: Fix the users table schema
-- Make password nullable for OAuth users
ALTER TABLE public.users 
  ALTER COLUMN password DROP NOT NULL;

-- Add default for updatedAt if missing
ALTER TABLE public.users 
  ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- Add default for role
ALTER TABLE public.users 
  ALTER COLUMN role SET DEFAULT 'INVESTOR';

-- STEP 2: Create trigger function to auto-create users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
  user_name text;
BEGIN
  -- Extract metadata from Supabase Auth
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'INVESTOR');
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name', 
    split_part(NEW.email, '@', 1)
  );
  
  -- Insert or update user in public.users
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
    NEW.id,
    NEW.email,
    NULL, -- NULL for OAuth, will be set for email/password
    user_role::text,
    user_name,
    NEW.email_confirmed_at,
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    "emailVerified" = EXCLUDED."emailVerified",
    image = COALESCE(EXCLUDED.image, public.users.image),
    "updatedAt" = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 4: Set up RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.users;
DROP POLICY IF EXISTS "Allow insert via trigger" ON public.users;

-- Create new policies
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid()::text = id);

CREATE POLICY "Allow insert via trigger"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- STEP 5: Grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- STEP 6: Sync email verification
CREATE OR REPLACE FUNCTION public.sync_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET "emailVerified" = NEW.email_confirmed_at,
      "updatedAt" = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;
CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.sync_email_verification();

-- VERIFICATION: Check if trigger is active
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_email_verified');

SELECT 'Supabase Auth setup completed successfully!' AS status;
