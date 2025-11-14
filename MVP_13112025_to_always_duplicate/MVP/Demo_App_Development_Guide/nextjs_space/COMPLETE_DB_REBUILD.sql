-- ========================================
-- HEBED AI - COMPLETE DATABASE REBUILD
-- ========================================
-- This script completely rebuilds the database from scratch
-- with proper UUID types, snake_case naming, and unrestricted RLS
-- ========================================

-- STEP 1: DROP ALL EXISTING TABLES AND TYPES
-- ========================================

DROP TABLE IF EXISTS watchlists CASCADE;
DROP TABLE IF EXISTS campaign_followers CASCADE;
DROP TABLE IF EXISTS campaign_comments CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS startup_metrics CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS investor_preferences CASCADE;
DROP TABLE IF EXISTS investor_profiles CASCADE;
DROP TABLE IF EXISTS startup_profiles CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS verification_status CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS investment_status CASCADE;
DROP TYPE IF EXISTS data_verification_level CASCADE;

-- ========================================
-- STEP 2: CREATE ENUMS
-- ========================================

CREATE TYPE user_role AS ENUM ('STARTUP', 'INVESTOR', 'ADMIN');
CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE subscription_tier AS ENUM ('STARTUP_BASIC', 'INVESTOR_BASIC', 'STARTUP_PRO', 'INVESTOR_PRO');
CREATE TYPE investment_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');
CREATE TYPE data_verification_level AS ENUM ('VERIFIED', 'PARTIALLY_VERIFIED', 'SELF_REPORTED');

-- ========================================
-- STEP 3: CREATE CORE TABLES
-- ========================================

-- Users table (core authentication)
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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Accounts (OAuth/NextAuth)
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
  UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- Sessions (NextAuth)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Verification tokens (NextAuth)
CREATE TABLE verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  UNIQUE(identifier, token)
);

-- ========================================
-- STEP 4: STARTUP TABLES
-- ========================================

-- Startup Profiles
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_profile_completion CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100)
);

CREATE INDEX idx_startup_profiles_user_id ON startup_profiles(user_id);
CREATE INDEX idx_startup_profiles_industry ON startup_profiles(industry);
CREATE INDEX idx_startup_profiles_stage ON startup_profiles(stage);

-- Startup Metrics
CREATE TABLE startup_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_profile_id UUID NOT NULL REFERENCES startup_profiles(id) ON DELETE CASCADE,
  period VARCHAR(7) NOT NULL, -- YYYY-MM format
  
  -- Finance metrics
  mrr_now DECIMAL(12,2),
  mrr_prev DECIMAL(12,2),
  arr DECIMAL(12,2),
  churn_rate DECIMAL(5,2),
  active_customers INTEGER,
  revenue_growth_rate DECIMAL(5,2),
  burn_rate DECIMAL(12,2),
  runway_months INTEGER,
  cash_balance DECIMAL(12,2),
  cac DECIMAL(10,2),
  ltv DECIMAL(10,2),
  ltv_cac_ratio DECIMAL(5,2),
  
  -- Industry/Product metrics
  active_users_now INTEGER,
  active_users_prev INTEGER,
  engagement_rate DECIMAL(5,2),
  returning_users INTEGER,
  
  -- Technology metrics
  use_of_ai VARCHAR(100),
  ai_improves_most VARCHAR(100),
  ai_model_production VARCHAR(10),
  
  -- Social/Community metrics
  followers_count INTEGER,
  team_years_experience INTEGER,
  mentions_count INTEGER,
  
  -- Verification
  verification_level data_verification_level DEFAULT 'SELF_REPORTED',
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(startup_profile_id, period)
);

CREATE INDEX idx_startup_metrics_startup_id ON startup_metrics(startup_profile_id);
CREATE INDEX idx_startup_metrics_period ON startup_metrics(period);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_profile_id UUID NOT NULL REFERENCES startup_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  vsl_url TEXT,
  pitch_deck TEXT,
  fundraising_goal DECIMAL(15,2) NOT NULL,
  current_raised DECIMAL(15,2) DEFAULT 0,
  equity_offered DECIMAL(5,2) NOT NULL,
  valuation DECIMAL(15,2),
  min_investment DECIMAL(15,2) DEFAULT 1000,
  max_investment DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  interested_investors INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_startup_id ON campaigns(startup_profile_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_published_at ON campaigns(published_at);

-- Campaign Comments
CREATE TABLE campaign_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_campaign_id ON campaign_comments(campaign_id);
CREATE INDEX idx_comments_user_id ON campaign_comments(user_id);

-- Campaign Followers
CREATE TABLE campaign_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

CREATE INDEX idx_followers_campaign_id ON campaign_followers(campaign_id);
CREATE INDEX idx_followers_user_id ON campaign_followers(user_id);

-- ========================================
-- STEP 5: INVESTOR TABLES
-- ========================================

-- Investor Profiles
CREATE TABLE investor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Onboarding Step 1: Profile
  investor_type VARCHAR(50),
  investment_types JSONB,
  ticket_range VARCHAR(50),
  
  -- Onboarding Step 2: Preferences
  investment_stages JSONB,
  sector_focus JSONB,
  geo_focus JSONB DEFAULT '["UAE"]',
  roi_priorities JSONB,
  
  -- Onboarding Step 3: Visibility
  profile_visibility VARCHAR(50) DEFAULT 'visible',
  is_accredited BOOLEAN DEFAULT false,
  
  -- Legacy/additional fields
  professional_title VARCHAR(255),
  investment_focus TEXT,
  ticket_size VARCHAR(50),
  accreditation_status verification_status DEFAULT 'PENDING',
  accreditation_document TEXT,
  
  -- Stripe integration
  stripe_customer_id VARCHAR(255),
  stripe_account_id VARCHAR(255),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_investor_profiles_user_id ON investor_profiles(user_id);

-- Investor Preferences (additional filtering)
CREATE TABLE investor_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_profile_id UUID UNIQUE NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
  min_roi_threshold DECIMAL(5,2),
  preferred_stages TEXT,
  sector_filters TEXT,
  geographic_preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlists
CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_profile_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  alert_on_metric_change BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(investor_profile_id, campaign_id)
);

CREATE INDEX idx_watchlists_investor_id ON watchlists(investor_profile_id);
CREATE INDEX idx_watchlists_campaign_id ON watchlists(campaign_id);

-- ========================================
-- STEP 6: INVESTMENT & SUBSCRIPTION TABLES
-- ========================================

-- Investments
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  investor_profile_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  status investment_status DEFAULT 'PENDING',
  stripe_payment_intent_id VARCHAR(255),
  escrow_released BOOLEAN DEFAULT false,
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_investments_campaign_id ON investments(campaign_id);
CREATE INDEX idx_investments_investor_id ON investments(investor_profile_id);
CREATE INDEX idx_investments_status ON investments(status);

-- Subscriptions
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

-- ========================================
-- STEP 7: ENABLE ROW LEVEL SECURITY (UNRESTRICTED)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- UNRESTRICTED RLS POLICIES (FULL ACCESS)
-- ========================================

-- Users
CREATE POLICY "users_unrestricted_select" ON users FOR SELECT USING (true);
CREATE POLICY "users_unrestricted_insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_unrestricted_update" ON users FOR UPDATE USING (true);
CREATE POLICY "users_unrestricted_delete" ON users FOR DELETE USING (true);

-- Accounts
CREATE POLICY "accounts_unrestricted_select" ON accounts FOR SELECT USING (true);
CREATE POLICY "accounts_unrestricted_insert" ON accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "accounts_unrestricted_update" ON accounts FOR UPDATE USING (true);
CREATE POLICY "accounts_unrestricted_delete" ON accounts FOR DELETE USING (true);

-- Sessions
CREATE POLICY "sessions_unrestricted_select" ON sessions FOR SELECT USING (true);
CREATE POLICY "sessions_unrestricted_insert" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "sessions_unrestricted_update" ON sessions FOR UPDATE USING (true);
CREATE POLICY "sessions_unrestricted_delete" ON sessions FOR DELETE USING (true);

-- Verification Tokens
CREATE POLICY "tokens_unrestricted_select" ON verification_tokens FOR SELECT USING (true);
CREATE POLICY "tokens_unrestricted_insert" ON verification_tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "tokens_unrestricted_update" ON verification_tokens FOR UPDATE USING (true);
CREATE POLICY "tokens_unrestricted_delete" ON verification_tokens FOR DELETE USING (true);

-- Startup Profiles
CREATE POLICY "startup_profiles_unrestricted_select" ON startup_profiles FOR SELECT USING (true);
CREATE POLICY "startup_profiles_unrestricted_insert" ON startup_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "startup_profiles_unrestricted_update" ON startup_profiles FOR UPDATE USING (true);
CREATE POLICY "startup_profiles_unrestricted_delete" ON startup_profiles FOR DELETE USING (true);

-- Startup Metrics
CREATE POLICY "startup_metrics_unrestricted_select" ON startup_metrics FOR SELECT USING (true);
CREATE POLICY "startup_metrics_unrestricted_insert" ON startup_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "startup_metrics_unrestricted_update" ON startup_metrics FOR UPDATE USING (true);
CREATE POLICY "startup_metrics_unrestricted_delete" ON startup_metrics FOR DELETE USING (true);

-- Campaigns
CREATE POLICY "campaigns_unrestricted_select" ON campaigns FOR SELECT USING (true);
CREATE POLICY "campaigns_unrestricted_insert" ON campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "campaigns_unrestricted_update" ON campaigns FOR UPDATE USING (true);
CREATE POLICY "campaigns_unrestricted_delete" ON campaigns FOR DELETE USING (true);

-- Campaign Comments
CREATE POLICY "comments_unrestricted_select" ON campaign_comments FOR SELECT USING (true);
CREATE POLICY "comments_unrestricted_insert" ON campaign_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "comments_unrestricted_update" ON campaign_comments FOR UPDATE USING (true);
CREATE POLICY "comments_unrestricted_delete" ON campaign_comments FOR DELETE USING (true);

-- Campaign Followers
CREATE POLICY "followers_unrestricted_select" ON campaign_followers FOR SELECT USING (true);
CREATE POLICY "followers_unrestricted_insert" ON campaign_followers FOR INSERT WITH CHECK (true);
CREATE POLICY "followers_unrestricted_update" ON campaign_followers FOR UPDATE USING (true);
CREATE POLICY "followers_unrestricted_delete" ON campaign_followers FOR DELETE USING (true);

-- Investor Profiles
CREATE POLICY "investor_profiles_unrestricted_select" ON investor_profiles FOR SELECT USING (true);
CREATE POLICY "investor_profiles_unrestricted_insert" ON investor_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "investor_profiles_unrestricted_update" ON investor_profiles FOR UPDATE USING (true);
CREATE POLICY "investor_profiles_unrestricted_delete" ON investor_profiles FOR DELETE USING (true);

-- Investor Preferences
CREATE POLICY "investor_preferences_unrestricted_select" ON investor_preferences FOR SELECT USING (true);
CREATE POLICY "investor_preferences_unrestricted_insert" ON investor_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "investor_preferences_unrestricted_update" ON investor_preferences FOR UPDATE USING (true);
CREATE POLICY "investor_preferences_unrestricted_delete" ON investor_preferences FOR DELETE USING (true);

-- Watchlists
CREATE POLICY "watchlists_unrestricted_select" ON watchlists FOR SELECT USING (true);
CREATE POLICY "watchlists_unrestricted_insert" ON watchlists FOR INSERT WITH CHECK (true);
CREATE POLICY "watchlists_unrestricted_update" ON watchlists FOR UPDATE USING (true);
CREATE POLICY "watchlists_unrestricted_delete" ON watchlists FOR DELETE USING (true);

-- Investments
CREATE POLICY "investments_unrestricted_select" ON investments FOR SELECT USING (true);
CREATE POLICY "investments_unrestricted_insert" ON investments FOR INSERT WITH CHECK (true);
CREATE POLICY "investments_unrestricted_update" ON investments FOR UPDATE USING (true);
CREATE POLICY "investments_unrestricted_delete" ON investments FOR DELETE USING (true);

-- Subscriptions
CREATE POLICY "subscriptions_unrestricted_select" ON subscriptions FOR SELECT USING (true);
CREATE POLICY "subscriptions_unrestricted_insert" ON subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "subscriptions_unrestricted_update" ON subscriptions FOR UPDATE USING (true);
CREATE POLICY "subscriptions_unrestricted_delete" ON subscriptions FOR DELETE USING (true);

-- ========================================
-- STEP 8: CREATE HELPER FUNCTIONS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_startup_profiles_updated_at BEFORE UPDATE ON startup_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_startup_metrics_updated_at BEFORE UPDATE ON startup_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_comments_updated_at BEFORE UPDATE ON campaign_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_profiles_updated_at BEFORE UPDATE ON investor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_preferences_updated_at BEFORE UPDATE ON investor_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STEP 9: GRANT PERMISSIONS
-- ========================================

-- Grant all privileges to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant all privileges to anon users (for public access)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Grant all privileges to service_role (for admin operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- List all policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATABASE REBUILD COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'All tables created with:';
  RAISE NOTICE '- Proper UUID types';
  RAISE NOTICE '- snake_case naming';
  RAISE NOTICE '- Unrestricted RLS policies';
  RAISE NOTICE '- Foreign key constraints';
  RAISE NOTICE '- Indexes for performance';
  RAISE NOTICE '- Auto-update triggers';
  RAISE NOTICE '========================================';
END $$;
