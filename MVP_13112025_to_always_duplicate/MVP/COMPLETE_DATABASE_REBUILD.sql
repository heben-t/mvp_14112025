-- ============================================================================
-- HEBED AI - COMPLETE DATABASE REBUILD SCRIPT
-- ============================================================================
-- Purpose: Clean slate database schema for MVP
-- Date: 2025-11-08
-- Features: All MVP features, snake_case, complete RLS (unrestricted for MVP)
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL EXISTING TABLES
-- ============================================================================

-- Drop tables in correct order (FK dependencies)
DROP TABLE IF EXISTS campaign_comments CASCADE;
DROP TABLE IF EXISTS campaign_followers CASCADE;
DROP TABLE IF EXISTS watchlists CASCADE;
DROP TABLE IF EXISTS watchlist CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS startup_metrics CASCADE;
DROP TABLE IF EXISTS metrics CASCADE;
DROP TABLE IF EXISTS investor_preferences CASCADE;
DROP TABLE IF EXISTS investor_profiles CASCADE;
DROP TABLE IF EXISTS startup_profiles CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS time_series_data CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS benchmarks CASCADE;
DROP TABLE IF EXISTS portfolio_companies CASCADE;
DROP TABLE IF EXISTS operations CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;

-- Drop types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS verification_status CASCADE;
DROP TYPE IF EXISTS investment_status CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS data_verification_level CASCADE;

-- ============================================================================
-- STEP 2: CREATE ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('STARTUP', 'INVESTOR', 'ADMIN');
CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE investment_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');
CREATE TYPE subscription_tier AS ENUM ('STARTUP_BASIC', 'INVESTOR_BASIC', 'STARTUP_PRO', 'INVESTOR_PRO');
CREATE TYPE data_verification_level AS ENUM ('VERIFIED', 'PARTIALLY_VERIFIED', 'SELF_REPORTED');

-- ============================================================================
-- STEP 3: CORE TABLES
-- ============================================================================

-- Users table (Supabase Auth compatible)
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  role user_role DEFAULT 'INVESTOR',
  name TEXT,
  email_verified TIMESTAMP WITH TIME ZONE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auth accounts (OAuth)
CREATE TABLE accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

-- Sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Verification tokens
CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(identifier, token)
);

-- ============================================================================
-- STEP 4: PROFILE TABLES
-- ============================================================================

-- Startup profiles (updated per content_mvp2.txt)
CREATE TABLE startup_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  logo TEXT,
  industry TEXT NOT NULL,
  stage TEXT NOT NULL,
  description TEXT,
  website TEXT,
  geographic_presence TEXT, -- 'Based in the UAE' | 'Expanding into the UAE'
  data_migration_method TEXT CHECK (data_migration_method IN ('plugin', 'manual')),
  kyc_status verification_status DEFAULT 'PENDING',
  business_license TEXT,
  founder_id_document TEXT,
  profile_completion_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investor profiles (updated per content_mvp2.txt)
CREATE TABLE investor_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Step 1: Investor Profile
  investor_type TEXT, -- 'Individual Investor' | 'Angel Investor' | 'VC Partner' | 'Family Office'
  investment_types JSONB, -- Array of: 'Equity' | 'Convertible Note / SAFE' | 'Crowdfunding participation' | 'Strategic / Advisory'
  ticket_range TEXT, -- '≤$50k' | '$50k–$250k' | '$250k–$1M' | '$1M+'
  
  -- Step 2: Investment Preferences
  investment_stages JSONB, -- Array of: 'Pre-Seed' | 'Seed'
  sector_focus JSONB, -- Array of industries + optional "Other" text
  geo_focus JSONB DEFAULT '["UAE"]'::jsonb, -- Array, UAE pre-checked
  roi_priorities JSONB, -- Array of: 'Financial' | 'Operational' | 'Innovation' | 'Social/Sustainability'
  
  -- Step 3: Visibility & Notices
  profile_visibility TEXT DEFAULT 'visible', -- 'visible' | 'after_interest'
  is_accredited BOOLEAN DEFAULT FALSE,
  
  -- Legacy fields (keep for backwards compatibility)
  professional_title TEXT,
  investment_focus TEXT,
  ticket_size TEXT,
  accreditation_status verification_status DEFAULT 'PENDING',
  accreditation_document TEXT,
  
  -- Stripe integration
  stripe_customer_id TEXT,
  stripe_account_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 5: CAMPAIGN TABLES
-- ============================================================================

-- Campaigns
CREATE TABLE campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  startup_profile_id TEXT NOT NULL REFERENCES startup_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  vsl_url TEXT,
  pitch_deck TEXT,
  fundraising_goal DECIMAL(15, 2) NOT NULL,
  current_raised DECIMAL(15, 2) DEFAULT 0,
  equity_offered DECIMAL(5, 2) NOT NULL,
  valuation DECIMAL(15, 2),
  min_investment DECIMAL(15, 2) DEFAULT 1000,
  max_investment DECIMAL(15, 2),
  status TEXT DEFAULT 'draft', -- draft, active, closed, funded
  published_at TIMESTAMP WITH TIME ZONE,
  closes_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  interested_investors INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 6: SOCIAL FEATURES (per content_mvp2.txt)
-- ============================================================================

-- Campaign comments
CREATE TABLE campaign_comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign followers
CREATE TABLE campaign_followers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

-- ============================================================================
-- STEP 7: INVESTMENT TABLES
-- ============================================================================

-- Investments
CREATE TABLE investments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  investor_profile_id TEXT NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  status investment_status DEFAULT 'PENDING',
  stripe_payment_intent_id TEXT,
  escrow_released BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlists
CREATE TABLE watchlists (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  investor_profile_id TEXT NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  alert_on_metric_change BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(investor_profile_id, campaign_id)
);

-- ============================================================================
-- STEP 8: METRICS TABLES
-- ============================================================================

-- Startup metrics (comprehensive metrics per content_mvp2.txt)
CREATE TABLE startup_metrics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  startup_profile_id TEXT NOT NULL REFERENCES startup_profiles(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- YYYY-MM format
  
  -- Finance metrics
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
  
  -- Industry metrics
  active_users_now INTEGER,
  active_users_prev INTEGER,
  engagement_rate DECIMAL(5, 2),
  returning_users INTEGER,
  
  -- Technology metrics (answered manually)
  use_of_ai TEXT, -- 'HR' | 'FINANCE' | 'LAW' | 'COMPLIANCE' | 'ALL' | 'OPERATIONS' | 'OTHER'
  ai_improves_most TEXT, -- 'Speed/Productivity' | 'Accuracy' | 'Cost Reduction' | 'Decision-Making'
  ai_model_production TEXT, -- 'Yes' | 'No'
  
  -- Community & Engagement (Social)
  followers_count INTEGER,
  team_years_experience INTEGER,
  mentions_count INTEGER, -- funded / incubated / featured
  
  -- Verification
  verification_level data_verification_level DEFAULT 'SELF_REPORTED',
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(startup_profile_id, period)
);

-- ============================================================================
-- STEP 9: SUBSCRIPTION TABLES
-- ============================================================================

-- Subscriptions
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  stripe_current_period_end TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 10: SUPPORT TABLES
-- ============================================================================

-- Investor preferences (legacy support)
CREATE TABLE investor_preferences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  investor_profile_id TEXT UNIQUE NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
  min_roi_threshold DECIMAL(5, 2),
  preferred_stages TEXT,
  sector_filters TEXT,
  geographic_preferences TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 11: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Accounts
CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- Sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);

-- Startup profiles
CREATE INDEX idx_startup_profiles_user_id ON startup_profiles(user_id);
CREATE INDEX idx_startup_profiles_industry ON startup_profiles(industry);
CREATE INDEX idx_startup_profiles_stage ON startup_profiles(stage);

-- Investor profiles
CREATE INDEX idx_investor_profiles_user_id ON investor_profiles(user_id);

-- Campaigns
CREATE INDEX idx_campaigns_startup_id ON campaigns(startup_profile_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_published_at ON campaigns(published_at);

-- Investments
CREATE INDEX idx_investments_campaign_id ON investments(campaign_id);
CREATE INDEX idx_investments_investor_id ON investments(investor_profile_id);
CREATE INDEX idx_investments_status ON investments(status);

-- Watchlists
CREATE INDEX idx_watchlists_investor_id ON watchlists(investor_profile_id);
CREATE INDEX idx_watchlists_campaign_id ON watchlists(campaign_id);

-- Startup metrics
CREATE INDEX idx_startup_metrics_startup_id ON startup_metrics(startup_profile_id);
CREATE INDEX idx_startup_metrics_period ON startup_metrics(period);

-- Comments & Followers
CREATE INDEX idx_comments_campaign_id ON campaign_comments(campaign_id);
CREATE INDEX idx_comments_user_id ON campaign_comments(user_id);
CREATE INDEX idx_followers_campaign_id ON campaign_followers(campaign_id);
CREATE INDEX idx_followers_user_id ON campaign_followers(user_id);

-- ============================================================================
-- STEP 12: ENABLE ROW LEVEL SECURITY (UNRESTRICTED FOR MVP)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- UNRESTRICTED RLS POLICIES (MVP - ALLOW ALL FOR AUTHENTICATED USERS)
-- ============================================================================

-- Users
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Accounts
CREATE POLICY "Allow all for accounts" ON accounts FOR ALL USING (true) WITH CHECK (true);

-- Sessions
CREATE POLICY "Allow all for sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);

-- Startup profiles
CREATE POLICY "Allow all for startup_profiles" ON startup_profiles FOR ALL USING (true) WITH CHECK (true);

-- Investor profiles
CREATE POLICY "Allow all for investor_profiles" ON investor_profiles FOR ALL USING (true) WITH CHECK (true);

-- Campaigns
CREATE POLICY "Allow all for campaigns" ON campaigns FOR ALL USING (true) WITH CHECK (true);

-- Investments
CREATE POLICY "Allow all for investments" ON investments FOR ALL USING (true) WITH CHECK (true);

-- Watchlists
CREATE POLICY "Allow all for watchlists" ON watchlists FOR ALL USING (true) WITH CHECK (true);

-- Startup metrics
CREATE POLICY "Allow all for startup_metrics" ON startup_metrics FOR ALL USING (true) WITH CHECK (true);

-- Comments
CREATE POLICY "Allow all for campaign_comments" ON campaign_comments FOR ALL USING (true) WITH CHECK (true);

-- Followers
CREATE POLICY "Allow all for campaign_followers" ON campaign_followers FOR ALL USING (true) WITH CHECK (true);

-- Subscriptions
CREATE POLICY "Allow all for subscriptions" ON subscriptions FOR ALL USING (true) WITH CHECK (true);

-- Investor preferences
CREATE POLICY "Allow all for investor_preferences" ON investor_preferences FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- STEP 13: CREATE UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_startup_profiles_updated_at BEFORE UPDATE ON startup_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_profiles_updated_at BEFORE UPDATE ON investor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_startup_metrics_updated_at BEFORE UPDATE ON startup_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_comments_updated_at BEFORE UPDATE ON campaign_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_preferences_updated_at BEFORE UPDATE ON investor_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 14: GRANT PERMISSIONS
-- ============================================================================

-- Grant all permissions to authenticated users (unrestricted for MVP)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant read to anon for public discovery
GRANT SELECT ON campaigns TO anon;
GRANT SELECT ON startup_profiles TO anon;
GRANT SELECT ON startup_metrics TO anon;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check all indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'HEBED AI DATABASE REBUILD COMPLETE!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Tables created: All core MVP tables';
  RAISE NOTICE 'RLS: Enabled with unrestricted policies';
  RAISE NOTICE 'Naming: snake_case throughout';
  RAISE NOTICE 'Features: Onboarding, Campaigns, Investments, Social, Metrics';
  RAISE NOTICE 'Next step: Update Prisma schema and run prisma db pull';
  RAISE NOTICE '============================================================';
END $$;
