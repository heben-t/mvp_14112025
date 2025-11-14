import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user with profile
    const userWithProfile = await prisma.users.findUnique({
      where: { id: user.id },
      include: {
        startup_profiles: true,
        investor_profiles: true,
      },
    });

    if (!userWithProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Format response based on user role
    const profile = {
      id: userWithProfile.id,
      email: userWithProfile.email,
      name: userWithProfile.name,
      role: userWithProfile.role,
      image: userWithProfile.image,
      emailVerified: userWithProfile.emailVerified,
      createdAt: userWithProfile.createdAt,
      startupProfile: userWithProfile.startup_profiles || undefined,
      investorProfile: userWithProfile.investor_profiles || undefined,
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Get user
    const user = await prisma.users.findUnique({
      where: { id: currentUser.id },
      include: {
        startup_profiles: true,
        investor_profiles: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user name
    if (body.name) {
      await prisma.users.update({
        where: { id: user.id },
        data: { name: body.name },
      });
    }

    // Update startup profile
    if (user.role === 'STARTUP' && user.startup_profiles) {
      await prisma.startup_profiles.update({
        where: { id: user.startup_profiles.id },
        data: {
          companyName: body.companyName || user.startup_profiles.companyName,
          industry: body.industry || user.startup_profiles.industry,
          stage: body.stage || user.startup_profiles.stage,
          description: body.description !== undefined ? body.description : user.startup_profiles.description,
          website: body.website !== undefined ? body.website : user.startup_profiles.website,
          geographicPresence: body.location !== undefined ? body.location : user.startup_profiles.geographicPresence,
          updatedAt: new Date(),
        },
      });
    }

    // Update investor profile
    if (user.role === 'INVESTOR' && user.investor_profiles) {
      await prisma.investor_profiles.update({
        where: { id: user.investor_profiles.id },
        data: {
          professional_title: body.professionalTitle !== undefined 
            ? body.professionalTitle 
            : user.investor_profiles.professional_title,
          investment_focus: body.investmentFocus !== undefined 
            ? body.investmentFocus 
            : user.investor_profiles.investment_focus,
          ticket_size: body.ticketSize !== undefined 
            ? body.ticketSize 
            : user.investor_profiles.ticket_size,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
