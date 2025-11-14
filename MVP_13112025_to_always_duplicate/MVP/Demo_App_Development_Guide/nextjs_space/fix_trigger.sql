-- This SQL will disable the automatic trigger that's causing the error
-- Run this in Supabase SQL Editor

-- Drop the trigger that automatically creates user_profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function as well
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Note: We'll create user profiles manually in the registration route instead
-- This gives us better error handling and control
