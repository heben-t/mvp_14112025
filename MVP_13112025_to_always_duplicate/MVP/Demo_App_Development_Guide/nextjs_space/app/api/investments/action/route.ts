import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';


import { prisma } from '@/lib/db';
import { sendInvestmentAcceptedEmail, sendInvestmentRejectedEmail } from '@/lib/email';
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

    const startupProfile = await prisma.startup_profiles.findUnique({
      where: { userId: user.id },
    });

    if (!startupProfile) {
      return NextResponse.json(
        { error: 'Startup profile not found' },
        { status: 404 }
      );
    }

    const { investmentId, action, reason } = await request.json();

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const investment = await prisma.investments.findUnique({
      where: { id: investmentId },
      include: {
        campaigns: {
          include: {
            startup_profiles: true,
          },
        },
        investor_profiles: {
          include: {
            users: {
              select: { email: true, name: true },
            },
          },
        },
      },
    });

    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }

    if (investment.campaigns.startupProfileId !== startupProfile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (investment.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Investment has already been processed' },
        { status: 400 }
      );
    }

    const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';

    const updatedInvestment = await prisma.investments.update({
      where: { id: investmentId },
      data: {
        status: newStatus,
        acceptedAt: action === 'accept' ? new Date() : null,
        updatedAt: new Date(),
      },
    });

    if (action === 'accept') {
      await prisma.campaigns.update({
        where: { id: investment.campaignId },
        data: {
          currentRaised: {
            increment: investment.amount,
          },
        },
      });

      if (investment.investor_profiles.users.email) {
        await sendInvestmentAcceptedEmail(
          investment.investor_profiles.users.email,
          {
            campaignTitle: investment.campaigns.title,
            amount: investment.amount,
            startupName: investment.campaigns.startup_profiles.companyName,
          }
        );
      }
    } else if (action === 'reject') {
      if (investment.stripePaymentIntentId) {
        try {
          await stripe.refunds.create({
            payment_intent: investment.stripePaymentIntentId,
          });
        } catch (error) {
          console.error('Refund error:', error);
        }
      }

      if (investment.investor_profiles.users.email) {
        await sendInvestmentRejectedEmail(
          investment.investor_profiles.users.email,
          {
            campaignTitle: investment.campaigns.title,
            amount: investment.amount,
            startupName: investment.campaigns.startup_profiles.companyName,
            reason,
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      investment: updatedInvestment,
    });
  } catch (error) {
    console.error('Investment action error:', error);
    return NextResponse.json(
      { error: 'Failed to process investment action' },
      { status: 500 }
    );
  }
}

