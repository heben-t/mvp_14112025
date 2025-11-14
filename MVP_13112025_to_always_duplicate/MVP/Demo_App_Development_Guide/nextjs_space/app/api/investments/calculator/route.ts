import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';


import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    
    const { campaignId, investmentAmount, equityPercentage, valuation } = body;

    if (!investmentAmount || !equityPercentage || !valuation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate exit scenarios
    const exitScenarios = {
      conservative: {
        exitValue: valuation * 0.5,
        returnAmount: (investmentAmount * valuation * 0.5 * equityPercentage) / 100 / valuation,
        multiple: (valuation * 0.5 * equityPercentage / 100) / investmentAmount,
      },
      expected: {
        exitValue: valuation,
        returnAmount: (investmentAmount * equityPercentage) / 100,
        multiple: (valuation * equityPercentage / 100) / investmentAmount,
      },
      optimistic: {
        exitValue: valuation * 2,
        returnAmount: (investmentAmount * valuation * 2 * equityPercentage) / 100 / valuation,
        multiple: (valuation * 2 * equityPercentage / 100) / investmentAmount,
      },
    };

    // Save calculation if user is logged in
    if (session?.user?.id && campaignId) {
      const supabase = getSupabaseClient();
      
      const { data: profile } = await supabase
        .from('investor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('investment_calculations')
          .insert({
            investor_profile_id: profile.id,
            campaign_id: campaignId,
            investment_amount: investmentAmount,
            equity_percentage: equityPercentage,
            valuation,
            conservative_exit: exitScenarios.conservative.returnAmount,
            expected_exit: exitScenarios.expected.returnAmount,
            optimistic_exit: exitScenarios.optimistic.returnAmount,
          });
      }
    }

    return NextResponse.json({
      investmentAmount,
      equityPercentage,
      valuation,
      scenarios: exitScenarios,
    });
  } catch (error) {
    console.error('Error calculating investment:', error);
    return NextResponse.json(
      { error: 'Failed to calculate investment' },
      { status: 500 }
    );
  }
}

