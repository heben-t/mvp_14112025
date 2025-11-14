-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('STARTUP', 'INVESTOR', 'ADMIN');
CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE investment_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');
CREATE TYPE subscription_tier AS ENUM ('STARTUP_BASIC', 'INVESTOR_BASIC');
CREATE TYPE data_verification_level AS ENUM ('VERIFIED', 'PARTIALLY_VERIFIED', 'SELF_REPORTED');

-- Create user_profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,
  name TEXT,
  email_verified TIMESTAMP WITH TIME ZONE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create startup_profiles table
CREATE TABLE IF NOT EXISTS public.startup_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  logo TEXT,
  industry TEXT NOT NULL,
  stage TEXT NOT NULL,
  description TEXT,
  website TEXT,
  kyc_status verification_status DEFAULT 'PENDING',
  business_license TEXT,
  founder_id_document TEXT,
  profile_completion_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investor_profiles table
CREATE TABLE IF NOT EXISTS public.investor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  professional_title TEXT,
  investment_focus TEXT,
  ticket_size TEXT,
  accreditation_status verification_status DEFAULT 'PENDING',
  accreditation_document TEXT,
  stripe_customer_id TEXT,
  stripe_account_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investor_preferences table
CREATE TABLE IF NOT EXISTS public.investor_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_profile_id UUID UNIQUE NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  min_roi_threshold DOUBLE PRECISION,
  preferred_stages TEXT,
  sector_filters TEXT,
  geographic_preferences TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  stripe_current_period_end TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_profile_id UUID NOT NULL REFERENCES public.startup_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  vsl_url TEXT,
  pitch_deck TEXT,
  fundraising_goal DOUBLE PRECISION NOT NULL,
  current_raised DOUBLE PRECISION DEFAULT 0,
  equity_offered DOUBLE PRECISION NOT NULL,
  valuation DOUBLE PRECISION NOT NULL,
  min_investment DOUBLE PRECISION DEFAULT 1000,
  max_investment DOUBLE PRECISION,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  interested_investors INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investments table
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  investor_profile_id UUID NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  amount DOUBLE PRECISION NOT NULL,
  status investment_status DEFAULT 'PENDING',
  stripe_payment_intent_id TEXT,
  escrow_released BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_profile_id UUID NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL,
  alert_on_metric_change BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(investor_profile_id, campaign_id)
);

-- Create startup_metrics table
CREATE TABLE IF NOT EXISTS public.startup_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_profile_id UUID REFERENCES public.startup_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  verification_level data_verification_level DEFAULT 'SELF_REPORTED',
  last_synced_at TIMESTAMP WITH TIME ZONE,
  data_source TEXT,
  current_roi DOUBLE PRECISION NOT NULL,
  roi_trend DOUBLE PRECISION NOT NULL,
  cost_savings DOUBLE PRECISION NOT NULL,
  labor_cost_reduction DOUBLE PRECISION NOT NULL,
  error_reduction DOUBLE PRECISION NOT NULL,
  process_optimization DOUBLE PRECISION NOT NULL,
  hours_saved DOUBLE PRECISION NOT NULL,
  employees_freed DOUBLE PRECISION NOT NULL,
  adoption_rate DOUBLE PRECISION NOT NULL,
  active_users INTEGER NOT NULL,
  total_users INTEGER NOT NULL,
  ai_interactions INTEGER NOT NULL,
  fallback_rate DOUBLE PRECISION NOT NULL,
  processing_speed DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION NOT NULL,
  cost_per_operation DOUBLE PRECISION NOT NULL,
  uptime DOUBLE PRECISION NOT NULL,
  valuation_impact DOUBLE PRECISION NOT NULL,
  forecasted_roi DOUBLE PRECISION NOT NULL,
  forecasted_savings DOUBLE PRECISION NOT NULL,
  forecasted_hires INTEGER NOT NULL,
  mrr DOUBLE PRECISION,
  arr DOUBLE PRECISION,
  cac DOUBLE PRECISION,
  ltv DOUBLE PRECISION,
  churn_rate DOUBLE PRECISION,
  burn_rate DOUBLE PRECISION,
  runway INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolio_companies table
CREATE TABLE IF NOT EXISTS public.portfolio_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  roi DOUBLE PRECISION NOT NULL,
  adoption_rate DOUBLE PRECISION NOT NULL,
  efficiency INTEGER NOT NULL,
  trend TEXT NOT NULL,
  trend_value INTEGER NOT NULL,
  category TEXT NOT NULL,
  investment DOUBLE PRECISION NOT NULL,
  current_value DOUBLE PRECISION NOT NULL,
  multiple DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL,
  ai_implementation TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  burn_rate DOUBLE PRECISION NOT NULL,
  ai_savings DOUBLE PRECISION NOT NULL,
  technical_score INTEGER NOT NULL,
  success_probability DOUBLE PRECISION NOT NULL,
  series_stage TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_series_data table
CREATE TABLE IF NOT EXISTS public.time_series_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  week INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create operations table
CREATE TABLE IF NOT EXISTS public.operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  time_before DOUBLE PRECISION NOT NULL,
  time_after DOUBLE PRECISION NOT NULL,
  cost_before DOUBLE PRECISION NOT NULL,
  cost_after DOUBLE PRECISION NOT NULL,
  csat_before DOUBLE PRECISION NOT NULL,
  csat_after DOUBLE PRECISION NOT NULL,
  volume_before INTEGER NOT NULL,
  volume_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.portfolio_companies(id) ON DELETE CASCADE,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_required BOOLEAN NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create benchmarks table
CREATE TABLE IF NOT EXISTS public.benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.portfolio_companies(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  portfolio_value DOUBLE PRECISION NOT NULL,
  gcc_average DOUBLE PRECISION NOT NULL,
  global_top10 DOUBLE PRECISION NOT NULL,
  metric_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_startup_profiles_user_id ON public.startup_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_user_id ON public.investor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_startup_profile_id ON public.campaigns(startup_profile_id);
CREATE INDEX IF NOT EXISTS idx_investments_campaign_id ON public.investments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_investments_investor_profile_id ON public.investments(investor_profile_id);
CREATE INDEX IF NOT EXISTS idx_startup_metrics_startup_profile_id ON public.startup_metrics(startup_profile_id);
CREATE INDEX IF NOT EXISTS idx_time_series_data_entity_id ON public.time_series_data(entity_id);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for startup_profiles
CREATE POLICY "Users can view their own startup profile" ON public.startup_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own startup profile" ON public.startup_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for investor_profiles
CREATE POLICY "Users can view their own investor profile" ON public.investor_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own investor profile" ON public.investor_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for campaigns (startups can manage their own, investors can view all)
CREATE POLICY "Startups can manage their own campaigns" ON public.campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.startup_profiles
      WHERE startup_profiles.id = campaigns.startup_profile_id
      AND startup_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view published campaigns" ON public.campaigns
  FOR SELECT USING (status = 'published' OR status = 'active');

-- Create RLS policies for investments
CREATE POLICY "Investors can view their own investments" ON public.investments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.investor_profiles
      WHERE investor_profiles.id = investments.investor_profile_id
      AND investor_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Investors can create investments" ON public.investments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.investor_profiles
      WHERE investor_profiles.id = investments.investor_profile_id
      AND investor_profiles.user_id = auth.uid()
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_startup_profiles_updated_at BEFORE UPDATE ON public.startup_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_profiles_updated_at BEFORE UPDATE ON public.investor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user_profiles on auth.users insert
-- This is optional and can be used if you want automatic profile creation
-- Note: In the registration route, we're manually creating profiles with role info
-- But this trigger ensures a basic profile exists even for other sign-up methods
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'INVESTOR')::user_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
