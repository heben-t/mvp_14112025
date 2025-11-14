-- Add campaign_objective column to campaigns table
-- This migration adds the campaign_objective field to store the fundraising campaign objective

-- Add the column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS campaign_objective VARCHAR(500);

-- Add comment for documentation
COMMENT ON COLUMN campaigns.campaign_objective IS 'The primary objective/goal of the fundraising campaign';

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'campaigns' AND column_name = 'campaign_objective';
