import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { 
  sendInvestmentNotificationToStartup, 
  sendInvestmentConfirmationToInvestor 
} from '@/lib/email';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription') {
          const userId = session.metadata?.userId;
          const planId = session.metadata?.planId;

          if (userId && planId) {
            await prisma.subscriptions.create({
              data: {
                id: crypto.randomUUID(),
                userId,
                tier: planId as any,
                status: 'active',
                stripeSubscriptionId: session.subscription as string,
                stripeCustomerId: session.customer as string,
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(),
              },
            });
          }
        } else if (session.mode === 'payment') {
          const investmentId = session.metadata?.investmentId;

          if (investmentId) {
            const investment = await prisma.investments.update({
              where: { id: investmentId },
              data: {
                status: 'PENDING',
                stripePaymentIntentId: session.payment_intent as string,
              },
              include: {
                campaigns: {
                  include: {
                    startup_profiles: {
                      include: {
                        users: {
                          select: { email: true, name: true },
                        },
                      },
                    },
                  },
                },
                investor_profiles: {
                  include: {
                    users: {
                      select: { name: true, email: true },
                    },
                  },
                },
              },
            });

            const emailData = {
              investorName: investment.investor_profiles.users.name || 'Anonymous Investor',
              investorEmail: investment.investor_profiles.users.email || '',
              startupName: investment.campaigns.startup_profiles.companyName,
              startupEmail: investment.campaigns.startup_profiles.users?.email || '',
              amount: investment.amount,
              campaignTitle: investment.campaigns.title,
              campaignId: investment.campaigns.id,
            };

            await Promise.all([
              sendInvestmentNotificationToStartup(emailData.startupEmail, emailData),
              sendInvestmentConfirmationToInvestor(emailData.investorEmail, emailData),
            ]);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.subscriptions.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status === 'active' ? 'active' : 'inactive',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.subscriptions.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'cancelled',
          },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          await prisma.subscriptions.updateMany({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: {
              status: 'past_due',
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
