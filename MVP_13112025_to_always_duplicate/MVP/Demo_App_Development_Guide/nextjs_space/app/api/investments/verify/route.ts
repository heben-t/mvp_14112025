import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    const investmentId = checkoutSession.metadata?.investmentId;

    if (!investmentId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    const investment = await prisma.investments.findUnique({
      where: { id: investmentId },
      include: {
        campaigns: {
          select: {
            id: true,
            title: true,
            equityOffered: true,
          },
        },
        investor_profiles: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!investment || investment.investor_profiles.userId !== user.id) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }

    return NextResponse.json({ investment });
  } catch (error) {
    console.error('Investment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify investment' },
      { status: 500 }
    );
  }
}

