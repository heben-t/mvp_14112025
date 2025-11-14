import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test campaigns...');

  // Find the startup profile
  const startupProfile = await prisma.startup_profiles.findFirst({
    where: {
      users: {
        email: 'startup1@test.com',
      },
    },
  });

  if (!startupProfile) {
    console.error('Startup profile not found!');
    return;
  }

  console.log('Found startup profile:', startupProfile.id);

  // Create campaigns
  const campaigns = [
    {
      title: 'AI-Powered Analytics Platform - Series A',
      fundraisingGoal: 2000000,
      currentRaised: 850000,
      equityOffered: 15,
      valuation: 13333333,
      minInvestment: 10000,
      maxInvestment: 500000,
      status: 'published',
      publishedAt: new Date(),
      vslUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      pitchDeck: 'https://example.com/deck1.pdf',
    },
    {
      title: 'Sustainable Energy Storage Solution',
      fundraisingGoal: 5000000,
      currentRaised: 2100000,
      equityOffered: 20,
      valuation: 25000000,
      minInvestment: 25000,
      maxInvestment: 1000000,
      status: 'published',
      publishedAt: new Date(),
      vslUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
      title: 'HealthTech Remote Monitoring Platform',
      fundraisingGoal: 1500000,
      currentRaised: 450000,
      equityOffered: 12,
      valuation: 12500000,
      minInvestment: 5000,
      maxInvestment: 250000,
      status: 'published',
      publishedAt: new Date(),
    },
    {
      title: 'B2B SaaS Marketing Automation',
      fundraisingGoal: 3000000,
      currentRaised: 0,
      equityOffered: 18,
      valuation: 16666667,
      minInvestment: 15000,
      status: 'published',
      publishedAt: new Date(),
    },
  ];

  for (const campaignData of campaigns) {
    const campaign = await prisma.campaigns.create({
      data: {
        id: crypto.randomUUID(),
        ...campaignData,
        startupProfileId: startupProfile.id,
        updatedAt: new Date(),
      },
    });
    console.log(`Created campaign: ${campaign.title}`);
  }

  console.log('Test campaigns created successfully!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
