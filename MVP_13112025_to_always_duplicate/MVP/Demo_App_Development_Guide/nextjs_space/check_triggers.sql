-- Run this in Supabase SQL Editor to check what triggers exist

-- Check all triggers on auth.users table
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';

-- Check all functions in public schema that might be triggers
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%user%';
