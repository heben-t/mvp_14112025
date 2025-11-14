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

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.customer_email !== user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await prisma.subscriptions.findFirst({
      where: {
        userId: user.id,
        stripeSubscriptionId: checkoutSession.subscription as string,
      },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Subscription verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify subscription' },
      { status: 500 }
    );
  }
}
