-- ============================================
-- Supabase Auth Integration Setup
-- ============================================
-- This script sets up automatic user creation in the public.users table
-- when a user signs up via Supabase Auth (including OAuth providers)

-- First, ensure the users table has the correct schema
-- Make password nullable since OAuth users won't have passwords
ALTER TABLE public.users 
  ALTER COLUMN password DROP NOT NULL;

-- Add default values for required fields
ALTER TABLE public.users 
  ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- Create a function to handle new user creation from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
BEGIN
  -- Extract role from user metadata (set during signup)
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'INVESTOR');
  
  -- Insert into public.users table
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
    '', -- Empty string for OAuth users, will be NULL for email/password
    user_role::text,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN NEW.email_confirmed_at ELSE NULL END,
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

-- Create trigger on Supabase's auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- Enable RLS if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;

-- Create RLS policies
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow authenticated users to insert (trigger handles this)
CREATE POLICY "Enable insert for authenticated users"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to sync email verification
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

-- Trigger to sync email verification
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;
CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.sync_email_verification();

-- ============================================
-- Test the setup (optional - comment out if not needed)
-- ============================================
-- You can test by signing up a new user and checking if they appear in public.users

SELECT 'Setup completed successfully!' AS status;
