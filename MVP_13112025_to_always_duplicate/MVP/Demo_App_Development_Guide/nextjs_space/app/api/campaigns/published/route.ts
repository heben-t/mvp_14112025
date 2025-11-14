import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const campaigns = await prisma.campaigns.findMany({
      where: {
        status: 'published',
      },
      include: {
        startup_profiles: {
          select: {
            companyName: true,
            logo: true,
            industry: true,
            stage: true,
          },
        },
        _count: {
          select: { investments: true },
        },
      },
      orderBy: { published_at: 'desc' },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error fetching published campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
