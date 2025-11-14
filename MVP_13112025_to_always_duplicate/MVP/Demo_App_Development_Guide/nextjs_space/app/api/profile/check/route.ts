import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';


import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'startup' or 'investor'

    if (!userId || !type) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Security: Ensure user can only check their own profile
    if (user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let hasProfile = false;

    if (type === 'startup') {
      const profile = await prisma.startup_profiles.findUnique({
        where: { user_id: userId },
        select: { id: true },
      });
      hasProfile = !!profile;
    } else if (type === 'investor') {
      const profile = await prisma.investor_profiles.findUnique({
        where: { user_id: userId },
        select: { id: true },
      });
      hasProfile = !!profile;
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ hasProfile });
  } catch (error) {
    console.error('Profile check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
