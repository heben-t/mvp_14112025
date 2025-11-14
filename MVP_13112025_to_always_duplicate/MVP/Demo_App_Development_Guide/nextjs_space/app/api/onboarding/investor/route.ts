import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'INVESTOR') {
      return NextResponse.json(
        { error: 'Only investors can access this endpoint' },
        { status: 403 }
      );
    }

    const existingProfile = await prisma.investor_profiles.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists' },
        { status: 400 }
      );
    }

    const data = await request.json();

    const {
      professionalTitle,
      investmentFocus,
      ticketSize,
      accreditationDocument,
    } = data;

    const profile = await prisma.investor_profiles.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        professionalTitle: professionalTitle || null,
        investmentFocus: investmentFocus || null,
        ticketSize: ticketSize || null,
        accreditationDocument: accreditationDocument || null,
        accreditationStatus: accreditationDocument ? 'PENDING' : 'PENDING',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      profile,
      message: 'Investor profile created successfully',
    });
  } catch (error) {
    console.error('Investor onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to create investor profile' },
      { status: 500 }
    );
  }
}
