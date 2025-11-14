'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

function InvestmentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [investment, setInvestment] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/investments/verify?session_id=${sessionId}`);
      
      if (response.ok) {
        const data = await response.json();
        setInvestment(data.investment);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
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
          <CardTitle className="text-3xl">Investment Successful!</CardTitle>
          <CardDescription className="text-lg">
            Your investment has been processed successfully
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {investment && (
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Investment Amount</span>
                <span className="text-2xl font-bold">
                  ${investment.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Campaign</span>
                <span className="font-medium">{investment.campaign?.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                  Pending Approval
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-sm">{investment.id.slice(0, 8)}...</span>
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">1.</span>
                <span>The startup will review your investment within 24-48 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">2.</span>
                <span>You'll receive an email notification once they respond</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">3.</span>
                <span>If accepted, funds will be transferred to escrow</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">4.</span>
                <span>You can track your investment in your portfolio</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1"
              onClick={() => router.push('/dashboard/investor/investments')}
            >
              View Portfolio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/discover')}
            >
              Discover More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvestmentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <InvestmentSuccessContent />
    </Suspense>
  );
}
