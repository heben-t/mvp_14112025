import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const operations = await prisma.operations.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(operations);
  } catch (error) {
    console.error('Error fetching operations:', error);
    return NextResponse.json({ error: 'Failed to fetch operations' }, { status: 500 });
  }
}
