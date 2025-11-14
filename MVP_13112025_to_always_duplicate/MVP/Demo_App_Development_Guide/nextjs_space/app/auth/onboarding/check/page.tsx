'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export default function OnboardingCheckPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function checkAndRedirect() {
      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/auth/signin');
          return;
        }

        // Get user details from public.users
        const { data: user } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', session.user.id)
          .single();

        if (!user) {
          router.push('/auth/signin');
          return;
        }

        const userRole = user.role;
        
        // Redirect to appropriate onboarding page
        if (userRole === 'STARTUP') {
          router.push('/auth/onboarding/startup');
        } else {
          router.push('/auth/onboarding/investor');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        router.push('/auth/signin');
      }
    }

    checkAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
