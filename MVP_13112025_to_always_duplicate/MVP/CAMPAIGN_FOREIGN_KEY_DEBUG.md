# Foreign Key Constraint Debug Guide

## Error
```
Foreign key constraint violated on the constraint: `campaigns_startup_profile_id_fkey`
```

## What This Means
The `startup_profile_id` value `1407806f-291c-479c-9c42-80c4000c1ba4` being inserted into `campaigns` table doesn't exist in the `startup_profiles.id` column.

---

## Diagnostic Steps

### Step 1: Check if the startup_profile actually exists

Run in Supabase SQL Editor:

```sql
-- Check if this ID exists in startup_profiles
SELECT id, "userId", "companyName" 
FROM startup_profiles 
WHERE id = '1407806f-291c-479c-9c42-80c4000c1ba4';
```

**Expected**: Should return 1 row  
**If returns 0 rows**: The startup profile doesn't exist!

---

### Step 2: Find the actual user's startup profile

```sql
-- Find startup profile by userId (the authenticated user)
SELECT id, "userId", "companyName", created_at
FROM startup_profiles
WHERE "userId" = '4e2d571d-87f2-41fe-8a3a-c9fd62d1562e';  -- Replace with actual user ID
```

---

### Step 3: Check foreign key definition

```sql
-- Verify the foreign key constraint
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_name = 'campaigns_startup_profile_id_fkey';
```

**Expected result**:
```
constraint_name                      | table_name | column_name          | foreign_table_name | foreign_column_name
campaigns_startup_profile_id_fkey    | campaigns  | startup_profile_id   | startup_profiles   | id
```

---

## Likely Issues

### Issue 1: Foreign key references wrong column

The foreign key might be pointing to `startup_profiles.userId` instead of `startup_profiles.id`.

**Check**:
```sql
SELECT ccu.column_name 
FROM information_schema.constraint_column_usage AS ccu
WHERE ccu.constraint_name = 'campaigns_startup_profile_id_fkey'
  AND ccu.table_name = 'startup_profiles';
```

**Should be**: `id`  
**If it shows**: `userId` ← **THIS IS THE PROBLEM!**

**Fix**:
```sql
-- Drop wrong foreign key
ALTER TABLE campaigns 
DROP CONSTRAINT campaigns_startup_profile_id_fkey;

-- Add correct foreign key
ALTER TABLE campaigns
ADD CONSTRAINT campaigns_startup_profile_id_fkey
FOREIGN KEY (startup_profile_id) 
REFERENCES startup_profiles(id)
ON DELETE CASCADE;
```

---

### Issue 2: Startup profile doesn't exist

If no startup profile exists for the user:

```sql
-- Check if user has a startup profile
SELECT 
  u.id as user_id,
  u.email,
  sp.id as startup_profile_id,
  sp."companyName"
FROM users u
LEFT JOIN startup_profiles sp ON sp."userId" = u.id
WHERE u.id = '4e2d571d-87f2-41fe-8a3a-c9fd62d1562e';  -- Your user ID
```

If `startup_profile_id` is NULL, the user needs to complete onboarding first.

---

## Quick Fix (Most Likely Solution)

The foreign key probably references `userId` instead of `id`. Run this:

```sql
-- Fix the foreign key constraint
ALTER TABLE campaigns 
DROP CONSTRAINT IF EXISTS campaigns_startup_profile_id_fkey;

ALTER TABLE campaigns
ADD CONSTRAINT campaigns_startup_profile_id_fkey
FOREIGN KEY (startup_profile_id) 
REFERENCES startup_profiles(id)
ON DELETE CASCADE;
```

---

## Verification After Fix

```sql
-- This should work after fixing the foreign key
INSERT INTO campaigns (
  startup_profile_id,
  title,
  campaign_objective,
  description,
  status
) VALUES (
  '1407806f-291c-479c-9c42-80c4000c1ba4',
  'Test Campaign',
  'Test objective',
  'Test description',
  'draft'
);
```

If it works, delete the test row:
```sql
DELETE FROM campaigns WHERE title = 'Test Campaign';
```

---

## Summary

1. ✅ Check if foreign key references `id` or `userId`
2. ✅ If it references `userId`, drop and recreate it to reference `id`
3. ✅ Verify startup profile exists
4. ✅ Test campaign creation again

Run the diagnostic queries above to identify the exact issue! 🔍
