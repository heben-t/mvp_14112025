import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    const subscription = await prisma.subscriptions.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.redirect(new URL('/dashboard/subscription?error=no_subscription', request.url));
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL || request.nextUrl.origin}/dashboard/subscription`,
    });

    return NextResponse.redirect(portalSession.url);
  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/subscription?error=portal_failed', request.url)
    );
  }
}
