-- DROP ALL TABLES SCRIPT
-- WARNING: This will delete ALL data and tables in your database
-- Use this to clean up before running the new migration

-- Drop all tables (CASCADE removes foreign key dependencies)
DROP TABLE IF EXISTS "benchmarks" CASCADE;
DROP TABLE IF EXISTS "alerts" CASCADE;
DROP TABLE IF EXISTS "operations" CASCADE;
DROP TABLE IF EXISTS "time_series_data" CASCADE;
DROP TABLE IF EXISTS "portfolio_companies" CASCADE;
DROP TABLE IF EXISTS "startup_metrics" CASCADE;
DROP TABLE IF EXISTS "watchlists" CASCADE;
DROP TABLE IF EXISTS "investments" CASCADE;
DROP TABLE IF EXISTS "campaigns" CASCADE;
DROP TABLE IF EXISTS "subscriptions" CASCADE;
DROP TABLE IF EXISTS "investor_preferences" CASCADE;
DROP TABLE IF EXISTS "investor_profiles" CASCADE;
DROP TABLE IF EXISTS "startup_profiles" CASCADE;
DROP TABLE IF EXISTS "verification_tokens" CASCADE;
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "accounts" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop legacy tables (if they exist from earlier testing)
DROP TABLE IF EXISTS "user_profiles" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
DROP TABLE IF EXISTS "StartupProfile" CASCADE;
DROP TABLE IF EXISTS "InvestorProfile" CASCADE;
DROP TABLE IF EXISTS "InvestorPreferences" CASCADE;
DROP TABLE IF EXISTS "Subscription" CASCADE;
DROP TABLE IF EXISTS "Campaign" CASCADE;
DROP TABLE IF EXISTS "Investment" CASCADE;
DROP TABLE IF EXISTS "Watchlist" CASCADE;
DROP TABLE IF EXISTS "StartupMetrics" CASCADE;
DROP TABLE IF EXISTS "PortfolioCompany" CASCADE;
DROP TABLE IF EXISTS "TimeSeriesData" CASCADE;
DROP TABLE IF EXISTS "Operation" CASCADE;
DROP TABLE IF EXISTS "Alert" CASCADE;
DROP TABLE IF EXISTS "Benchmark" CASCADE;

-- Drop all enums
DROP TYPE IF EXISTS "DataVerificationLevel" CASCADE;
DROP TYPE IF EXISTS "SubscriptionTier" CASCADE;
DROP TYPE IF EXISTS "InvestmentStatus" CASCADE;
DROP TYPE IF EXISTS "VerificationStatus" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;

-- Verify all tables are dropped
-- Run this query to see if any tables remain:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
