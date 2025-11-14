import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';


import { prisma } from '@/lib/db';
import { checkFeatureAccess } from '@/lib/subscription';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});


export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasAccess = await checkFeatureAccess(user.id, 'invest');
    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Subscription required',
          message: 'You need an active subscription to make investments',
          upgradeUrl: '/pricing',
        },
        { status: 403 }
      );
    }

    const investorProfile = await prisma.investor_profiles.findUnique({
      where: { userId: user.id },
    });

    if (!investorProfile) {
      return NextResponse.json(
        { error: 'Investor profile not found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    const { campaignId, amount } = await request.json();

    const campaign = await prisma.campaigns.findUnique({
      where: { id: campaignId },
      include: {
        startup_profiles: {
          select: {
            companyName: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'published') {
      return NextResponse.json(
        { error: 'Campaign is not accepting investments' },
        { status: 400 }
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

    const investment = await prisma.investments.create({
      data: {
        id: crypto.randomUUID(),
        campaignId,
        investorProfileId: investorProfile.id,
        amount,
        status: 'PENDING',
        updatedAt: new Date(),
      },
    });

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Investment in ${campaign.title}`,
              description: `${campaign.startup_profiles.companyName} - ${campaign.equityOffered}% equity`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/investment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/campaigns/${campaignId}?canceled=true`,
      metadata: {
        investmentId: investment.id,
        campaignId,
        investorProfileId: investorProfile.id,
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: stripeSession.url,
      investmentId: investment.id,
    });
  } catch (error) {
    console.error('Investment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create investment' },
      { status: 500 }
    );
  }
}

