-- ============================================================================
-- HEBED AI - COMPLETE DATABASE REBUILD FROM SCRATCH
-- ============================================================================
-- This script will:
-- 1. DROP ALL existing tables and types
-- 2. CREATE fresh schema with proper snake_case naming
-- 3. DISABLE all RLS policies
-- 4. Create proper indexes and foreign keys
-- ============================================================================

-- STEP 1: DROP EVERYTHING
-- ============================================================================

-- Drop all tables (cascade will remove dependencies)
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS watchlists CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS startup_metrics CASCADE;
DROP TABLE IF EXISTS startup_profiles CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS investor_preferences CASCADE;
DROP TABLE IF EXISTS investor_profiles CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS campaign_followers CASCADE;
DROP TABLE IF EXISTS campaign_comments CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all custom types
DROP TYPE IF EXISTS verification_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS investment_status CASCADE;
DROP TYPE IF EXISTS data_verification_level CASCADE;

-- Drop all triggers and functions
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================================================
-- STEP 2: CREATE ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('STARTUP', 'INVESTOR', 'ADMIN');
CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE investment_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');
CREATE TYPE subscription_tier AS ENUM ('STARTUP_BASIC', 'INVESTOR_BASIC', 'STARTUP_PRO', 'INVESTOR_PRO');
CREATE TYPE data_verification_level AS ENUM ('VERIFIED', 'PARTIALLY_VERIFIED', 'SELF_REPORTED');

-- ============================================================================
-- STEP 3: CREATE TABLES (with proper snake_case and UUID types)
-- ============================================================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  role user_role DEFAULT 'INVESTOR',
  name VARCHAR(255),
  email_verified TIMESTAMPTZ,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounts table (for OAuth)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type VARCHAR(255),
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification tokens table
CREATE TABLE verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Startup profiles table
CREATE TABLE startup_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  logo TEXT,
  industry VARCHAR(100) NOT NULL,
  stage VARCHAR(50) NOT NULL,
  description TEXT,
  website VARCHAR(255),
  geographic_presence VARCHAR(100),
  data_migration_method VARCHAR(50),
  kyc_status verification_status DEFAULT 'PENDING',
  business_license TEXT,
  founder_id_document TEXT,
  profile_completion_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investor profiles table
CREATE TABLE investor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  investor_type VARCHAR(50),
  investment_types JSONB,
  ticket_range VARCHAR(50),
  investment_stages JSONB,
  sector_focus JSONB,
  geo_focus JSONB DEFAULT '["UAE"]',
  roi_priorities JSONB,
  profile_visibility VARCHAR(50) DEFAULT 'visible',
  is_accredited BOOLEAN DEFAULT FALSE,
  professional_title VARCHAR(255),
  investment_focus TEXT,
  ticket_size VARCHAR(50),
  accreditation_status verification_status DEFAULT 'PENDING',
  accreditation_document TEXT,
  stripe_customer_id VARCHAR(255),
  stripe_account_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investor preferences table
CREATE TABLE investor_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_profile_id UUID UNIQUE NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
  min_roi_threshold DECIMAL(5, 2),
  preferred_stages TEXT,
  sector_filters TEXT,
  geographic_preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_profile_id UUID NOT NULL REFERENCES startup_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  vsl_url TEXT,
  pitch_deck TEXT,
  fundraising_goal DECIMAL(15, 2) NOT NULL,
  current_raised DECIMAL(15, 2) DEFAULT 0,
  equity_offered DECIMAL(5, 2) NOT NULL,
  valuation DECIMAL(15, 2),
  min_investment DECIMAL(15, 2) DEFAULT 1000,
  max_investment DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  interested_investors INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investments table
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  investor_profile_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  status investment_status DEFAULT 'PENDING',
  stripe_payment_intent_id VARCHAR(255),
  escrow_released BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Startup metrics table
CREATE TABLE startup_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_profile_id UUID NOT NULL REFERENCES startup_profiles(id) ON DELETE CASCADE,
  period VARCHAR(7) NOT NULL, -- YYYY-MM format
  mrr_now DECIMAL(12, 2),
  mrr_prev DECIMAL(12, 2),
  arr DECIMAL(12, 2),
  churn_rate DECIMAL(5, 2),
  active_customers INTEGER,
  revenue_growth_rate DECIMAL(5, 2),
  burn_rate DECIMAL(12, 2),
  runway_months INTEGER,
  cash_balance DECIMAL(12, 2),
  cac DECIMAL(10, 2),
  ltv DECIMAL(10, 2),
  ltv_cac_ratio DECIMAL(5, 2),
  active_users_now INTEGER,
  active_users_prev INTEGER,
  engagement_rate DECIMAL(5, 2),
  returning_users INTEGER,
  use_of_ai VARCHAR(100),
  ai_improves_most VARCHAR(100),
  ai_model_production VARCHAR(10),
  followers_count INTEGER,
  team_years_experience INTEGER,
  mentions_count INTEGER,
  verification_level data_verification_level DEFAULT 'SELF_REPORTED',
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(startup_profile_id, period)
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  stripe_current_period_end TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlists table
CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_profile_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  alert_on_metric_change BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(investor_profile_id, campaign_id)
);

-- Campaign followers table
CREATE TABLE campaign_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

-- Campaign comments table
CREATE TABLE campaign_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: CREATE INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Accounts indexes
CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- Sessions indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);

-- Startup profiles indexes
CREATE INDEX idx_startup_profiles_user_id ON startup_profiles(user_id);
CREATE INDEX idx_startup_profiles_industry ON startup_profiles(industry);
CREATE INDEX idx_startup_profiles_stage ON startup_profiles(stage);

-- Investor profiles indexes
CREATE INDEX idx_investor_profiles_user_id ON investor_profiles(user_id);

-- Campaigns indexes
CREATE INDEX idx_campaigns_startup_id ON campaigns(startup_profile_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_published_at ON campaigns(published_at);

-- Investments indexes
CREATE INDEX idx_investments_campaign_id ON investments(campaign_id);
CREATE INDEX idx_investments_investor_id ON investments(investor_profile_id);
CREATE INDEX idx_investments_status ON investments(status);

-- Startup metrics indexes
CREATE INDEX idx_startup_metrics_startup_id ON startup_metrics(startup_profile_id);
CREATE INDEX idx_startup_metrics_period ON startup_metrics(period);

-- Watchlists indexes
CREATE INDEX idx_watchlists_investor_id ON watchlists(investor_profile_id);
CREATE INDEX idx_watchlists_campaign_id ON watchlists(campaign_id);

-- Campaign followers indexes
CREATE INDEX idx_followers_campaign_id ON campaign_followers(campaign_id);
CREATE INDEX idx_followers_user_id ON campaign_followers(user_id);

-- Campaign comments indexes
CREATE INDEX idx_comments_campaign_id ON campaign_comments(campaign_id);
CREATE INDEX idx_comments_user_id ON campaign_comments(user_id);

-- ============================================================================
-- STEP 5: DISABLE ALL RLS (Row Level Security)
-- ============================================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE startup_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE investor_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE investments DISABLE ROW LEVEL SECURITY;
ALTER TABLE startup_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_followers DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_comments DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;

-- ============================================================================
-- STEP 6: GRANT PERMISSIONS
-- ============================================================================

-- Grant all permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant all permissions to anon users
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant all permissions to service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- STEP 7: CREATE TRIGGER FOR AUTO USER PROFILE CREATION (OPTIONAL - DISABLED)
-- ============================================================================
-- This is commented out to avoid the UUID/text mismatch error
-- You can enable it later if needed with proper UUID casting

/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table from auth.users
  INSERT INTO public.users (id, email, email_verified, created_at, updated_at)
  VALUES (
    NEW.id::uuid,  -- Cast to UUID
    NEW.email,
    NEW.email_confirmed_at,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified,
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER handle_new_user
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
*/

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- List all tables
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Database has been completely rebuilt with:
-- ✅ All tables using snake_case naming
-- ✅ All IDs are UUID type
-- ✅ All foreign keys properly set
-- ✅ All indexes created
-- ✅ ALL RLS DISABLED (unrestricted access)
-- ✅ Proper ENUM types
-- ============================================================================
