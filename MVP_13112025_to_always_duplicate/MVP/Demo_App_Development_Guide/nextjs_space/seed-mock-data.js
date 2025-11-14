/**
 * Seed Mock Data Script
 * Creates realistic campaigns, investments, and portfolios for testing
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const mockStartups = [
  {
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
      vslUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'published'
    }
  },
  {
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
      status: 'published'
    }
  },
  {
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
      status: 'published'
    }
  },
  {
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
      status: 'published'
    }
  },
  {
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
      status: 'published'
    }
  }
];

async function createTestUser(email, role = 'investor') {
  console.log(`\n🧑 Creating test user: ${email}...`);
  
  try {
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: 'Test123!',
      email_confirm: true
    });
    
    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`   ⚠️  User already exists, fetching...`);
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
          console.log(`   ✅ Found existing user`);
          return existingUser.id;
        }
      }
      throw authError;
    }
    
    console.log(`   ✅ Auth user created: ${authData.user.id}`);
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        role: role,
        name: email.split('@')[0].replace('.', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      });
    
    if (profileError && !profileError.message.includes('duplicate')) {
      throw profileError;
    }
    
    console.log(`   ✅ User profile created`);
    return authData.user.id;
  } catch (error) {
    console.error(`   ❌ Error creating user:`, error.message);
    return null;
  }
}

async function createStartupProfile(userId, startupData) {
  console.log(`\n🏢 Creating startup profile: ${startupData.companyName}...`);
  
  try {
    const { data, error } = await supabase
      .from('startup_profiles')
      .insert({
        userId: userId,
        companyName: startupData.companyName,
        industry: startupData.industry,
        description: startupData.description,
        fundingStage: startupData.fundingStage,
        website: `https://${startupData.companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        foundedYear: 2022,
        employeeCount: '11-50',
        revenue: '$100k-$500k'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`   ✅ Startup profile created: ${data.id}`);
    return data.id;
  } catch (error) {
    console.error(`   ❌ Error creating startup profile:`, error.message);
    return null;
  }
}

async function createCampaign(startupProfileId, campaignData) {
  console.log(`\n📢 Creating campaign: ${campaignData.title}...`);
  
  try {
    const now = new Date();
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        startupProfileId: startupProfileId,
        title: campaignData.title,
        vslUrl: campaignData.vslUrl || null,
        pitchDeck: null,
        fundraisingGoal: campaignData.fundraisingGoal,
        equityOffered: campaignData.equityOffered,
        valuation: campaignData.valuation,
        minInvestment: campaignData.minInvestment,
        maxInvestment: campaignData.maxInvestment || null,
        status: campaignData.status,
        publishedAt: campaignData.status === 'published' ? now : null,
        currentRaised: Math.floor(campaignData.fundraisingGoal * (Math.random() * 0.3 + 0.1)), // 10-40% raised
        investorCount: Math.floor(Math.random() * 20 + 5) // 5-25 investors
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`   ✅ Campaign created: ${data.id}`);
    console.log(`   💰 Raised: $${data.currentRaised.toLocaleString()} of $${data.fundraisingGoal.toLocaleString()}`);
    return data;
  } catch (error) {
    console.error(`   ❌ Error creating campaign:`, error.message);
    return null;
  }
}

async function createInvestment(investorUserId, campaignId, amount) {
  console.log(`\n💵 Creating investment of $${amount.toLocaleString()}...`);
  
  try {
    const { data, error } = await supabase
      .from('investments')
      .insert({
        userId: investorUserId,
        campaignId: campaignId,
        amount: amount,
        status: 'completed',
        investedAt: new Date(),
        shares: Math.floor(amount / 10) // Simple share calculation
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`   ✅ Investment created: ${data.id}`);
    return data;
  } catch (error) {
    console.error(`   ❌ Error creating investment:`, error.message);
    return null;
  }
}

async function main() {
  console.clear();
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║              SEED MOCK DATA SCRIPT                        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  console.log('📋 This will create:');
  console.log('   - 5 startup companies with profiles');
  console.log('   - 5 published campaigns');
  console.log('   - 1 investor user');
  console.log('   - Multiple investments for portfolio testing\n');
  console.log('═'.repeat(60));
  
  const createdCampaigns = [];
  
  // Create startup users and campaigns
  for (const startup of mockStartups) {
    const email = `${startup.companyName.toLowerCase().replace(/\s+/g, '.')}@startup.test`;
    const userId = await createTestUser(email, 'startup');
    
    if (!userId) {
      console.log('   ⚠️  Skipping startup due to user creation failure');
      continue;
    }
    
    const startupProfileId = await createStartupProfile(userId, startup);
    
    if (!startupProfileId) {
      console.log('   ⚠️  Skipping campaign due to profile creation failure');
      continue;
    }
    
    const campaign = await createCampaign(startupProfileId, startup.campaign);
    if (campaign) {
      createdCampaigns.push(campaign);
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  
  // Create investor user
  const investorEmail = 'investor.test@example.com';
  const investorUserId = await createTestUser(investorEmail, 'investor');
  
  if (investorUserId && createdCampaigns.length > 0) {
    console.log('\n💼 Creating investor portfolio...');
    
    // Create investor profile
    const { error: investorProfileError } = await supabase
      .from('investor_profiles')
      .insert({
        userId: investorUserId,
        investorType: 'Angel Investor',
        accreditationStatus: 'Accredited',
        investmentRange: '$10k-$100k',
        preferredIndustries: ['Technology', 'HealthTech', 'FinTech'],
        riskTolerance: 'Medium'
      });
    
    if (investorProfileError && !investorProfileError.message.includes('duplicate')) {
      console.log('   ⚠️  Could not create investor profile');
    } else {
      console.log('   ✅ Investor profile created');
    }
    
    // Create investments in 3-4 random campaigns
    const numInvestments = Math.min(4, createdCampaigns.length);
    const selectedCampaigns = createdCampaigns
      .sort(() => Math.random() - 0.5)
      .slice(0, numInvestments);
    
    for (const campaign of selectedCampaigns) {
      const amount = Math.floor(Math.random() * 20000 + 5000); // $5k-$25k
      await createInvestment(investorUserId, campaign.id, amount);
    }
  }
  
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ SEEDING COMPLETE!                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  console.log('📊 Summary:');
  console.log(`   ✅ Startups created: ${createdCampaigns.length}`);
  console.log(`   ✅ Campaigns published: ${createdCampaigns.length}`);
  console.log(`   ✅ Investor account created: ${investorUserId ? 'Yes' : 'No'}`);
  console.log('');
  console.log('🔐 Test Accounts:');
  console.log('   Investor: investor.test@example.com / Test123!');
  mockStartups.forEach(s => {
    const email = `${s.companyName.toLowerCase().replace(/\s+/g, '.')}@startup.test`;
    console.log(`   Startup: ${email} / Test123!`);
  });
  console.log('');
  console.log('🎯 Next Steps:');
  console.log('   1. Sign in as investor: investor.test@example.com');
  console.log('   2. Navigate to Portfolio page');
  console.log('   3. View your investments and campaign details');
  console.log('   4. Browse Discover page to see all campaigns');
  console.log('');
}

main().catch(console.error);
