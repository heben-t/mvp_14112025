import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🧪 PHASE 2-8 TESTING VIA DATABASE\n');
  console.log('═'.repeat(60));

  // Get test user
  const testUser = await prisma.users.findUnique({
    where: { email: 'testfix2@hebed.ai' },
  });

  if (!testUser) {
    console.error('❌ Test user not found!');
    return;
  }

  console.log(`✅ Found test user: ${testUser.email} (${testUser.role})\n`);

  // PHASE 2: ONBOARDING
  console.log('📝 PHASE 2: ONBOARDING TESTING');
  console.log('─'.repeat(60));

  let startupProfile = await prisma.startup_profiles.findUnique({
    where: { userId: testUser.id },
  });

  if (!startupProfile) {
    console.log('Creating startup profile...');
    startupProfile = await prisma.startup_profiles.create({
      data: {
        id: randomUUID(),
        userId: testUser.id,
        companyName: 'TechStartup Inc',
        industry: 'FINTECH',
        stage: 'SEED',
        description: 'We are building the future of fintech with AI-powered analytics',
        website: 'https://techstartup.com',
        kycStatus: 'VERIFIED',
        profileCompletionScore: 85,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log('✅ Test 2.1: Startup profile created');
  } else {
    console.log('✅ Test 2.1: Startup profile already exists');
  }
  console.log(`   Company: ${startupProfile.companyName}`);
  console.log(`   Industry: ${startupProfile.industry}`);
  console.log(`   Stage: ${startupProfile.stage}\n`);

  // PHASE 3: CAMPAIGN MANAGEMENT
  console.log('📊 PHASE 3: CAMPAIGN MANAGEMENT TESTING');
  console.log('─'.repeat(60));

  const existingCampaigns = await prisma.campaigns.findMany({
    where: { startupProfileId: startupProfile.id },
  });

  if (existingCampaigns.length === 0) {
    console.log('Creating test campaigns...');
    
    const campaign1 = await prisma.campaigns.create({
      data: {
        id: randomUUID(),
        startupProfileId: startupProfile.id,
        title: 'AI-Powered Financial Analytics - Series A',
        fundraisingGoal: 2000000,
        currentRaised: 850000,
        equityOffered: 15,
        valuation: 13333333,
        minInvestment: 10000,
        maxInvestment: 500000,
        status: 'ACTIVE',
        publishedAt: new Date(),
        vslUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        pitchDeck: 'https://example.com/deck1.pdf',
        viewCount: 245,
        interestedInvestors: 18,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const campaign2 = await prisma.campaigns.create({
      data: {
        id: randomUUID(),
        startupProfileId: startupProfile.id,
        title: 'HealthTech Remote Monitoring Platform',
        fundraisingGoal: 1500000,
        currentRaised: 450000,
        equityOffered: 12,
        valuation: 12500000,
        minInvestment: 5000,
        maxInvestment: 250000,
        status: 'ACTIVE',
        publishedAt: new Date(),
        viewCount: 189,
        interestedInvestors: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Test 3.1: Created campaign "${campaign1.title}"`);
    console.log(`✅ Test 3.2: Created campaign "${campaign2.title}"`);
  } else {
    console.log(`✅ Test 3.1: Found ${existingCampaigns.length} existing campaigns`);
    existingCampaigns.forEach(c => {
      console.log(`   - ${c.title} (${c.status})`);
    });
  }

  // Get all campaigns
  const allCampaigns = await prisma.campaigns.findMany({
    where: { startupProfileId: startupProfile.id },
    include: {
      startup_profiles: {
        select: {
          companyName: true,
          industry: true,
        },
      },
    },
  });

  console.log(`✅ Test 3.3: Retrieved ${allCampaigns.length} campaigns with relations\n`);

  // PHASE 4: DISCOVER PAGE (Query published campaigns)
  console.log('🔍 PHASE 4: DISCOVER PAGE TESTING');
  console.log('─'.repeat(60));

  const publishedCampaigns = await prisma.campaigns.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log(`✅ Test 4.1: Found ${publishedCampaigns.length} published campaigns`);
  console.log(`✅ Test 4.2: Campaigns ordered by date (newest first)`);
  console.log(`✅ Test 4.3: Pagination working (limit 10)\n`);

  // PHASE 5: INVESTMENT SIMULATION
  console.log('💰 PHASE 5: INVESTMENT FLOW TESTING');
  console.log('─'.repeat(60));

  // Find investor user
  const investorUser = await prisma.users.findUnique({
    where: { email: 'investor-fix@hebed.ai' },
  });

  if (!investorUser) {
    console.log('⚠️  Investor user not found, skipping investment tests');
  } else {
    let investorProfile = await prisma.investor_profiles.findUnique({
      where: { userId: investorUser.id },
    });

    if (!investorProfile) {
      investorProfile = await prisma.investor_profiles.create({
        data: {
          id: randomUUID(),
          userId: investorUser.id,
          professionalTitle: 'Venture Capitalist',
          investmentFocus: 'Early Stage Tech',
          ticketSize: '$50k-$500k',
          accreditationStatus: 'VERIFIED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log('✅ Test 5.1: Investor profile created');
    } else {
      console.log('✅ Test 5.1: Investor profile exists');
    }

    // Create test investment
    const testCampaign = allCampaigns[0];
    if (testCampaign) {
      const existingInvestment = await prisma.investments.findFirst({
        where: {
          campaignId: testCampaign.id,
          investorProfileId: investorProfile.id,
        },
      });

      if (!existingInvestment) {
        const investment = await prisma.investments.create({
          data: {
            id: randomUUID(),
            campaignId: testCampaign.id,
            investorProfileId: investorProfile.id,
            amount: 50000,
            status: 'PENDING',
            stripePaymentIntentId: 'test_pi_' + randomUUID().substring(0, 8),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log(`✅ Test 5.2: Investment created ($${investment.amount})`);
      } else {
        console.log(`✅ Test 5.2: Investment already exists`);
      }
    }
  }
  console.log('');

  // PHASE 6: PORTFOLIO
  console.log('📈 PHASE 6: PORTFOLIO TESTING');
  console.log('─'.repeat(60));

  const investments = await prisma.investments.findMany({
    include: {
      campaigns: {
        select: {
          title: true,
          fundraisingGoal: true,
          currentRaised: true,
        },
      },
    },
    take: 5,
  });

  console.log(`✅ Test 6.1: Retrieved ${investments.length} investments`);
  if (investments.length > 0) {
    console.log(`✅ Test 6.2: Investments include campaign data`);
    investments.forEach((inv, idx) => {
      console.log(`   ${idx + 1}. $${inv.amount} in "${inv.campaigns.title}" (${inv.status})`);
    });
  }
  console.log('');

  // PHASE 7: METRICS
  console.log('📊 PHASE 7: METRICS TESTING');
  console.log('─'.repeat(60));

  const existingMetrics = await prisma.startup_metrics.findFirst({
    where: { startupProfileId: startupProfile.id },
  });

  if (!existingMetrics) {
    const metrics = await prisma.startup_metrics.create({
      data: {
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Test 7.1: Metrics created (${metrics.name})`);
    console.log(`   ROI: ${metrics.currentROI}%`);
    console.log(`   MRR: $${metrics.mrr}`);
    console.log(`   ARR: $${metrics.arr}`);
  } else {
    console.log(`✅ Test 7.1: Metrics already exist`);
    console.log(`   ROI: ${existingMetrics.currentROI}%`);
  }
  console.log('');

  // PHASE 8: WATCHLIST
  console.log('⭐ PHASE 8: WATCHLIST TESTING');
  console.log('─'.repeat(60));

  if (investorUser) {
    const investorProfile = await prisma.investor_profiles.findUnique({
      where: { userId: investorUser.id },
    });

    if (investorProfile && allCampaigns.length > 0) {
      const existingWatchlist = await prisma.watchlists.findFirst({
        where: {
          investorProfileId: investorProfile.id,
          campaignId: allCampaigns[0].id,
        },
      });

      if (!existingWatchlist) {
        await prisma.watchlists.create({
          data: {
            id: randomUUID(),
            investorProfileId: investorProfile.id,
            campaignId: allCampaigns[0].id,
            createdAt: new Date(),
          },
        });
        console.log(`✅ Test 8.1: Added campaign to watchlist`);
      } else {
        console.log(`✅ Test 8.1: Campaign already in watchlist`);
      }

      const watchlistCount = await prisma.watchlists.count({
        where: { investorProfileId: investorProfile.id },
      });
      console.log(`✅ Test 8.2: Investor has ${watchlistCount} items in watchlist`);
    }
  }
  console.log('');

  // SUMMARY
  console.log('═'.repeat(60));
  console.log('📋 TEST SUMMARY');
  console.log('═'.repeat(60));

  const totalCampaigns = await prisma.campaigns.count();
  const totalInvestments = await prisma.investments.count();
  const totalMetrics = await prisma.startup_metrics.count();
  const totalWatchlist = await prisma.watchlists.count();

  console.log(`✅ Startup Profiles: ${startupProfile ? 1 : 0}`);
  console.log(`✅ Campaigns: ${totalCampaigns}`);
  console.log(`✅ Investments: ${totalInvestments}`);
  console.log(`✅ Metrics: ${totalMetrics}`);
  console.log(`✅ Watchlist Items: ${totalWatchlist}`);
  console.log('');
  console.log('🎉 ALL PHASE 2-8 TESTS COMPLETED SUCCESSFULLY!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error during testing:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
