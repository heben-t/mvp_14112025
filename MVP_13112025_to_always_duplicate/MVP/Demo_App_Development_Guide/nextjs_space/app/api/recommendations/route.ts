import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateMatchingScore, getMatchReasons } from '@/lib/matching';

export const dynamic = 'force-dynamic';
export const revalidate = 180;

export async function GET() {
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

    const campaigns = await prisma.campaigns.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        startup_profiles: {
          select: {
            companyName: true,
            industry: true,
            logo: true,
            stage: true,
          },
        },
      },
    });

    const recommendations = campaigns
      .map((campaign) => {
        const investorData = {
          id: investorProfile.id,
          investmentRange: investorProfile.ticketSize || null,
          preferredIndustries: investorProfile.investmentFocus || null,
          riskTolerance: 'MEDIUM',
          investmentStage: null,
        };

        const campaignData = {
          id: campaign.id,
          industry: (campaign.startup_profiles as any)?.industry || null,
          stage: (campaign.startup_profiles as any)?.stage || null,
          fundraisingGoal: campaign.fundraisingGoal,
          minInvestment: campaign.minInvestment,
          equityOffered: campaign.equityOffered,
          currentAmount: campaign.currentRaised || 0,
        };

        const score = calculateMatchingScore(investorData as any, campaignData as any);
        const reasons = getMatchReasons(investorData as any, campaignData as any, score);

        return {
          campaign,
          score,
          reasons,
        };
      })
      .filter((rec) => rec.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json(
      { recommendations },
      {
        headers: {
          'Cache-Control': 'private, s-maxage=180, stale-while-revalidate=360',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { campaignId, action } = await request.json();

    // TODO: Track recommendation engagement when table is created
    // await prisma.recommendation_engagements.create({
    //   data: {
    //     id: crypto.randomUUID(),
    //     investorProfileId: investorProfile.id,
    //     campaignId,
    //     action,
    //     updatedAt: new Date(),
    //   },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking engagement:', error);
    return NextResponse.json(
      { error: 'Failed to track engagement' },
      { status: 500 }
    );
  }
}
