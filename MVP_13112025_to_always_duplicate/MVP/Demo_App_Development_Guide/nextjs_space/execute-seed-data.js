/**
 * Execute Seed Data Script
 * Creates startup profiles and campaigns directly
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const mockData = [
  {
    userId: '00000000-0000-0000-0000-000000000001', // Placeholder
    companyName: 'AI Analytics Pro',
    industry: 'Artificial Intelligence',
    description: 'Advanced AI-powered business analytics platform helping companies make data-driven decisions with real-time insights.',
    fundingStage: 'Series A',
    campaign: {
      title: 'AI Analytics Pro - Revolutionizing Business Intelligence',
      fundraisingGoal: 500000,
      equityOffered: 10,
      valuation: 5000000,
      minInvestment: 1000,
      maxInvestment: 50000,
      currentRaised: 75000,
      investorCount: 8
    }
  },
  {
    userId: '00000000-0000-0000-0000-000000000002',
    companyName: 'GreenTech Solutions',
    industry: 'Clean Energy',
    description: 'Solar panel installation and maintenance service using AI-powered efficiency optimization.',
    fundingStage: 'Seed',
    campaign: {
      title: 'GreenTech Solutions - Sustainable Energy for Everyone',
      fundraisingGoal: 250000,
      equityOffered: 15,
      valuation: 1666667,
      minInvestment: 500,
      maxInvestment: 25000,
      currentRaised: 50000,
      investorCount: 12
    }
  },
  {
    userId: '00000000-0000-0000-0000-000000000003',
    companyName: 'HealthTrack AI',
    industry: 'HealthTech',
    description: 'Personal health monitoring app with AI-powered diagnostics and recommendations.',
    fundingStage: 'Seed',
    campaign: {
      title: 'HealthTrack AI - Your Personal Health Assistant',
      fundraisingGoal: 300000,
      equityOffered: 12,
      valuation: 2500000,
      minInvestment: 1000,
      maxInvestment: 30000,
      currentRaised: 90000,
      investorCount: 15
    }
  },
  {
    userId: '00000000-0000-0000-0000-000000000004',
    companyName: 'FinanceFlow',
    industry: 'FinTech',
    description: 'Automated financial planning and investment platform for millennials and Gen Z.',
    fundingStage: 'Pre-Seed',
    campaign: {
      title: 'FinanceFlow - Smart Money Management Made Easy',
      fundraisingGoal: 150000,
      equityOffered: 20,
      valuation: 750000,
      minInvestment: 250,
      maxInvestment: 15000,
      currentRaised: 30000,
      investorCount: 6
    }
  },
  {
    userId: '00000000-0000-0000-0000-000000000005',
    companyName: 'EduLearn Platform',
    industry: 'EdTech',
    description: 'Interactive online learning platform with AI-personalized curriculum.',
    fundingStage: 'Series A',
    campaign: {
      title: 'EduLearn - Personalized Education for Every Student',
      fundraisingGoal: 750000,
      equityOffered: 8,
      valuation: 9375000,
      minInvestment: 2000,
      maxInvestment: 100000,
      currentRaised: 200000,
      investorCount: 20
    }
  }
];

async function checkExistingData() {
  console.log('🔍 Checking existing data...\n');
  
  const { data: profiles, error: profileError } = await supabase
    .from('startup_profiles')
    .select('id, company_name')
    .limit(10);
  
  if (profileError) {
    console.log('⚠️  Could not check startup_profiles:', profileError.message);
    return [];
  }
  
  console.log(`Found ${profiles.length} existing startup profiles`);
  profiles.forEach(p => console.log(`   - ${p.company_name}`));
  console.log('');
  
  return profiles;
}

async function createStartupProfile(data) {
  console.log(`🏢 Creating startup: ${data.companyName}...`);
  
  try {
    // Check if already exists
    const { data: existing } = await supabase
      .from('startup_profiles')
      .select('id')
      .eq('company_name', data.companyName)
      .single();
    
    if (existing) {
      console.log(`   ℹ️  Already exists, using existing profile: ${existing.id}\n`);
      return existing.id;
    }
    
    // Create new profile
    const { data: profile, error } = await supabase
      .from('startup_profiles')
      .insert({
        user_id: data.userId,
        company_name: data.companyName,
        industry: data.industry,
        stage: data.fundingStage,
        description: data.description,
        website: `https://${data.companyName.toLowerCase().replace(/\s+/g, '')}.com`
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`   ✅ Created profile: ${profile.id}\n`);
    return profile.id;
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return null;
  }
}

async function createCampaign(startupProfileId, campaignData, companyName) {
  console.log(`📢 Creating campaign: ${campaignData.title.substring(0, 50)}...`);
  
  try {
    // Check if already exists
    const { data: existing } = await supabase
      .from('campaigns')
      .select('id')
      .eq('startup_profile_id', startupProfileId)
      .eq('title', campaignData.title)
      .single();
    
    if (existing) {
      console.log(`   ℹ️  Campaign already exists: ${existing.id}\n`);
      return existing;
    }
    
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        startup_profile_id: startupProfileId,
        title: campaignData.title,
        vsl_url: null,
        pitch_deck: null,
        fundraising_goal: campaignData.fundraisingGoal,
        equity_offered: campaignData.equityOffered,
        valuation: campaignData.valuation,
        min_investment: campaignData.minInvestment,
        max_investment: campaignData.maxInvestment,
        status: 'published',
        published_at: new Date()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`   ✅ Created campaign: ${campaign.id}`);
    console.log(`   💰 Goal: $${campaign.fundraising_goal.toLocaleString()}\n`);
    return campaign;
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return null;
  }
}

async function verifyCampaigns() {
  console.log('📊 Verifying created campaigns...\n');
  
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      fundraising_goal,
      current_raised,
      status,
      startup_profiles (company_name)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.log('❌ Could not fetch campaigns:', error.message);
    return;
  }
  
  console.log(`✅ Found ${campaigns.length} published campaigns:\n`);
  campaigns.forEach(c => {
    const company = c.startup_profiles?.company_name || 'Unknown';
    const goal = c.fundraising_goal.toLocaleString();
    console.log(`   • ${company}: Goal $${goal}`);
  });
  console.log('');
}

async function main() {
  console.clear();
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║            EXECUTE SEED DATA SCRIPT                       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  // Check existing data
  await checkExistingData();
  
  console.log('═'.repeat(60) + '\n');
  console.log('Creating startup profiles and campaigns...\n');
  
  let successCount = 0;
  
  for (const item of mockData) {
    const profileId = await createStartupProfile(item);
    
    if (profileId) {
      const campaign = await createCampaign(profileId, item.campaign, item.companyName);
      if (campaign) {
        successCount++;
      }
    }
  }
  
  console.log('═'.repeat(60) + '\n');
  
  await verifyCampaigns();
  
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ COMPLETE!                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  console.log(`📊 Summary:`);
  console.log(`   ✅ Campaigns created: ${successCount}/5`);
  console.log('');
  console.log('🎯 Next Steps:');
  console.log('   1. Go to: http://localhost:3001/discover');
  console.log('   2. You should see the campaigns listed');
  console.log('   3. Sign in as investor to test portfolio');
  console.log('');
}

main().catch(console.error);
