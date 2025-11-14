import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const benchmarks = await prisma.benchmark.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(benchmarks);
  } catch (error) {
    console.error('Error fetching benchmarks:', error);
    return NextResponse.json({ error: 'Failed to fetch benchmarks' }, { status: 500 });
  }
}
