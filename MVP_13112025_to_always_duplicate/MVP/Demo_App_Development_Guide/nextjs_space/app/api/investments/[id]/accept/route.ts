import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'STARTUP') {
      return NextResponse.json(
        { error: 'Only startups can accept investments' },
        { status: 403 }
      );
    }

    const investment = await prisma.investments.findUnique({
      where: { id: params.id },
      include: {
        campaigns: {
          include: {
            startup_profiles: true,
          },
        },
        investor_profiles: {
          include: {
            users: true,
          },
        },
      },
    });

    if (!investment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    if (investment.campaigns.startup_profiles.userId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to manage this investment' },
        { status: 403 }
      );
    }

    if (investment.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Investment is not pending' },
        { status: 400 }
      );
    }

    const updatedInvestment = await prisma.investments.update({
      where: { id: params.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      investment: updatedInvestment,
      message: 'Investment accepted. Funds will remain in escrow until legal documentation is completed.',
    });
  } catch (error) {
    console.error('Error accepting investment:', error);
    return NextResponse.json(
      { error: 'Failed to accept investment' },
      { status: 500 }
    );
  }
}
