-- Seed Mock Data SQL Script
-- Run this in Supabase SQL Editor to create test data

-- Note: You'll need to sign up users manually through the app first
-- This script creates the profile and campaign data for existing users

-- First, let's create some mock startup profiles
-- You'll need to replace the userId with actual user IDs after creating accounts

-- Example: After creating these accounts via signup:
-- 1. ai.analytics.pro@startup.test
-- 2. greentech.solutions@startup.test  
-- 3. healthtrack.ai@startup.test
-- 4. financeflow@startup.test
-- 5. edulearn.platform@startup.test
-- 6. investor.test@example.com

-- For demo purposes, let's insert data using a placeholder approach
-- You can update the userId fields after creating real accounts

BEGIN;

-- Insert mock campaigns (you'll need to create startup profiles first)
-- This is a template - run AFTER you have startup_profiles

-- Mock Campaign 1: AI Analytics Pro
INSERT INTO campaigns (
  "startupProfileId",
  title,
  "fundraisingGoal",
  "equityOffered",
  valuation,
  "minInvestment",
  "maxInvestment",
  status,
  "publishedAt",
  "currentRaised",
  "investorCount",
  "createdAt",
  "updatedAt"
)
SELECT 
  sp.id,
  'AI Analytics Pro - Revolutionizing Business Intelligence',
  500000,
  10,
  5000000,
  1000,
  50000,
  'published',
  NOW(),
  75000,
  8,
  NOW(),
  NOW()
FROM startup_profiles sp
WHERE sp."companyName" = 'AI Analytics Pro'
LIMIT 1;

-- Mock Campaign 2: GreenTech Solutions
INSERT INTO campaigns (
  "startupProfileId",
  title,
  "fundraisingGoal",
  "equityOffered",
  valuation,
  "minInvestment",
  "maxInvestment",
  status,
  "publishedAt",
  "currentRaised",
  "investorCount",
  "createdAt",
  "updatedAt"
)
SELECT 
  sp.id,
  'GreenTech Solutions - Sustainable Energy for Everyone',
  250000,
  15,
  1666667,
  500,
  25000,
  'published',
  NOW(),
  50000,
  12,
  NOW(),
  NOW()
FROM startup_profiles sp
WHERE sp."companyName" = 'GreenTech Solutions'
LIMIT 1;

-- Mock Campaign 3: HealthTrack AI
INSERT INTO campaigns (
  "startupProfileId",
  title,
  "fundraisingGoal",
  "equityOffered",
  valuation,
  "minInvestment",
  "maxInvestment",
  status,
  "publishedAt",
  "currentRaised",
  "investorCount",
  "createdAt",
  "updatedAt"
)
SELECT 
  sp.id,
  'HealthTrack AI - Your Personal Health Assistant',
  300000,
  12,
  2500000,
  1000,
  30000,
  'published',
  NOW(),
  90000,
  15,
  NOW(),
  NOW()
FROM startup_profiles sp
WHERE sp."companyName" = 'HealthTrack AI'
LIMIT 1;

-- Mock Campaign 4: FinanceFlow
INSERT INTO campaigns (
  "startupProfileId",
  title,
  "fundraisingGoal",
  "equityOffered",
  valuation,
  "minInvestment",
  "maxInvestment",
  status,
  "publishedAt",
  "currentRaised",
  "investorCount",
  "createdAt",
  "updatedAt"
)
SELECT 
  sp.id,
  'FinanceFlow - Smart Money Management Made Easy',
  150000,
  20,
  750000,
  250,
  15000,
  'published',
  NOW(),
  30000,
  6,
  NOW(),
  NOW()
FROM startup_profiles sp
WHERE sp."companyName" = 'FinanceFlow'
LIMIT 1;

-- Mock Campaign 5: EduLearn Platform
INSERT INTO campaigns (
  "startupProfileId",
  title,
  "fundraisingGoal",
  "equityOffered",
  valuation,
  "minInvestment",
  "maxInvestment",
  status,
  "publishedAt",
  "currentRaised",
  "investorCount",
  "createdAt",
  "updatedAt"
)
SELECT 
  sp.id,
  'EduLearn - Personalized Education for Every Student',
  750000,
  8,
  9375000,
  2000,
  100000,
  'published',
  NOW(),
  200000,
  20,
  NOW(),
  NOW()
FROM startup_profiles sp
WHERE sp."companyName" = 'EduLearn Platform'
LIMIT 1;

COMMIT;

-- To create investments, run this AFTER creating an investor profile:
-- Replace <investor_user_id> with the actual user ID

/*
BEGIN;

-- Create sample investments for investor
INSERT INTO investments ("userId", "campaignId", amount, status, "investedAt", shares)
SELECT 
  '<investor_user_id>',
  c.id,
  10000,
  'completed',
  NOW() - INTERVAL '10 days',
  1000
FROM campaigns c
WHERE c.title LIKE '%AI Analytics%'
LIMIT 1;

INSERT INTO investments ("userId", "campaignId", amount, status, "investedAt", shares)
SELECT 
  '<investor_user_id>',
  c.id,
  5000,
  'completed',
  NOW() - INTERVAL '5 days',
  500
FROM campaigns c
WHERE c.title LIKE '%GreenTech%'
LIMIT 1;

INSERT INTO investments ("userId", "campaignId", amount, status, "investedAt", shares)
SELECT 
  '<investor_user_id>',
  c.id,
  15000,
  'completed',
  NOW() - INTERVAL '3 days',
  1500
FROM campaigns c
WHERE c.title LIKE '%HealthTrack%'
LIMIT 1;

COMMIT;
*/

-- Verification queries
SELECT 'Campaigns created:' as status, COUNT(*) as count FROM campaigns WHERE status = 'published';
SELECT 'Total funding goal:' as status, SUM("fundraisingGoal") as total FROM campaigns WHERE status = 'published';
SELECT 'Total raised:' as status, SUM("currentRaised") as total FROM campaigns WHERE status = 'published';
