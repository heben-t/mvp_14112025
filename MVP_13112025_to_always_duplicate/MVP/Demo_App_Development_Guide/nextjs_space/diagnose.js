const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnose() {
  try {
    console.log('=== DIAGNOSTIC REPORT ===\n');
    
    // 1. Check all users
    const users = await prisma.users.findMany({
      select: {
        id: true,
        emailVerified: true,
        role: true,
        name: true,
      },
      take: 5,
    });
    
    console.log('1. USERS:');
    users.forEach((user, i) => {
      console.log(`   ${i+1}. ${user.name} (${user.role}) - ID: ${user.id}`);
    });
    
    // 2. Check startup profiles
    const profiles = await prisma.startup_profiles.findMany({
      select: {
        id: true,
        userId: true,
        companyName: true,
      },
    });
    
    console.log('\n2. STARTUP PROFILES:');
    profiles.forEach((profile, i) => {
      console.log(`   ${i+1}. ${profile.companyName}`);
      console.log(`      Profile ID: ${profile.id}`);
      console.log(`      User ID: ${profile.userId}`);
    });
    
    // 3. Check campaigns with startup_profile_id
    const campaigns = await prisma.campaigns.findMany({
      select: {
        id: true,
        title: true,
        startup_profile_id: true,
        status: true,
      },
      take: 10,
    });
    
    console.log('\n3. CAMPAIGNS:');
    campaigns.forEach((campaign, i) => {
      console.log(`   ${i+1}. "${campaign.title}" (${campaign.status})`);
      console.log(`      Campaign ID: ${campaign.id}`);
      console.log(`      Startup Profile ID: ${campaign.startup_profile_id || 'NULL'}`);
    });
    
    // 4. Check metrics
    const metrics = await prisma.startup_metrics.findMany({
      select: {
        id: true,
        startup_profile_id: true,
        Consolidated_AI_Impact: true,
        Financial_i: true,
        Technology_i: true,
        Industry_i: true,
        Social_i: true,
      },
    });
    
    console.log('\n4. METRICS:');
    metrics.forEach((metric, i) => {
      console.log(`   ${i+1}. Startup Profile ID: ${metric.startup_profile_id}`);
      console.log(`      Consolidated_AI_Impact: ${metric.Consolidated_AI_Impact}`);
      console.log(`      Financial_i: ${metric.Financial_i}`);
      console.log(`      Technology_i: ${metric.Technology_i}`);
      console.log(`      Industry_i: ${metric.Industry_i}`);
      console.log(`      Social_i: ${metric.Social_i}`);
    });
    
    // 5. Test API endpoint simulation
    console.log('\n5. TESTING METRIC FETCH FOR EACH PROFILE:');
    for (const profile of profiles) {
      const metric = await prisma.startup_metrics.findFirst({
        where: {
          startup_profile_id: profile.id,
        },
        orderBy: {
          created_at: 'desc',
        },
        select: {
          Consolidated_AI_Impact: true,
          AI_Impact_Startup_i: true,
          Financial_i: true,
          Technology_i: true,
          Industry_i: true,
          Social_i: true,
        },
      });
      
      console.log(`   Profile: ${profile.companyName}`);
      console.log(`   Profile ID: ${profile.id}`);
      if (metric) {
        console.log(`   ✅ HAS METRICS:`);
        console.log(`      Consolidated_AI_Impact: ${metric.Consolidated_AI_Impact}`);
      } else {
        console.log(`   ❌ NO METRICS FOUND`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
