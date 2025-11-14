const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMetrics() {
  try {
    console.log('Checking startup_metrics table...\n');
    
    // Get all metrics
    const metrics = await prisma.startup_metrics.findMany({
      select: {
        id: true,
        startup_profile_id: true,
        Consolidated_AI_Impact: true,
        AI_Impact_Startup_i: true,
        Financial_i: true,
        Technology_i: true,
        Industry_i: true,
        Social_i: true,
      },
      take: 10,
    });
    
    console.log(`Found ${metrics.length} metric records:\n`);
    
    metrics.forEach((metric, index) => {
      console.log(`Record ${index + 1}:`);
      console.log(`  ID: ${metric.id}`);
      console.log(`  Startup Profile ID: ${metric.startup_profile_id}`);
      console.log(`  Consolidated_AI_Impact: ${metric.Consolidated_AI_Impact}`);
      console.log(`  AI_Impact_Startup_i: ${metric.AI_Impact_Startup_i}`);
      console.log(`  Financial_i: ${metric.Financial_i}`);
      console.log(`  Technology_i: ${metric.Technology_i}`);
      console.log(`  Industry_i: ${metric.Industry_i}`);
      console.log(`  Social_i: ${metric.Social_i}`);
      console.log('---\n');
    });
    
    // Check startup profiles with campaigns
    const profiles = await prisma.startup_profiles.findMany({
      select: {
        id: true,
        companyName: true,
        campaigns: {
          select: {
            id: true,
            title: true,
            startup_profile_id: true,
          },
          take: 1,
        },
      },
      take: 5,
    });
    
    console.log('\nStartup Profiles with Campaigns:');
    profiles.forEach((profile, index) => {
      console.log(`\nProfile ${index + 1}:`);
      console.log(`  ID: ${profile.id}`);
      console.log(`  Company: ${profile.companyName}`);
      console.log(`  Campaigns: ${profile.campaigns.length}`);
      if (profile.campaigns.length > 0) {
        console.log(`  First Campaign ID: ${profile.campaigns[0].id}`);
        console.log(`  Campaign startup_profile_id: ${profile.campaigns[0].startup_profile_id}`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMetrics();
