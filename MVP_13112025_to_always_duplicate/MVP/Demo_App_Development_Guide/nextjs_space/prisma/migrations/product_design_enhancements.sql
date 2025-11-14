-- Product Design Enhancements - New Tables and Columns
-- Date: 2025-11-03

-- 1. Watchlist Folders Table
CREATE TABLE IF NOT EXISTS watchlist_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_profile_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20),
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Campaign Analytics Table
CREATE TABLE IF NOT EXISTS campaign_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    watchlist_adds INTEGER DEFAULT 0,
    pitch_deck_views INTEGER DEFAULT 0,
    video_plays INTEGER DEFAULT 0,
    website_clicks INTEGER DEFAULT 0,
    average_time_on_page INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, date)
);

-- 3. Saved Searches Table
CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_profile_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    search_criteria JSONB NOT NULL,
    notification_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Campaign Templates Table
CREATE TABLE IF NOT EXISTS campaign_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    industry VARCHAR(100),
    description TEXT,
    title_template TEXT,
    description_template TEXT,
    avg_raised_amount DECIMAL(15, 2),
    success_rate DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Investment Calculator History
CREATE TABLE IF NOT EXISTS investment_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_profile_id UUID REFERENCES investor_profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    investment_amount DECIMAL(15, 2) NOT NULL,
    equity_percentage DECIMAL(5, 2) NOT NULL,
    valuation DECIMAL(15, 2) NOT NULL,
    conservative_exit DECIMAL(15, 2),
    expected_exit DECIMAL(15, 2),
    optimistic_exit DECIMAL(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Campaign Questions/Q&A Table
CREATE TABLE IF NOT EXISTS campaign_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    investor_profile_id UUID REFERENCES investor_profiles(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    answered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Add new columns to existing campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS completeness_score INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES campaign_templates(id) ON DELETE SET NULL;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS video_thumbnail VARCHAR(500);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE;

-- 8. Add new columns to watchlists table
ALTER TABLE watchlists ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES watchlist_folders(id) ON DELETE SET NULL;
ALTER TABLE watchlists ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE watchlists ADD COLUMN IF NOT EXISTS reminder_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE watchlists ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';

-- 9. Add analytics columns to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS total_pitch_deck_downloads INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS total_video_plays INTEGER DEFAULT 0;

-- 10. CSV Upload History Table
CREATE TABLE IF NOT EXISTS csv_upload_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_profile_id UUID NOT NULL REFERENCES startup_profiles(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    rows_imported INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Plugin Integration Settings Table
CREATE TABLE IF NOT EXISTS plugin_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_profile_id UUID NOT NULL REFERENCES startup_profiles(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    is_connected BOOLEAN DEFAULT FALSE,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency VARCHAR(20) DEFAULT 'daily',
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(startup_profile_id, provider)
);

-- 12. Campaign Updates/News Table
CREATE TABLE IF NOT EXISTS campaign_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_milestone BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Investment Activity Feed
CREATE TABLE IF NOT EXISTS investment_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2),
    investor_name VARCHAR(100),
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign ON campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_date ON campaign_analytics(date);
CREATE INDEX IF NOT EXISTS idx_watchlist_folders_investor ON watchlist_folders(investor_profile_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_investor ON saved_searches(investor_profile_id);
CREATE INDEX IF NOT EXISTS idx_campaign_questions_campaign ON campaign_questions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_updates_campaign ON campaign_updates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_investment_activity_campaign ON investment_activity(campaign_id);
CREATE INDEX IF NOT EXISTS idx_plugin_integrations_startup ON plugin_integrations(startup_profile_id);

-- Insert some default campaign templates
INSERT INTO campaign_templates (name, industry, description, title_template, description_template, avg_raised_amount, success_rate)
VALUES 
    ('AI/ML Startup', 'AI/ML', 'Template for AI and Machine Learning startups', 
     'AI-Powered [Product Name] - Revolutionizing [Industry]',
     'We are building an AI-powered solution that [key benefit]. Our technology leverages [technology stack] to deliver [value proposition]. With proven traction of [metrics], we are raising [amount] to [use of funds].',
     2000000, 65.5),
    ('FinTech Startup', 'FinTech', 'Template for Financial Technology startups',
     '[Product Name] - The Future of [Financial Service]',
     'We are transforming [financial service] through innovative technology. Our platform enables [key feature] and has already helped [customer count] users [benefit]. Join us in disrupting the [market size] market.',
     1500000, 58.3),
    ('HealthTech Startup', 'HealthTech', 'Template for Healthcare Technology startups',
     'Improving Healthcare with [Product Name]',
     'Our healthcare solution addresses [problem] by providing [solution]. With partnerships with [partners] and [user metrics], we are positioned to capture the $[market size] healthcare technology market.',
     1800000, 62.1);

COMMENT ON TABLE watchlist_folders IS 'Folders for organizing investor watchlists';
COMMENT ON TABLE campaign_analytics IS 'Daily analytics tracking for campaigns';
COMMENT ON TABLE saved_searches IS 'Saved search criteria and alerts for investors';
COMMENT ON TABLE campaign_templates IS 'Pre-built campaign templates by industry';
COMMENT ON TABLE investment_calculations IS 'History of investment calculator usage';
COMMENT ON TABLE campaign_questions IS 'Q&A between investors and startups';
COMMENT ON TABLE campaign_updates IS 'News and milestone updates for campaigns';
COMMENT ON TABLE investment_activity IS 'Public feed of investment activity';
COMMENT ON TABLE plugin_integrations IS 'Third-party integrations (Stripe, QuickBooks, etc)';
