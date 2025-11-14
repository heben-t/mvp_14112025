'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      verifySubscription(sessionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const verifySubscription = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/subscription/verify?session_id=${sessionId}`);
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error verifying subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl">Welcome Aboard!</CardTitle>
          <CardDescription className="text-lg">
            Your subscription is now active
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {subscription && (
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Plan</span>
                <span className="text-xl font-bold capitalize">
                  {subscription.tier.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Next Billing Date</span>
                <span className="font-medium">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">What's next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Explore all available campaigns and investment opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Set up your investment preferences for better recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Track your portfolio and monitor performance metrics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Manage your subscription anytime from your account settings</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1"
              onClick={() => router.push('/discover')}
            >
              Start Exploring
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
