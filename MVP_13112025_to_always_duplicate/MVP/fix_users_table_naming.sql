-- =====================================================
-- FIX USERS TABLE - Column Naming Mismatch Resolution
-- =====================================================
-- Issue: Prisma schema uses snake_case (created_at, updated_at)
-- but database might have camelCase or missing columns
-- This script ensures the users table matches Prisma exactly
-- 
-- TESTING MODE: RLS DISABLED FOR ALL TABLES
-- =====================================================

-- Step 1: Drop the existing users table if you want a clean start
-- WARNING: This will delete all user data! Only use in development
-- Uncomment the next line if you want to start fresh
-- DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Create users table with exact Prisma schema mapping
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  role VARCHAR(50) DEFAULT 'INVESTOR',
  name VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create indexes matching Prisma schema
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Step 4: Add trigger to auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 5: DISABLE Row Level Security (RLS) - TESTING MODE
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop any existing RLS policies (cleanup)
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Service role has full access" ON users;
DROP POLICY IF EXISTS "Authenticated users can view public user info" ON users;

-- Step 6: Grant necessary permissions
GRANT ALL ON users TO postgres;
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;

-- =====================================================
-- MIGRATION SCRIPT (If you have existing data)
-- =====================================================
-- If you already have a users table with different column names,
-- use this section to migrate the data

-- Uncomment and modify as needed:

/*
-- Rename columns if they exist with wrong names
DO $$
BEGIN
  -- Check and rename createdAt to created_at
  IF EXISTS(
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name='users' AND column_name='createdAt'
  ) THEN
    ALTER TABLE users RENAME COLUMN "createdAt" TO created_at;
  END IF;

  -- Check and rename updatedAt to updated_at
  IF EXISTS(
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name='users' AND column_name='updatedAt'
  ) THEN
    ALTER TABLE users RENAME COLUMN "updatedAt" TO updated_at;
  END IF;

  -- NOTE: emailVerified remains unchanged (camelCase)
END $$;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the table structure

-- Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check indexes
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'users';

-- Check RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'users';

-- =====================================================
-- NOTES
-- =====================================================
-- 1. This script creates a users table that exactly matches 
--    the Prisma schema with mixed naming conventions:
--    - created_at, updated_at (snake_case)
--    - emailVerified (camelCase - kept as is per user request)
-- 
-- 2. RLS (Row Level Security) is DISABLED for testing purposes
--    ⚠️ IMPORTANT: Enable RLS before production deployment!
--
-- 3. The updated_at column is automatically updated via trigger
--
-- 4. Make sure your Prisma schema matches:
--    created_at   DateTime @default(now())
--    updated_at   DateTime @default(now())
--    emailVerified DateTime? @map("emailVerified")
--
-- 5. To disable RLS on ALL tables for testing:
--    Run the separate script: disable_rls_all_tables.sql
--
-- =====================================================
