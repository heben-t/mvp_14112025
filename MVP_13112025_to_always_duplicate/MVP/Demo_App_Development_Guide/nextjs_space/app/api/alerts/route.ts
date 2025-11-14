import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const alerts = await prisma.alert.findMany({
      where: {
        resolved: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });


    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}
