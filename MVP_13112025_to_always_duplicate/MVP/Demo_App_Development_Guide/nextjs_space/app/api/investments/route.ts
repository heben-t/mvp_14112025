import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase-db';
import { createPaymentIntent } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!session?.user || user.role !== 'INVESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { campaignId, amount } = body;

    if (!campaignId || !amount || amount < 0) {
      return NextResponse.json(
        { error: 'Invalid investment data' },
        { status: 400 }
      );
    }

    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (amount < campaign.minInvestment) {
      return NextResponse.json(
        { error: `Minimum investment is $${campaign.minInvestment}` },
        { status: 400 }
      );
    }

    if (campaign.maxInvestment && amount > campaign.maxInvestment) {
      return NextResponse.json(
        { error: `Maximum investment is $${campaign.maxInvestment}` },
        { status: 400 }
      );
    }

    const investorProfile = await db.investorProfile.findUnique({
      where: { userId: user.id },
    });

    if (!investorProfile) {
      return NextResponse.json(
        { error: 'Investor profile not found' },
        { status: 404 }
      );
    }

    const investment = await db.investment.create({
      data: {
        campaignId,
        investorProfileId: investorProfile.id,
        amount,
        status: 'PENDING',
      },
    });

    const paymentIntent = await createPaymentIntent({
      amount: Math.round(amount * 100),
      metadata: {
        investmentId: investment.id,
        campaignId,
        investorId: investorProfile.id,
      },
    });

    await db.investment.update({
      where: { id: investment.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      investment,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json(
      { error: 'Failed to create investment' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await import('@/lib/supabase').then(m => m.getServiceRoleClient());
    let investments;

    if (user.role === 'INVESTOR') {
      const { data: investorProfile } = await supabase
        .from('investor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!investorProfile) {
        return NextResponse.json({ investments: [] });
      }

      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          campaigns (
            *,
            startup_profiles (
              id,
              company_name,
              logo
            )
          )
        `)
        .eq('investor_profile_id', investorProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      investments = data || [];
    } else if (user.role === 'STARTUP') {
      const { data: startup_profiles } = await supabase
        .from('startup_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!startup_profiles) {
        return NextResponse.json({ investments: [] });
      }

      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id')
        .eq('startup_profile_id', startup_profiles.id);

      if (!campaigns || campaigns.length === 0) {
        return NextResponse.json({ investments: [] });
      }

      const campaignIds = campaigns.map(c => c.id);

      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          campaigns (
            title,
            fundraising_goal
          ),
          investor_profiles (
            professional_title,
            users (
              name,
              email
            )
          )
        `)
        .in('campaign_id', campaignIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      investments = data || [];
    }

    return NextResponse.json({ investments });
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investments' },
      { status: 500 }
    );
  }
}

