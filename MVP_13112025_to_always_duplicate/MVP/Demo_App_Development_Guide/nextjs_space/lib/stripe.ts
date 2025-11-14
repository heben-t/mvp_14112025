import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const SUBSCRIPTION_PRICES = {
  STARTUP_BASIC: {
    amount: 15000,
    currency: 'usd',
    interval: 'month',
    name: 'Startup Basic',
  },
  INVESTOR_BASIC: {
    amount: 100000,
    currency: 'usd',
    interval: 'month',
    name: 'Investor Basic',
  },
};

export async function createCheckoutSession({
  userId,
  userEmail,
  tier,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  tier: 'STARTUP_BASIC' | 'INVESTOR_BASIC';
  successUrl: string;
  cancelUrl: string;
}) {
  const priceData = SUBSCRIPTION_PRICES[tier];

  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price_data: {
          currency: priceData.currency,
          product_data: {
            name: priceData.name,
          },
          unit_amount: priceData.amount,
          recurring: {
            interval: priceData.interval as 'month' | 'year',
          },
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      tier,
    },
  });

  return session;
}


export async function createPaymentIntent({
  amount,
  currency = 'usd',
  metadata,
}: {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    payment_method_types: ['card'],
  });

  return paymentIntent;
}

export async function createConnectedAccount(email: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  return account;
}

export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

  return accountLink;
}
