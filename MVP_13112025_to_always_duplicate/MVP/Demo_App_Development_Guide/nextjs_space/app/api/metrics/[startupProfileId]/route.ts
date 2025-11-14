import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { startupProfileId: string } }
) {
  try {
    const { startupProfileId } = params;

    // Fetch the latest metrics for the startup profile
    const metrics = await prisma.startup_metrics.findFirst({
      where: {
        startup_profile_id: startupProfileId,
      },
      orderBy: {
        created_at: 'desc',
      },
      select: {
        Consolidated_AI_Impact: true,
        AI_Impact_Startup_i: true,
        Financial_i: true,
        Technology_i: true,
        Industry_i: true,
        Social_i: true,
        MRR_now: true,
        active_customers: true,
        churn_rate: true,
      },
    });

    if (!metrics) {
      return NextResponse.json(
        {
          Consolidated_AI_Impact: null,
          AI_Impact_Startup_i: null,
          Financial_i: null,
          Technology_i: null,
          Industry_i: null,
          Social_i: null,
          MRR_now: null,
          active_customers: null,
          churn_rate: null,
        },
        { status: 200 }
      );
    }

    // Convert Decimal to number for JSON response (keep precision to 2 decimal places)
    return NextResponse.json({
      Consolidated_AI_Impact: metrics.Consolidated_AI_Impact 
        ? parseFloat(Number(metrics.Consolidated_AI_Impact).toFixed(2))
        : null,
      AI_Impact_Startup_i: metrics.AI_Impact_Startup_i 
        ? parseFloat(Number(metrics.AI_Impact_Startup_i).toFixed(2))
        : null,
      Financial_i: metrics.Financial_i 
        ? parseFloat(Number(metrics.Financial_i).toFixed(2))
        : null,
      Technology_i: metrics.Technology_i 
        ? parseFloat(Number(metrics.Technology_i).toFixed(2))
        : null,
      Industry_i: metrics.Industry_i 
        ? parseFloat(Number(metrics.Industry_i).toFixed(2))
        : null,
      Social_i: metrics.Social_i 
        ? parseFloat(Number(metrics.Social_i).toFixed(2))
        : null,
      MRR_now: metrics.MRR_now ? parseFloat(Number(metrics.MRR_now).toFixed(2)) : null,
      active_customers: metrics.active_customers,
      churn_rate: metrics.churn_rate ? parseFloat(Number(metrics.churn_rate).toFixed(2)) : null,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
