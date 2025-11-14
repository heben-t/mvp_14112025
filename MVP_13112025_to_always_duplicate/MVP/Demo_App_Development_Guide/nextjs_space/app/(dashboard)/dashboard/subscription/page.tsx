

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import Link from 'next/link';

async function getSubscription(userId: string) {
  const subscription = await prisma.subscriptions.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return subscription;
}

export default async function SubscriptionManagementPage() {
  const user = await getCurrentUser();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const subscription = await getSubscription(user.id);

  const planFeatures = {
    free: [
      'Browse all campaigns',
      'Basic investor profile',
      'Email notifications',
      'Limited to 3 investments/year'
    ],
    pro: [
      'Unlimited investments',
      'Advanced analytics',
      'AI-powered recommendations',
      'Priority deal flow',
      'Priority support'
    ]
  };

  const currentPlan = subscription?.tier?.toLowerCase() || 'free';
  const features = planFeatures[currentPlan as keyof typeof planFeatures] || planFeatures.free;

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Subscription Management</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Plan</CardTitle>
              {currentPlan === 'pro' ? (
                <Zap className="h-6 w-6 text-primary" />
              ) : (
                <Crown className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <CardDescription>Your active subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Badge variant={currentPlan === 'pro' ? 'default' : 'secondary'} className="text-lg px-3 py-1">
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </Badge>
            </div>
            <ul className="space-y-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {currentPlan === 'free' ? (
              <Button asChild className="w-full">
                <Link href="/api/subscription/checkout?plan=pro">
                  Upgrade to Pro
                </Link>
              </Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Billing Information</CardTitle>
              <CreditCard className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardDescription>Payment and billing details</CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Status</p>
                  <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                    {subscription.status}
                  </Badge>
                </div>
                {subscription.currentPeriodEnd && (
                  <div>
                    <p className="text-sm font-medium mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Next Billing Date
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium mb-1">Amount</p>
                  <p className="text-2xl font-bold">$29<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>No active subscription. Upgrade to Pro to unlock premium features.</span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/pricing">
                View All Plans
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {subscription && subscription.status === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Subscription</CardTitle>
            <CardDescription>Update or cancel your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">Cancel Subscription</p>
                  <p className="text-sm text-muted-foreground">
                    You'll continue to have access until the end of your current billing period.
                    Your account will then revert to the Free plan.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/api/subscription/portal">
                Manage Billing
              </Link>
            </Button>
            <Button variant="destructive" className="flex-1">
              Cancel Subscription
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>We're here to assist you</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Have questions about your subscription or need to make changes? 
            Our support team is ready to help.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/contact">
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pricing">
                View Pricing FAQ
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
