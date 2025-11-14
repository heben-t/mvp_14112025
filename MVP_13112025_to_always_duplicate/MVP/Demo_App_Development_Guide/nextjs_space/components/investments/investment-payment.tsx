'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm({ investmentId, onSuccess }: { investmentId: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/invest/${investmentId}/success`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={!stripe || loading} 
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Complete Investment'
        )}
      </Button>

      <p className="text-xs text-gray-600 text-center">
        Your payment is secured by Stripe. You will receive a confirmation email after successful payment.
      </p>
    </form>
  );
}

export default function InvestmentPayment({ 
  investmentId, 
  clientSecret,
  user 
}: { 
  investmentId: string; 
  clientSecret: string;
  user: any;
}) {
  const router = useRouter();
  const [investment, setInvestment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetchInvestment();
  }, [investmentId]);

  const fetchInvestment = async () => {
    try {
      const response = await fetch(`/api/investments/${investmentId}`);
      if (response.ok) {
        const data = await response.json();
        setInvestment(data.investment);
      }
    } catch (error) {
      console.error('Error fetching investment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!investment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Investment Not Found</h1>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your investment of ${investment.amount.toLocaleString()} has been processed successfully.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Investment</h1>
          <p className="text-gray-600 mt-1">Secure payment powered by Stripe</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Enter your payment information to complete the investment</CardDescription>
              </CardHeader>
              <CardContent>
                <Elements 
                  stripe={stripePromise} 
                  options={{ 
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                    },
                  }}
                >
                  <PaymentForm investmentId={investmentId} onSuccess={handlePaymentSuccess} />
                </Elements>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Investment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Campaign</p>
                  <p className="font-semibold">{investment.campaign.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-semibold">{investment.campaign.startupProfile.companyName}</p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">Investment Amount</p>
                  <p className="text-2xl font-bold">${investment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Equity</p>
                  <p className="font-semibold">
                    {((investment.amount / investment.campaign.fundraisingGoal) * investment.campaign.equityOffered).toFixed(4)}%
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-600">
                    By completing this investment, you agree to the terms and conditions of the campaign.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
