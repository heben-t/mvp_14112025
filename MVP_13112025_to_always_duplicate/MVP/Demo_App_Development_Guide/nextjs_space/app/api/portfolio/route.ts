import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceRoleClient();

    const { data: investorProfile } = await supabase
      .from('investor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!investorProfile) {
      return NextResponse.json(
        { error: 'Investor profile not found' },
        { status: 404 }
      );
    }

    const { data: investments, error } = await supabase
      .from('investments')
      .select(`
        *,
        campaigns (
          *,
          startup_profiles (
            company_name,
            industry,
            logo,
            stage
          )
        )
      `)
      .eq('investor_profile_id', investorProfile.id)
      .eq('status', 'ACCEPTED')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const investmentList = investments || [];
    const totalInvested = investmentList.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const activeInvestments = investmentList.length;

    const portfolioStats = {
      totalInvested,
      activeInvestments,
      totalValue: totalInvested,
      roi: 0,
    };

    return NextResponse.json(
      {
        investments: investmentList,
        stats: portfolioStats,
      },
      {
        headers: {
          'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}
