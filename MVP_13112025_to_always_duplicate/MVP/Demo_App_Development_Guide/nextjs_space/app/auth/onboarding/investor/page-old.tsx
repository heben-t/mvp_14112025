'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { InvestorWizard } from '@/components/onboarding/investor-wizard';

export default function InvestorOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isChecking, setIsChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/auth/signin');
          return;
        }

        // Get user from database
        const { data: user } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', session.user.id)
          .single();
      
        if (!user || user.role !== 'INVESTOR') {
          router.push('/auth/signin');
          return;
        }

        setUserId(user.id);

        // Check if user already has an investor profile
        const { data: profile } = await supabase
          .from('investor_profiles')
          .select('onboardingComplete')
          .eq('userId', user.id)
          .single();

        if (profile?.onboardingComplete) {
          // Already completed onboarding - redirect to dashboard
          router.push('/dashboard/investor');
        } else {
          // Not completed - show onboarding form
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to Hebed AI</h1>
          <p className="text-muted-foreground mt-2">
            Let's set up your investor profile to start discovering opportunities
          </p>
        </div>
        <InvestorWizard />
      </div>
    </div>
  );
}
