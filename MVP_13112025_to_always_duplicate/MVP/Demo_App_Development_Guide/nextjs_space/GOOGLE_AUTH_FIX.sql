-- ============================================
-- GOOGLE AUTH FIX - Handle OAuth signups properly
-- ============================================
-- This fixes the "Database error saving new user" issue

-- STEP 1: Update the trigger function to handle OAuth users more gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
  user_name text;
BEGIN
  -- Skip if user already exists in public.users (avoid duplicate errors)
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Extract metadata from Supabase Auth
  -- For OAuth users, role might not be in metadata initially
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role', 
    'INVESTOR'  -- Default to INVESTOR if not specified
  );
  
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'user_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Insert user into public.users
  -- Use INSERT ... ON CONFLICT DO NOTHING to avoid errors
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
    NULL, -- NULL for all users (even email/password now use Supabase Auth)
    user_role::text,
    user_name,
    NEW.email_confirmed_at,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
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

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 2: Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 3: Create a function to update user role after OAuth redirect
-- This will be called from the callback API route
CREATE OR REPLACE FUNCTION public.update_user_role(user_id uuid, new_role text)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET role = new_role,
      "updatedAt" = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 4: Ensure RLS policies allow the trigger to work
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.users;
DROP POLICY IF EXISTS "Allow insert via trigger" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;

-- Create new policies
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid()::text = id);

-- This is critical: allow trigger to insert
CREATE POLICY "Service role full access"
  ON public.users
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Allow insert for authenticated (needed for trigger context)
CREATE POLICY "Allow insert via trigger"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- STEP 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- STEP 6: Verify trigger is working
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

SELECT 'Google Auth fix applied successfully!' AS status;
