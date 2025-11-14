import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test data...\n');

  // Find our test users
  const startupUser = await prisma.users.findUnique({
    where: { email: 'testfix2@hebed.ai' },
  });

  const investorUser = await prisma.users.findUnique({
    where: { email: 'investor-fix@hebed.ai' },
  });

  if (!startupUser) {
    console.error('❌ Startup user not found! Please register first.');
    return;
  }

  if (!investorUser) {
    console.error('❌ Investor user not found! Please register first.');
    return;
  }

  console.log('✅ Found test users');
  console.log(`   - Startup: ${startupUser.email}`);
  console.log(`   - Investor: ${investorUser.email}\n`);

  // Create or update startup profile
  let startupProfile = await prisma.startup_profiles.findUnique({
    where: { userId: startupUser.id },
  });

  if (!startupProfile) {
    startupProfile = await prisma.startup_profiles.create({
      data: {
        id: randomUUID(),
        userId: startupUser.id,
        companyName: 'TechStartup Inc',
        industry: 'FINTECH',
        stage: 'SEED',
        description: 'We are building the future of fintech with AI-powered financial analytics',
        website: 'https://techstartup.com',
        kycStatus: 'VERIFIED',
        profileCompletionScore: 85,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log('✅ Created startup profile');
  } else {
    console.log('✅ Startup profile already exists');
  }

  // Create or update investor profile
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
    console.log('✅ Created investor profile');
  } else {
    console.log('✅ Investor profile already exists');
  }

  console.log('\n📊 Creating test campaigns...\n');

  // Create test campaigns
  const campaigns = [
    {
      id: randomUUID(),
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
    },
    {
      id: randomUUID(),
      title: 'Sustainable Energy Storage Solution',
      fundraisingGoal: 5000000,
      currentRaised: 2100000,
      equityOffered: 20,
      valuation: 25000000,
      minInvestment: 25000,
      maxInvestment: 1000000,
      status: 'ACTIVE',
      publishedAt: new Date(),
      vslUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      viewCount: 512,
      interestedInvestors: 34,
    },
    {
      id: randomUUID(),
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
    },
    {
      id: randomUUID(),
      title: 'B2B SaaS Marketing Automation',
      fundraisingGoal: 3000000,
      currentRaised: 750000,
      equityOffered: 18,
      valuation: 16666667,
      minInvestment: 15000,
      maxInvestment: 500000,
      status: 'ACTIVE',
      publishedAt: new Date(),
      viewCount: 302,
      interestedInvestors: 23,
    },
  ];

  for (const campaignData of campaigns) {
    const existing = await prisma.campaigns.findFirst({
      where: { title: campaignData.title },
    });

    if (!existing) {
      const campaign = await prisma.campaigns.create({
        data: {
          ...campaignData,
          startupProfileId: startupProfile.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`✅ Created campaign: ${campaign.title}`);
    } else {
      console.log(`⏭️  Campaign already exists: ${campaignData.title}`);
    }
  }

  console.log('\n📈 Creating test metrics...\n');

  // Create some test metrics for the startup
  const existingMetrics = await prisma.startup_metrics.findFirst({
    where: { startupProfileId: startupProfile.id },
  });

  if (!existingMetrics) {
    await prisma.startup_metrics.create({
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
    console.log('✅ Created test metrics');
  } else {
    console.log('✅ Test metrics already exist');
  }

  console.log('\n🎉 Test data seeding complete!\n');
  console.log('📝 Summary:');
  console.log(`   - Startup Profile: ${startupProfile.companyName}`);
  console.log(`   - Investor Profile: ${investorProfile.professionalTitle}`);
  console.log(`   - Campaigns: 4 active campaigns`);
  console.log(`   - Metrics: Sample Q4 2024 metrics\n`);
  console.log('🚀 Ready for testing!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
