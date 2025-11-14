import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const investorProfile = await prisma.investor_profiles.findUnique({
      where: { userId: user.id },
    });

    if (!investorProfile) {
      return NextResponse.json(
        { error: 'Investor profile not found' },
        { status: 404 }
      );
    }

    const investments = await prisma.investments.findMany({
      where: {
        investorProfileId: investorProfile.id,
      },
      include: {
        campaigns: {
          select: {
            title: true,
            status: true,
          },
        },
      },
    });

    const totalInvested = investments
      .filter((i) => i.status === 'ACCEPTED')
      .reduce((sum, i) => sum + i.amount, 0);

    const activeInvestments = investments.filter((i) => i.status === 'ACCEPTED').length;
    const pendingInvestments = investments.filter((i) => i.status === 'PENDING').length;

    const industryBreakdown = investments
      .filter((i) => i.status === 'ACCEPTED')
      .reduce((acc: Record<string, number>, inv) => {
        const campaignStatus = inv.campaigns.status;
        acc[campaignStatus] = (acc[campaignStatus] || 0) + inv.amount;
        return acc;
      }, {});

    const stageBreakdown = investments
      .filter((i) => i.status === 'ACCEPTED')
      .reduce((acc: Record<string, number>, inv) => {
        const title = inv.campaigns.title;
        acc[title] = (acc[title] || 0) + inv.amount;
        return acc;
      }, {});

    const monthlyInvestments = investments
      .filter((i) => i.status === 'ACCEPTED')
      .reduce((acc: Record<string, number>, inv) => {
        const month = new Date(inv.createdAt).toISOString().substring(0, 7);
        acc[month] = (acc[month] || 0) + inv.amount;
        return acc;
      }, {});

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().substring(0, 7);
    }).reverse();

    const investmentTrend = last6Months.map((month) => ({
      month,
      amount: monthlyInvestments[month] || 0,
    }));

    return NextResponse.json({
      summary: {
        totalInvested,
        activeInvestments,
        pendingInvestments,
        totalInvestments: investments.length,
      },
      industryBreakdown: Object.entries(industryBreakdown).map(([name, value]) => ({
        name,
        value,
      })),
      stageBreakdown: Object.entries(stageBreakdown).map(([name, value]) => ({
        name,
        value,
      })),
      investmentTrend,
    });
  } catch (error) {
    console.error('Investor metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
