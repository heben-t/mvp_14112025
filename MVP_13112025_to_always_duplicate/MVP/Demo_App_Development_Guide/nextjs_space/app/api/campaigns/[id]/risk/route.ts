import { NextRequest, NextResponse } from 'next/server';
import { analyzeCampaignRisk } from '@/lib/ai-matching';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;

    const riskAnalysis = await analyzeCampaignRisk(campaignId);

    return NextResponse.json(riskAnalysis);
  } catch (error) {
    console.error('Risk analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze campaign risk' },
      { status: 500 }
    );
  }
}
