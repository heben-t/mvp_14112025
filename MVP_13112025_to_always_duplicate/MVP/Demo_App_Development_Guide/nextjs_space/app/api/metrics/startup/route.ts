import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceRoleClient();

    const { data: startupProfile } = await supabase
      .from('startup_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!startupProfile) {
      return NextResponse.json(
        { error: 'Startup profile not found' },
        { status: 404 }
      );
    }

    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*')
      .eq('startup_profile_id', startupProfile.id);

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({
        summary: { totalRaised: 0, activeCampaigns: 0, totalInvestors: 0, pendingReviews: 0 },
        campaignPerformance: [],
        fundingTrend: [],
        investorGrowth: [],
      });
    }

    const campaignIds = campaigns.map((c) => c.id);

    const { data: investments } = await supabase
      .from('investments')
      .select('*')
      .in('campaign_id', campaignIds);

    const investmentList = investments || [];
    
    const totalRaised = investmentList
      .filter((i) => i.status === 'ACCEPTED')
      .reduce((sum, i) => sum + (i.amount || 0), 0);

    const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE').length;
    const totalInvestors = new Set(
      investmentList.filter((i) => i.status === 'ACCEPTED').map((i) => i.investor_profile_id)
    ).size;

    const pendingReviews = investmentList.filter((i) => i.status === 'PENDING').length;

    const campaignPerformance = campaigns.map((campaign) => {
      const campaignInvestments = investmentList.filter(
        (i) => i.campaign_id === campaign.id && i.status === 'ACCEPTED'
      );
      const raised = campaignInvestments.reduce((sum, i) => sum + (i.amount || 0), 0);
      const progress = (raised / (campaign.fundraising_goal || 1)) * 100;

      return {
        id: campaign.id,
        title: campaign.title,
        raised,
        goal: campaign.fundraising_goal,
        progress: Math.min(progress, 100),
        investors: campaignInvestments.length,
      };
    });

    const monthlyFunding = investmentList
      .filter((i) => i.status === 'ACCEPTED')
      .reduce((acc: Record<string, number>, inv) => {
        const month = new Date(inv.created_at).toISOString().substring(0, 7);
        acc[month] = (acc[month] || 0) + (inv.amount || 0);
        return acc;
      }, {});

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().substring(0, 7);
    }).reverse();

    const fundingTrend = last6Months.map((month) => ({
      month,
      amount: monthlyFunding[month] || 0,
    }));

    const investorsByMonth = investmentList
      .filter((i) => i.status === 'ACCEPTED')
      .reduce((acc: Record<string, Set<string>>, inv) => {
        const month = new Date(inv.created_at).toISOString().substring(0, 7);
        if (!acc[month]) acc[month] = new Set();
        acc[month].add(inv.investor_profile_id);
        return acc;
      }, {});

    const investorGrowth = last6Months.map((month) => ({
      month,
      count: investorsByMonth[month]?.size || 0,
    }));

    return NextResponse.json({
      summary: {
        totalRaised,
        activeCampaigns,
        totalInvestors,
        pendingReviews,
      },
      campaignPerformance,
      fundingTrend,
      investorGrowth,
    });
  } catch (error) {
    console.error('Startup metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
