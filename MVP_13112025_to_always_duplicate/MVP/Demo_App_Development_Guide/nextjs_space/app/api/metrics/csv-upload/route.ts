import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface MetricRow {
  date: string;
  revenue?: number;
  users?: number;
  mrr?: number;
  arr?: number;
  burnRate?: number;
  cashBalance?: number;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startupProfile = await prisma.startup_profiles.findUnique({
      where: { userId: user.id },
    });

    if (!startupProfile) {
      return NextResponse.json(
        { error: 'Startup profile not found' },
        { status: 404 }
      );
    }

    const { campaignId, metrics } = await request.json();

    const campaign = await prisma.campaigns.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.startupProfileId !== startupProfile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const metricsData = (metrics as MetricRow[]).map((row) => ({
      id: crypto.randomUUID(),
      startupProfileId: startupProfile.id,
      name: `Metrics for ${new Date(row.date).toLocaleDateString()}`,
      verificationLevel: 'SELF_REPORTED' as const,
      currentROI: 0,
      roiTrend: 0,
      costSavings: 0,
      laborCostReduction: 0,
      errorReduction: 0,
      processOptimization: 0,
      hoursSaved: 0,
      employeesFreed: 0,
      adoptionRate: 0,
      activeUsers: row.users || 0,
      totalUsers: row.users || 0,
      aiInteractions: 0,
      fallbackRate: 0,
      processingSpeed: 0,
      accuracy: 0,
      costPerOperation: 0,
      uptime: 0,
      valuationImpact: 0,
      forecastedROI: 0,
      forecastedSavings: 0,
      forecastedHires: 0,
      mrr: row.mrr || 0,
      arr: row.arr || 0,
      burnRate: row.burnRate || 0,
      updatedAt: new Date(),
    }));

    await prisma.startup_metrics.createMany({
      data: metricsData,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      imported: metricsData.length,
    });
  } catch (error) {
    console.error('CSV upload error:', error);
    return NextResponse.json(
      { error: 'Failed to import metrics' },
      { status: 500 }
    );
  }
}
