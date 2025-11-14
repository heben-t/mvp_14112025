import { prisma } from './db';

/**
 * Check if user has completed onboarding based on their role
 */
export async function hasCompletedOnboarding(userId: string, role: 'STARTUP' | 'INVESTOR'): Promise<boolean> {
  try {
    if (role === 'STARTUP') {
      const startupProfile = await prisma.startup_profiles.findUnique({
        where: { user_id: userId },
        select: { id: true },
      });
      return !!startupProfile;
    } else {
      const investorProfile = await prisma.investor_profiles.findUnique({
        where: { user_id: userId },
        select: { id: true },
      });
      return !!investorProfile;
    }
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Determine redirect URL after authentication based on user role and onboarding status
 */
export async function getPostAuthRedirectUrl(userId: string, role: 'STARTUP' | 'INVESTOR', isNewUser: boolean = false): Promise<string> {
  // All users (new and existing) go to onboarding page
  // The onboarding page will check if they've completed it and redirect to dashboard if needed
  return role === 'STARTUP' ? '/auth/onboarding/startup' : '/auth/onboarding/investor';
}
