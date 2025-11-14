import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If startup user, fetch their campaigns
    if (user.role === 'STARTUP') {
      const startupProfile = await prisma.startup_profiles.findUnique({
        where: { userId: user.id },
      });

      if (!startupProfile) {
        return NextResponse.json({ campaigns: [] });
      }

      const campaigns = await prisma.campaigns.findMany({
        where: { startup_profile_id: startupProfile.id },
        include: {
          _count: {
            select: { investments: true },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      // Transform to match client expectations
      const transformedCampaigns = campaigns.map(c => ({
        id: c.id,
        title: c.title,
        campaign_objective: c.campaign_objective,
        fundraisingGoal: c.max_investment,
        currentAmount: c.current_raised,
        current_raised: c.current_raised,
        status: c.status,
        createdAt: c.created_at?.toISOString(),
        created_at: c.created_at,
        view_count: c.view_count,
        startup_profile_id: c.startup_profile_id,
        _count: {
          investments: c._count.investments,
        },
      }));

      return NextResponse.json({ campaigns: transformedCampaigns });
    }

    // For investors, fetch published campaigns
    const campaigns = await prisma.campaigns.findMany({
      where: { status: 'published' },
      include: {
        startup_profiles: {
          select: {
            companyName: true,
            logo: true,
            industry: true,
          },
        },
        _count: {
          select: { investments: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}
