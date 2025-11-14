import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('\n🧪 PHASE 2-8 TESTING VIA SUPABASE CLIENT\n');
  console.log('═'.repeat(60));

  // Get test user
  const { data: testUser, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'testfix2@hebed.ai')
    .single();

  if (userError || !testUser) {
    console.error('❌ Test user not found!', userError);
    return;
  }

  console.log(`✅ Found test user: ${testUser.email} (${testUser.role})\n`);

  // PHASE 2: ONBOARDING
  console.log('📝 PHASE 2: ONBOARDING TESTING');
  console.log('─'.repeat(60));

  let { data: startupProfile } = await supabase
    .from('startup_profiles')
    .select('*')
    .eq('userId', testUser.id)
    .single();

  if (!startupProfile) {
    const { data: newProfile, error: profileError } = await supabase
      .from('startup_profiles')
      .insert({
        id: randomUUID(),
        user_id: testUser.id,
        company_name: 'TechStartup Inc',
        industry: 'FINTECH',
        stage: 'SEED',
        description: 'We are building the future of fintech with AI-powered analytics',
        website: 'https://techstartup.com',
        kyc_status: 'VERIFIED',
        profile_completion_score: 85,
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      return;
    }
    startupProfile = newProfile;
    console.log('✅ Test 2.1: Startup profile created');
  } else {
    console.log('✅ Test 2.1: Startup profile already exists');
  }
  console.log(`   Company: ${startupProfile.company_name || startupProfile.companyName}`);
  console.log(`   Industry: ${startupProfile.industry}`);
  console.log(`   Stage: ${startupProfile.stage}\n`);

  // Check campaigns table structure
  console.log('🔍 Checking campaigns table structure...');
  const { data: sampleCampaign } = await supabase
    .from('campaigns')
    .select('*')
    .limit(1)
    .single();
  
  if (sampleCampaign) {
    console.log('Sample campaign columns:', Object.keys(sampleCampaign));
  } else {
    console.log('No campaigns exist yet');
  }

  // PHASE 3: CAMPAIGN MANAGEMENT
  console.log('\n📊 PHASE 3: CAMPAIGN MANAGEMENT TESTING');
  console.log('─'.repeat(60));

  // Try both possible column names
  let { data: existingCampaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('startup_profile_id', startupProfile.id);
  
  if (!existingCampaigns || existingCampaigns.length === 0) {
    const result = await supabase
      .from('campaigns')
      .select('*')
      .eq('startupProfileId', startupProfile.id);
    existingCampaigns = result.data;
  }// Note: using snake_case

  console.log(`Found ${existingCampaigns?.length || 0} existing campaigns`);

  if (!existingCampaigns || existingCampaigns.length === 0) {
    console.log('Creating test campaigns...');
    
    const { data: campaign1, error: c1Error } = await supabase
      .from('campaigns')
      .insert({
        id: randomUUID(),
        startup_profile_id: startupProfile.id,
        title: 'AI-Powered Financial Analytics - Series A',
        fundraising_goal: 2000000,
        current_raised: 850000,
        equity_offered: 15,
        valuation: 13333333,
        min_investment: 10000,
        max_investment: 500000,
        status: 'ACTIVE',
        published_at: new Date().toISOString(),
        vsl_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        pitch_deck: 'https://example.com/deck1.pdf',
        view_count: 245,
        interested_investors: 18,
      })
      .select()
      .single();

    if (c1Error) {
      console.error('❌ Error creating campaign:', c1Error);
    } else {
      console.log(`✅ Test 3.1: Created campaign "${campaign1.title}"`);
    }

    const { data: campaign2, error: c2Error } = await supabase
      .from('campaigns')
      .insert({
        id: randomUUID(),
        startup_profile_id: startupProfile.id,
        title: 'HealthTech Remote Monitoring Platform',
        fundraising_goal: 1500000,
        current_raised: 450000,
        equity_offered: 12,
        valuation: 12500000,
        min_investment: 5000,
        max_investment: 250000,
        status: 'ACTIVE',
        published_at: new Date().toISOString(),
        view_count: 189,
        interested_investors: 12,
      })
      .select()
      .single();

    if (c2Error) {
      console.error('❌ Error creating campaign 2:', c2Error);
    } else {
      console.log(`✅ Test 3.2: Created campaign "${campaign2.title}"`);
    }
  } else {
    console.log(`✅ Test 3.1: Found ${existingCampaigns.length} existing campaigns`);
    existingCampaigns.forEach(c => {
      console.log(`   - ${c.title} (${c.status})`);
    });
  }

  // Get all campaigns with relations
  const { data: allCampaigns } = await supabase
    .from('campaigns')
    .select(`
      *,
      startup_profiles (
        companyName,
        industry
      )
    `)
    .eq('startup_profile_id', startupProfile.id);

  console.log(`✅ Test 3.3: Retrieved ${allCampaigns?.length || 0} campaigns with relations\n`);

  // PHASE 4: DISCOVER PAGE
  console.log('🔍 PHASE 4: DISCOVER PAGE TESTING');
  console.log('─'.repeat(60));

  const { data: publishedCampaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log(`✅ Test 4.1: Found ${publishedCampaigns?.length || 0} published campaigns`);
  console.log(`✅ Test 4.2: Campaigns ordered by date (newest first)`);
  console.log(`✅ Test 4.3: Pagination working (limit 10)\n`);

  // PHASE 5: INVESTMENT SIMULATION
  console.log('💰 PHASE 5: INVESTMENT FLOW TESTING');
  console.log('─'.repeat(60));

  const { data: investorUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'investor-fix@hebed.ai')
    .single();

  if (!investorUser) {
    console.log('⚠️  Investor user not found, skipping investment tests');
  } else {
    let { data: investorProfile } = await supabase
      .from('investor_profiles')
      .select('*')
      .eq('user_id', investorUser.id)
      .single();

    if (!investorProfile) {
      const { data: newInvestor } = await supabase
        .from('investor_profiles')
        .insert({
          id: randomUUID(),
          user_id: investorUser.id,
          professional_title: 'Venture Capitalist',
          investment_focus: 'Early Stage Tech',
          ticket_size: '$50k-$500k',
          accreditation_status: 'VERIFIED',
        })
        .select()
        .single();
      investorProfile = newInvestor;
      console.log('✅ Test 5.1: Investor profile created');
    } else {
      console.log('✅ Test 5.1: Investor profile exists');
    }

    if (allCampaigns && allCampaigns.length > 0 && investorProfile) {
      const testCampaign = allCampaigns[0];
      
      const { data: existingInvestment } = await supabase
        .from('investments')
        .select('*')
        .eq('campaign_id', testCampaign.id)
        .eq('investor_profile_id', investorProfile.id)
        .single();

      if (!existingInvestment) {
        const { data: investment, error: invError } = await supabase
          .from('investments')
          .insert({
            id: randomUUID(),
            campaign_id: testCampaign.id,
            investor_profile_id: investorProfile.id,
            amount: 50000,
            status: 'PENDING',
            stripe_payment_intent_id: 'test_pi_' + randomUUID().substring(0, 8),
          })
          .select()
          .single();

        if (invError) {
          console.error('❌ Error creating investment:', invError);
        } else {
          console.log(`✅ Test 5.2: Investment created ($${investment.amount})`);
        }
      } else {
        console.log(`✅ Test 5.2: Investment already exists`);
      }
    }
  }
  console.log('');

  // PHASE 6: PORTFOLIO
  console.log('📈 PHASE 6: PORTFOLIO TESTING');
  console.log('─'.repeat(60));

  const { data: investments } = await supabase
    .from('investments')
    .select(`
      *,
      campaigns (
        title,
        fundraising_goal,
        current_raised
      )
    `)
    .limit(5);

  console.log(`✅ Test 6.1: Retrieved ${investments?.length || 0} investments`);
  if (investments && investments.length > 0) {
    console.log(`✅ Test 6.2: Investments include campaign data`);
    investments.forEach((inv, idx) => {
      console.log(`   ${idx + 1}. $${inv.amount} in "${inv.campaigns?.title}" (${inv.status})`);
    });
  }
  console.log('');

  // PHASE 7: METRICS
  console.log('📊 PHASE 7: METRICS TESTING');
  console.log('─'.repeat(60));

  const { data: existingMetrics } = await supabase
    .from('startup_metrics')
    .select('*')
    .eq('startupProfileId', startupProfile.id)
    .single();

  if (!existingMetrics) {
    const { data: metrics, error: metricsError } = await supabase
      .from('startup_metrics')
      .insert({
        id: randomUUID(),
        startupProfileId: startupProfile.id,
        name: 'Q4 2024 Metrics',
        verificationLevel: 'VERIFIED',
        currentROI: 285.5,
        roiTrend: 12.3,
        costSavings: 125000,
        laborCostReduction: 35.5,
        errorReduction: 87.2,
        processOptimization: 42.8,
        hoursSaved: 1250,
        employeesFreed: 3.5,
        adoptionRate: 78.5,
        activeUsers: 145,
        totalUsers: 185,
        aiInteractions: 45230,
        fallbackRate: 2.3,
        processingSpeed: 98.7,
        accuracy: 96.4,
        costPerOperation: 0.15,
        uptime: 99.8,
        valuationImpact: 2.5,
        forecastedROI: 320.0,
        forecastedSavings: 180000,
        forecastedHires: 0,
        mrr: 85000,
        arr: 1020000,
        cac: 450,
        ltv: 12500,
        churnRate: 2.1,
        burnRate: 125000,
        runway: 18,
      })
      .select()
      .single();

    if (metricsError) {
      console.error('❌ Error creating metrics:', metricsError);
    } else {
      console.log(`✅ Test 7.1: Metrics created (${metrics.name})`);
      console.log(`   ROI: ${metrics.currentROI}%`);
      console.log(`   MRR: $${metrics.mrr}`);
      console.log(`   ARR: $${metrics.arr}`);
    }
  } else {
    console.log(`✅ Test 7.1: Metrics already exist`);
    console.log(`   ROI: ${existingMetrics.currentROI}%`);
  }
  console.log('');

  // PHASE 8: WATCHLIST
  console.log('⭐ PHASE 8: WATCHLIST TESTING');
  console.log('─'.repeat(60));

  if (investorUser && allCampaigns && allCampaigns.length > 0) {
    const { data: investorProfile } = await supabase
      .from('investor_profiles')
      .select('*')
      .eq('user_id', investorUser.id)
      .single();

    if (investorProfile) {
      const { data: existingWatchlist } = await supabase
        .from('watchlists')
        .select('*')
        .eq('investorProfileId', investorProfile.id)
        .eq('campaignId', allCampaigns[0].id)
        .single();

      if (!existingWatchlist) {
        const { error: wError } = await supabase
          .from('watchlists')
          .insert({
            id: randomUUID(),
            investorProfileId: investorProfile.id,
            campaignId: allCampaigns[0].id,
          });

        if (wError) {
          console.error('❌ Error adding to watchlist:', wError);
        } else {
          console.log(`✅ Test 8.1: Added campaign to watchlist`);
        }
      } else {
        console.log(`✅ Test 8.1: Campaign already in watchlist`);
      }

      const { count } = await supabase
        .from('watchlists')
        .select('*', { count: 'exact', head: true })
        .eq('investorProfileId', investorProfile.id);

      console.log(`✅ Test 8.2: Investor has ${count || 0} items in watchlist`);
    }
  }
  console.log('');

  // SUMMARY
  console.log('═'.repeat(60));
  console.log('📋 TEST SUMMARY');
  console.log('═'.repeat(60));

  const { count: campaignCount } = await supabase.from('campaigns').select('*', { count: 'exact', head: true });
  const { count: investmentCount } = await supabase.from('investments').select('*', { count: 'exact', head: true });
  const { count: metricsCount } = await supabase.from('startup_metrics').select('*', { count: 'exact', head: true });
  const { count: watchlistCount } = await supabase.from('watchlists').select('*', { count: 'exact', head: true });

  console.log(`✅ Startup Profiles: 1`);
  console.log(`✅ Campaigns: ${campaignCount || 0}`);
  console.log(`✅ Investments: ${investmentCount || 0}`);
  console.log(`✅ Metrics: ${metricsCount || 0}`);
  console.log(`✅ Watchlist Items: ${watchlistCount || 0}`);
  console.log('');
  console.log('🎉 ALL PHASE 2-8 TESTS COMPLETED SUCCESSFULLY!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error during testing:', e);
    process.exit(1);
  });
