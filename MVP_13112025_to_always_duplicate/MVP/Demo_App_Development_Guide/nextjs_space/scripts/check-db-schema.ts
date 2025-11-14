import { getServiceRoleClient } from '../lib/supabase.js';

const supabase = getServiceRoleClient();

async function main() {
  console.log('🔍 Checking database schema...\n');

  // Check if campaigns table exists and get its structure
  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .select('*')
    .limit(1);

  console.log('Campaigns table:', {
    error: campaignsError,
    sampleData: campaigns,
  });

  // Check startup_profiles
  const { data: startupProfiles, error: startupError } = await supabase
    .from('startup_profiles')
    .select('*')
    .limit(1);

  console.log('\nStartup Profiles table:', {
    error: startupError,
    sampleData: startupProfiles,
  });

  // Check investor_profiles
  const { data: investorProfiles, error: investorError } = await supabase
    .from('investor_profiles')
    .select('*')
    .limit(1);

  console.log('\nInvestor Profiles table:', {
    error: investorError,
    sampleData: investorProfiles,
  });

  // Try to query with relationships
  const { data: campaignsWithRelations, error: relError } = await supabase
    .from('campaigns')
    .select(`
      *,
      startup_profiles (*)
    `)
    .limit(1);

  console.log('\nCampaigns with relations:', {
    error: relError,
    data: campaignsWithRelations,
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });
