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
          include: {
            startup_profiles: {
              select: {
                companyName: true,
                logo: true,
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
      totalInvested: investments
        .filter((i) => i.status === 'ACCEPTED')
        .reduce((sum, i) => sum + i.amount, 0),
    };

    return NextResponse.json({
      investments,
      stats,
    });
  } catch (error) {
    console.error('Fetch investments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investments' },
      { status: 500 }
    );
  }
}

