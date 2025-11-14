import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startupProfile = await prisma.startup_profiles.findUnique({
      where: { userId: user.id },
      include: {
        campaigns: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!startupProfile) {
      return NextResponse.json(
        { error: 'Startup profile not found' },
        { status: 404 }
      );
    }

    const campaignIds = startupProfile.campaigns.map((c) => c.id);

    const investments = await prisma.investments.findMany({
      where: {
        campaignId: {
          in: campaignIds,
        },
      },
      include: {
        campaigns: {
          select: {
            id: true,
            title: true,
          },
        },
        investor_profiles: {
          include: {
            users: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const stats = {
      total: investments.length,
      pending: investments.filter((i) => i.status === 'PENDING').length,
      accepted: investments.filter((i) => i.status === 'ACCEPTED').length,
      rejected: investments.filter((i) => i.status === 'REJECTED').length,
      totalRaised: investments
        .filter((i) => i.status === 'ACCEPTED')
        .reduce((sum, i) => sum + i.amount, 0),
    };

    return NextResponse.json({
      investments,
      stats,
    });
  } catch (error) {
    console.error('Fetch startup investments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investments' },
      { status: 500 }
    );
  }
}
