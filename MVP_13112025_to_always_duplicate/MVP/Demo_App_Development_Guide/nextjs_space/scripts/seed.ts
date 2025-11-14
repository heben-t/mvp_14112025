
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.benchmarks.deleteMany();
  await prisma.alerts.deleteMany();
  await prisma.time_series_data.deleteMany();
  await prisma.operations.deleteMany();
  await prisma.portfolio_companies.deleteMany();
  await prisma.startup_metrics.deleteMany();

  console.log('Cleared existing data');

  // Seed Startup Metrics
  const startup = await prisma.startup_metrics.create({
    data: {
      id: crypto.randomUUID(),
      name: 'TechLogix',
      currentROI: 327,
      roiTrend: 47,
      costSavings: 147293,
      laborCostReduction: 87421,
      errorReduction: 31872,
      processOptimization: 28000,
      hoursSaved: 4827,
      employeesFreed: 2.3,
      adoptionRate: 94,
      activeUsers: 847,
      totalUsers: 900,
      aiInteractions: 47293,
      fallbackRate: 2.3,
      processingSpeed: 12,
      accuracy: 94,
      costPerOperation: 87,
      uptime: 99.97,
      valuationImpact: 2.3,
      forecastedROI: 520,
      forecastedSavings: 492000,
      forecastedHires: 3,
      updatedAt: new Date(),
    },
  });

  console.log('Created startup metrics');

  // Seed Time Series Data for Adoption
  const weeks = 12;
  for (let week = 1; week <= weeks; week++) {
    const adoptionValue = 12 + (week * (94 - 12) / weeks) + Math.random() * 5;
    await prisma.time_series_data.create({
      data: {
        id: crypto.randomUUID(),
        entityId: startup.id,
        entityType: 'startup',
        metricName: 'adoption',
        value: Math.min(94, adoptionValue),
        week: week,
      },
    });
  }

  // Seed Time Series Data for ROI
  for (let week = 1; week <= weeks; week++) {
    const roiValue = 80 + (week * (327 - 80) / weeks) + Math.random() * 15;
    await prisma.time_series_data.create({
      data: {
        id: crypto.randomUUID(),
        entityId: startup.id,
        entityType: 'startup',
        metricName: 'roi',
        value: roiValue,
        week: week,
      },
    });
  }

  console.log('Created time series data');

  // Seed Operations
  const operations = [
    {
      name: 'Customer Support Response',
      category: 'Support',
      timeBefore: 4.2,
      timeAfter: 0.05, // 3 minutes
      costBefore: 47,
      costAfter: 0.12,
      csatBefore: 72,
      csatAfter: 91,
      volumeBefore: 100,
      volumeAfter: 10000,
    },
    {
      name: 'Invoice Processing',
      category: 'Finance',
      timeBefore: 2.5,
      timeAfter: 0.02, // 1.2 minutes
      costBefore: 35,
      costAfter: 0.08,
      csatBefore: 68,
      csatAfter: 89,
      volumeBefore: 200,
      volumeAfter: 15000,
    },
    {
      name: 'Data Entry',
      category: 'Operations',
      timeBefore: 3.0,
      timeAfter: 0.03, // 2 minutes
      costBefore: 28,
      costAfter: 0.05,
      csatBefore: 65,
      csatAfter: 92,
      volumeBefore: 500,
      volumeAfter: 25000,
    },
    {
      name: 'Quality Assurance',
      category: 'Quality',
      timeBefore: 5.5,
      timeAfter: 0.08, // 5 minutes
      costBefore: 62,
      costAfter: 0.15,
      csatBefore: 78,
      csatAfter: 94,
      volumeBefore: 150,
      volumeAfter: 8000,
    },
  ];

  for (const op of operations) {
    await prisma.operations.create({
      data: {
        id: crypto.randomUUID(),
        startupId: startup.id,
        ...op,
      },
    });
  }

  console.log('Created operations');

  // Seed Portfolio Companies
  const companies = [
    {
      name: 'SmartLogix',
      roi: 487,
      adoptionRate: 94,
      efficiency: 94,
      trend: 'up',
      trendValue: 2,
      category: 'logistics',
      investment: 1.2,
      currentValue: 9.84,
      multiple: 8.2,
      status: 'winner',
      aiImplementation: 'AI-powered route optimization',
      riskLevel: 'low',
      burnRate: 45000,
      aiSavings: 87000,
      technicalScore: 92,
      successProbability: 97,
      seriesStage: 'Series A',
    },
    {
      name: 'DataFlow',
      roi: 423,
      adoptionRate: 91,
      efficiency: 91,
      trend: 'up',
      trendValue: 1,
      category: 'data analytics',
      investment: 0.8,
      currentValue: 4.08,
      multiple: 5.1,
      status: 'winner',
      aiImplementation: 'AI credit scoring',
      riskLevel: 'low',
      burnRate: 38000,
      aiSavings: 72000,
      technicalScore: 88,
      successProbability: 92,
      seriesStage: 'Series A',
    },
    {
      name: 'CloudMind',
      roi: 381,
      adoptionRate: 88,
      efficiency: 88,
      trend: 'stable',
      trendValue: 0,
      category: 'cloud services',
      investment: 1.5,
      currentValue: 6.45,
      multiple: 4.3,
      status: 'winner',
      aiImplementation: 'AI diagnostics',
      riskLevel: 'low',
      burnRate: 52000,
      aiSavings: 95000,
      technicalScore: 85,
      successProbability: 88,
      seriesStage: 'Series B',
    },
    {
      name: 'TechServe',
      roi: 290,
      adoptionRate: 72,
      efficiency: 72,
      trend: 'up',
      trendValue: 1,
      category: 'saas',
      investment: 1.0,
      currentValue: 2.9,
      multiple: 2.9,
      status: 'promising',
      aiImplementation: 'AI customer service',
      riskLevel: 'medium',
      burnRate: 41000,
      aiSavings: 58000,
      technicalScore: 74,
      successProbability: 76,
      seriesStage: 'Seed',
    },
    {
      name: 'AutoSales',
      roi: 234,
      adoptionRate: 67,
      efficiency: 67,
      trend: 'down',
      trendValue: -1,
      category: 'sales automation',
      investment: 0.9,
      currentValue: 2.11,
      multiple: 2.34,
      status: 'promising',
      aiImplementation: 'AI sales forecasting',
      riskLevel: 'medium',
      burnRate: 36000,
      aiSavings: 48000,
      technicalScore: 68,
      successProbability: 68,
      seriesStage: 'Seed',
    },
    {
      name: 'FinTechAI',
      roi: 312,
      adoptionRate: 82,
      efficiency: 82,
      trend: 'up',
      trendValue: 1,
      category: 'fintech',
      investment: 1.3,
      currentValue: 4.06,
      multiple: 3.12,
      status: 'promising',
      aiImplementation: 'AI fraud detection',
      riskLevel: 'low',
      burnRate: 47000,
      aiSavings: 78000,
      technicalScore: 81,
      successProbability: 84,
      seriesStage: 'Series A',
    },
    {
      name: 'HealthPro',
      roi: 268,
      adoptionRate: 75,
      efficiency: 75,
      trend: 'stable',
      trendValue: 0,
      category: 'healthcare',
      investment: 1.1,
      currentValue: 2.95,
      multiple: 2.68,
      status: 'promising',
      aiImplementation: 'AI patient monitoring',
      riskLevel: 'medium',
      burnRate: 43000,
      aiSavings: 62000,
      technicalScore: 72,
      successProbability: 72,
      seriesStage: 'Seed',
    },
    {
      name: 'EduTech',
      roi: 195,
      adoptionRate: 58,
      efficiency: 58,
      trend: 'down',
      trendValue: -1,
      category: 'education',
      investment: 0.7,
      currentValue: 1.37,
      multiple: 1.95,
      status: 'struggling',
      aiImplementation: 'AI personalized learning',
      riskLevel: 'high',
      burnRate: 32000,
      aiSavings: 35000,
      technicalScore: 54,
      successProbability: 54,
      seriesStage: 'Seed',
    },
    {
      name: 'LaggardCo',
      roi: 47,
      adoptionRate: 31,
      efficiency: 31,
      trend: 'down',
      trendValue: -2,
      category: 'retail',
      investment: 0.5,
      currentValue: 0.24,
      multiple: 0.47,
      status: 'struggling',
      aiImplementation: 'AI inventory management',
      riskLevel: 'high',
      burnRate: 28000,
      aiSavings: 15000,
      technicalScore: 38,
      successProbability: 34,
      seriesStage: 'Seed',
    },
  ];

  for (const company of companies) {
    await prisma.portfolio_companies.create({
      data: {
        id: crypto.randomUUID(),
        ...company,
        updatedAt: new Date(),
      },
    });
  }

  console.log('Created portfolio companies');

  // Get all portfolio companies for alerts
  const allCompanies = await prisma.portfolio_companies.findMany();

  // Seed Alerts
  const alerts = [
    {
      companyId: allCompanies.find((c) => c.name === 'LaggardCo')?.id || '',
      severity: 'urgent',
      title: 'Critical: High Burn Rate',
      description: 'LaggardCo burning 2x faster than AI savings',
      actionRequired: true,
    },
    {
      companyId: allCompanies.find((c) => c.name === 'EduTech')?.id || '',
      severity: 'watch',
      title: 'Watch: Declining Adoption',
      description: 'EduTech adoption declining 3 weeks straight',
      actionRequired: true,
    },
    {
      companyId: allCompanies.find((c) => c.name === 'CloudMind')?.id || '',
      severity: 'opportunity',
      title: 'Opportunity: Series B Ready',
      description: 'CloudMind ready for Series B (metrics proven)',
      actionRequired: false,
    },
    {
      companyId: allCompanies.find((c) => c.name === 'AutoSales')?.id || '',
      severity: 'watch',
      title: 'Watch: Efficiency Decline',
      description: 'AutoSales showing signs of slowing growth',
      actionRequired: true,
    },
  ];

  for (const alert of alerts) {
    if (alert.companyId) {
      await prisma.alerts.create({
        data: {
          id: crypto.randomUUID(),
          ...alert,
        },
      });
    }
  }

  console.log('Created alerts');

  // Seed Benchmarks
  const benchmarkCategories = [
    {
      category: 'roi',
      portfolioValue: 327,
      gccAverage: 178,
      globalTop10: 412,
      metricType: 'percentage',
    },
    {
      category: 'adoption',
      portfolioValue: 84,
      gccAverage: 52,
      globalTop10: 91,
      metricType: 'percentage',
    },
    {
      category: 'efficiency',
      portfolioValue: 8.2,
      gccAverage: 4.1,
      globalTop10: 12.3,
      metricType: 'multiplier',
    },
    {
      category: 'timeToValue',
      portfolioValue: 43,
      gccAverage: 127,
      globalTop10: 31,
      metricType: 'days',
    },
  ];

  for (const benchmark of benchmarkCategories) {
    await prisma.benchmarks.create({
      data: {
        id: crypto.randomUUID(),
        ...benchmark,
      },
    });
  }

  console.log('Created benchmarks');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
