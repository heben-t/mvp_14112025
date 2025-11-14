const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkInvestorData() {
  try {
    console.log('=== INVESTOR DASHBOARD DATA CHECK ===\n');
    
    // 1. Find investor users
    const investorUsers = await prisma.users.findMany({
      where: {
        role: 'INVESTOR',
      },
      select: {
        id: true,
        emailVerified: true,
        name: true,
      },
    });
    
    console.log('1. INVESTOR USERS:');
    investorUsers.forEach((user, i) => {
      console.log(`   ${i+1}. ${user.name} - ID: ${user.id}`);
    });
    
    // 2. For each investor, check their profile and investments
    for (const user of investorUsers) {
      console.log(`\n2. CHECKING DATA FOR: ${user.name}`);
      
      // Get investor profile
      const investorProfile = await prisma.investor_profiles.findUnique({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          professional_title: true,
        },
      });
      
      if (!investorProfile) {
        console.log('   ❌ No investor profile found');
        continue;
      }
      
      console.log(`   ✅ Investor Profile ID: ${investorProfile.id}`);
      
      // Get investments
      const investments = await prisma.investments.findMany({
        where: {
          investor_profile_id: investorProfile.id,
        },
        select: {
          id: true,
          amount: true,
          status: true,
          campaign_id: true,
          campaigns: {
            select: {
              id: true,
              title: true,
              startup_profile_id: true,
            },
          },
        },
        take: 10,
      });
      
      console.log(`   Investments: ${investments.length}`);
      
      if (investments.length === 0) {
        console.log('   ❌ No investments found');
        continue;
      }
      
      // Get unique startup profile IDs
      const startupProfileIds = [...new Set(
        investments
          .map(inv => inv.campaigns?.startup_profile_id)
          .filter(Boolean)
      )];
      
      console.log(`   Unique Startup Profiles: ${startupProfileIds.length}`);
      
      // For each startup profile, get metrics
      console.log('\n   METRICS FOR INVESTED STARTUPS:');
      for (const profileId of startupProfileIds) {
        const metric = await prisma.startup_metrics.findFirst({
          where: {
            startup_profile_id: profileId,
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
        
        const profile = await prisma.startup_profiles.findUnique({
          where: { id: profileId },
          select: { companyName: true },
        });
        
        console.log(`   - ${profile?.companyName || 'Unknown'} (${profileId})`);
        if (metric) {
          console.log(`     ✅ Consolidated_AI_Impact: ${metric.Consolidated_AI_Impact}`);
          console.log(`     Financial_i: ${metric.Financial_i}`);
          console.log(`     Technology_i: ${metric.Technology_i}`);
          console.log(`     Industry_i: ${metric.Industry_i}`);
          console.log(`     Social_i: ${metric.Social_i}`);
        } else {
          console.log(`     ❌ NO METRICS`);
        }
      }
      
      // Calculate what avgROI should be
      const metricsWithValues = await Promise.all(
        startupProfileIds.map(profileId => 
          prisma.startup_metrics.findFirst({
            where: { startup_profile_id: profileId },
            orderBy: { created_at: 'desc' },
            select: { Consolidated_AI_Impact: true },
          })
        )
      );
      
      const validMetrics = metricsWithValues
        .filter(m => m && m.Consolidated_AI_Impact !== null)
        .map(m => Number(m.Consolidated_AI_Impact));
      
      if (validMetrics.length > 0) {
        const avgROI = validMetrics.reduce((sum, val) => sum + val, 0) / validMetrics.length;
        console.log(`\n   📊 EXPECTED AVG ROI: ${avgROI.toFixed(2)}%`);
      } else {
        console.log(`\n   📊 EXPECTED AVG ROI: 0.00% (no metrics found)`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInvestorData();
