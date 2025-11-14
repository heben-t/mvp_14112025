import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'STARTUP') {
      return NextResponse.json(
        { error: 'Only startups can access this endpoint' },
        { status: 403 }
      );
    }

    const existingProfile = await prisma.startup_profiles.findUnique({
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
      companyName,
      industry,
      stage,
      description,
      website,
      logo,
      businessLicense,
      founderIdDocument,
    } = data;

    if (!companyName || !industry || !stage) {
      return NextResponse.json(
        { error: 'Missing required fields: companyName, industry, stage' },
        { status: 400 }
      );
    }

    let profileCompletionScore = 30;
    if (description) profileCompletionScore += 10;
    if (website) profileCompletionScore += 10;
    if (logo) profileCompletionScore += 20;
    if (businessLicense) profileCompletionScore += 15;
    if (founderIdDocument) profileCompletionScore += 15;

    const profile = await prisma.startup_profiles.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        companyName,
        industry,
        stage,
        description: description || null,
        website: website || null,
        logo: logo || null,
        businessLicense: businessLicense || null,
        founderIdDocument: founderIdDocument || null,
        kycStatus: businessLicense && founderIdDocument ? 'PENDING' : 'PENDING',
        profileCompletionScore,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      profile,
      message: 'Startup profile created successfully',
    });
  } catch (error) {
    console.error('Startup onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to create startup profile' },
      { status: 500 }
    );
  }
}
