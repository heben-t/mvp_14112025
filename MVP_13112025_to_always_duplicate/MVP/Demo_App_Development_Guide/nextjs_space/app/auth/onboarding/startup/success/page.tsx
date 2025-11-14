'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function StartupOnboardingSuccessPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<'plugin' | 'manual' | null>(null);
  
  useEffect(() => {
    async function completeOnboarding() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/auth/signin');
          return;
        }

        // Get startup profile
        const { data: profile } = await supabase
          .from('startup_profiles')
          .select('dataMigrationMethod, onboardingComplete')
          .eq('userId', session.user.id)
          .single();

        if (!profile) {
          router.push('/auth/onboarding/startup');
          return;
        }

        setSelectedMethod(profile.dataMigrationMethod as 'plugin' | 'manual');

        // Mark onboarding as complete
        if (!profile.onboardingComplete) {
          await supabase
            .from('startup_profiles')
            .update({
              onboardingComplete: true,
              updatedAt: new Date().toISOString(),
            })
            .eq('userId', session.user.id);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error completing onboarding:', error);
        setLoading(false);
      }
    }

    completeOnboarding();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            HEBED AI
          </span>
        </Link>
      </div>

      {/* Success Content */}
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <Card className="w-full max-w-3xl border-none shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Thanks for submitting — we'll schedule your onboarding call
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <p className="text-gray-800 font-semibold mb-4">
                Please {selectedMethod === 'plugin' ? 'make sure to have the requirements below ready before the call' : 'prepare a .csv file containing the following metrics'}:
              </p>

              {selectedMethod === 'manual' && (
                <div className="mb-4">
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    asChild
                  >
                    <a href="/hebed_ai_manual_metrics_template.csv" download>
                      <span className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Download Template CSV
                      </span>
                      <ArrowRight className="h-5 w-5" />
                    </a>
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Finance</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li><code className="bg-white px-2 py-0.5 rounded">MRR_now</code>, <code className="bg-white px-2 py-0.5 rounded">MRR_prev</code>, <code className="bg-white px-2 py-0.5 rounded">ARR = 12 × MRR_now</code></li>
                    <li><code className="bg-white px-2 py-0.5 rounded">churn_rate</code>, <code className="bg-white px-2 py-0.5 rounded">active_customers</code></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Technology <span className="text-sm font-normal text-gray-600">(answered manually on the call)</span></h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>Use of AI: <strong>HR, FINANCE, LAW, COMPLIANCE, ALL, OPERATIONS, OTHER</strong></li>
                    <li>What does AI improve the most? <strong>Speed/Productivity, Accuracy, Cost Reduction, Decision-Making</strong></li>
                    <li>AI/ML model in production or accessible via API? <strong>Yes / No</strong></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Industry</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li><code className="bg-white px-2 py-0.5 rounded">activeUsers_now</code>, <code className="bg-white px-2 py-0.5 rounded">activeUsers_prev</code></li>
                    <li><code className="bg-white px-2 py-0.5 rounded">engagementRate</code>, <code className="bg-white px-2 py-0.5 rounded">returningUsers</code></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Community & Engagement (Social)</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li><code className="bg-white px-2 py-0.5 rounded">followers_count</code>, <code className="bg-white px-2 py-0.5 rounded">team_years_experience</code></li>
                    <li><code className="bg-white px-2 py-0.5 rounded">mentions_count</code> <span className="text-gray-600">(funded / incubated / featured)</span></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-center text-gray-600 mb-4">
                In the meantime, you can explore the public campaigns
              </p>
              <Button
                className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => router.push('/coming-soon')}
              >
                Explore Campaigns
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
