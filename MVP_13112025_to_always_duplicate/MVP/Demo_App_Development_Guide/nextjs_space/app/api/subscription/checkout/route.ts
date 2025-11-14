import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const PLAN_PRICES: Record<string, { priceId?: string; amount: number; interval: 'month' | 'year'; name: string }> = {
  pro: { amount: 2900, interval: 'month', name: 'Pro Plan' },
  investor_basic: { amount: 4900, interval: 'month', name: 'Investor Basic' },
  investor_pro: { amount: 14900, interval: 'month', name: 'Investor Pro' },
  startup: { amount: 29900, interval: 'month', name: 'Startup Plan' },
};

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('plan') || 'pro';

    if (!PLAN_PRICES[planId]) {
      return NextResponse.redirect(new URL('/pricing?error=invalid_plan', request.url));
    }

    const plan = PLAN_PRICES[planId];

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: `Monthly subscription to ${plan.name}`,
            },
            unit_amount: plan.amount,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL || request.nextUrl.origin}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL || request.nextUrl.origin}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        planId,
      },
      customer_email: user.email || undefined,
      subscription_data: {
        metadata: {
          userId: user.id,
          planId,
        },
      },
    });

    if (checkoutSession.url) {
      return NextResponse.redirect(checkoutSession.url);
    }

    return NextResponse.redirect(new URL('/pricing?error=checkout_failed', request.url));
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.redirect(new URL('/pricing?error=checkout_failed', request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await request.json();

    if (!PLAN_PRICES[planId]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const plan = PLAN_PRICES[planId];

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: `Monthly subscription to ${plan.name}`,
            },
            unit_amount: plan.amount,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        planId,
      },
      customer_email: user.email || undefined,
      subscription_data: {
        metadata: {
          userId: user.id,
          planId,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
