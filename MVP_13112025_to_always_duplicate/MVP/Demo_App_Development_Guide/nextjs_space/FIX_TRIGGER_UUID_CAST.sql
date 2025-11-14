-- FIX TRIGGER: Cast UUID to TEXT for public.users
-- This fixes the type mismatch causing trigger failures

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
  user_name text;
BEGIN
  -- Skip if user already exists in public.users (avoid duplicate errors)
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id::text) THEN
    RETURN NEW;
  END IF;

  -- Extract metadata from Supabase Auth
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
  -- ⚠️ CRITICAL: Cast NEW.id::text because auth.users.id is UUID but public.users.id is TEXT
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
    NEW.id::text,  -- ← CAST UUID TO TEXT
    NEW.email,
    NULL,
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

-- Verify trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

SELECT 'Trigger function updated with UUID→TEXT casting!' AS status;
