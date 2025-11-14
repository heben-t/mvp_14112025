import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const investment = await prisma.investments.findUnique({
      where: { id: params.id },
      include: {
        investor_profiles: {
          select: {
            userId: true,
          },
        },
        campaigns: {
          include: {
            startup_profiles: {
              select: {
                companyName: true,
              },
            },
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

    if (investment.investor_profiles.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ investment });
  } catch (error) {
    console.error('Error fetching investment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investment' },
      { status: 500 }
    );
  }
}
