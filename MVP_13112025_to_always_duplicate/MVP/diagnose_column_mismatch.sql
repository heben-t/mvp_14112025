-- =====================================================
-- DIAGNOSTIC SCRIPT - Prisma vs Supabase Column Mismatch
-- =====================================================
-- Run this script to see what columns exist in your database
-- and compare them with what Prisma expects
-- =====================================================

-- 1. Show current users table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Check for problematic column names (camelCase vs snake_case)
SELECT 
  'Column exists: ' || column_name AS status,
  CASE 
    WHEN column_name IN ('createdAt', 'updatedAt', 'emailVerified') 
      THEN 'PROBLEM: Using camelCase (needs to be snake_case)'
    WHEN column_name IN ('created_at', 'updated_at', 'email_verified')
      THEN 'OK: Using snake_case (correct for Prisma)'
    ELSE 'INFO: Other column'
  END AS assessment
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN (
    'createdAt', 'created_at',
    'updatedAt', 'updated_at', 
    'emailVerified', 'email_verified'
  );

-- 3. List all tables to check naming conventions
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;

-- =====================================================
-- EXPECTED COLUMNS FOR USERS TABLE (from Prisma schema)
-- =====================================================
-- id                 UUID PRIMARY KEY
-- email              VARCHAR(255) UNIQUE
-- password           VARCHAR(255)
-- role               VARCHAR(50)
-- name               VARCHAR(255)
-- email_verified     TIMESTAMPTZ
-- image              TEXT
-- created_at         TIMESTAMPTZ
-- updated_at         TIMESTAMPTZ
-- =====================================================

-- 4. Generate ALTER TABLE statements if renaming is needed
DO $$
DECLARE
  col_record RECORD;
  rename_sql TEXT := '';
BEGIN
  RAISE NOTICE '=== COLUMN RENAME COMMANDS (if needed) ===';
  
  FOR col_record IN 
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users'
  LOOP
    CASE col_record.column_name
      WHEN 'createdAt' THEN
        RAISE NOTICE 'ALTER TABLE users RENAME COLUMN "createdAt" TO created_at;';
      WHEN 'updatedAt' THEN
        RAISE NOTICE 'ALTER TABLE users RENAME COLUMN "updatedAt" TO updated_at;';
      WHEN 'emailVerified' THEN
        RAISE NOTICE 'ALTER TABLE users RENAME COLUMN "emailVerified" TO email_verified;';
      ELSE
        NULL;
    END CASE;
  END LOOP;
  
  RAISE NOTICE '=== END RENAME COMMANDS ===';
END $$;

-- =====================================================
-- QUICK FIX FOR THE ERROR
-- =====================================================
-- The error "column 'updatedAt' does not exist" means:
-- Either:
--   A) The column doesn't exist at all (unlikely)
--   B) The column exists as 'updated_at' but code is looking for 'updatedAt'
--
-- Solution: Make sure Prisma schema has proper @map directives
-- OR rename database columns to match Prisma's naming
-- =====================================================
