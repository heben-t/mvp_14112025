-- CAMPAIGN FOREIGN KEY FIX
-- Run this in Supabase SQL Editor

-- Step 1: Check current foreign key (diagnostic)
SELECT
    tc.constraint_name,
    kcu.column_name AS local_column,
    ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'campaigns' 
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'startup_profile_id';

-- Expected: foreign_column should be 'id'
-- If it shows 'userId', that's the problem!

-- Step 2: Drop the incorrect foreign key
ALTER TABLE campaigns 
DROP CONSTRAINT IF EXISTS campaigns_startup_profile_id_fkey;

-- Step 3: Recreate with correct reference to 'id' column
ALTER TABLE campaigns
ADD CONSTRAINT campaigns_startup_profile_id_fkey
FOREIGN KEY (startup_profile_id) 
REFERENCES startup_profiles(id)
ON DELETE CASCADE;

-- Step 4: Verify the fix
SELECT
    tc.constraint_name,
    kcu.column_name AS local_column,
    ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'campaigns' 
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'startup_profile_id';

-- Should now show:
-- constraint_name: campaigns_startup_profile_id_fkey
-- local_column: startup_profile_id
-- foreign_table: startup_profiles
-- foreign_column: id ✅
