import { getCurrentUser } from '@/lib/auth';
import { authOptions } from './auth';
import { prisma } from './prisma';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface SubscriptionCheck {
  hasAccess: boolean;
  tier: SubscriptionTier;
  reason?: string;
}

export async function checkSubscription(userId: string): Promise<SubscriptionCheck> {
  try {
    const subscription = await prisma.subscriptions.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      return {
        hasAccess: false,
        tier: 'free',
        reason: 'No active subscription found',
      };
    }

    if (subscription.currentPeriodEnd && new Date() > subscription.currentPeriodEnd) {
      return {
        hasAccess: false,
        tier: 'free',
        reason: 'Subscription expired',
      };
    }

    return {
      hasAccess: true,
      tier: (subscription.tier?.toLowerCase() as SubscriptionTier) || 'free',
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      hasAccess: false,
      tier: 'free',
      reason: 'Error checking subscription',
    };
  }
}

export async function requireSubscription(
  minTier: SubscriptionTier = 'pro'
): Promise<SubscriptionCheck> {
  const user = await getCurrentUser();

  if (!session?.user?.id) {
    return {
      hasAccess: false,
      tier: 'free',
      reason: 'Not authenticated',
    };
  }

  const check = await checkSubscription(user.id);

  const tierLevels = {
    free: 0,
    pro: 1,
    enterprise: 2,
  };

  const hasRequiredTier = tierLevels[check.tier] >= tierLevels[minTier];

  return {
    ...check,
    hasAccess: check.hasAccess && hasRequiredTier,
    reason: hasRequiredTier ? check.reason : `Requires ${minTier} subscription`,
  };
}

export async function checkInvestmentLimit(userId: string): Promise<{
  canInvest: boolean;
  investmentCount: number;
  limit: number;
  reason?: string;
}> {
  const subscriptionCheck = await checkSubscription(userId);

  const investmentCount = await prisma.investments.count({
    where: {
      investorProfileId: userId,
      status: 'ACCEPTED',
      createdAt: {
        gte: new Date(new Date().getFullYear(), 0, 1),
      },
    },
  });

  if (subscriptionCheck.tier === 'free') {
    const limit = 3;
    return {
      canInvest: investmentCount < limit,
      investmentCount,
      limit,
      reason: investmentCount >= limit ? 'Free tier limit reached (3 investments/year)' : undefined,
    };
  }

  return {
    canInvest: true,
    investmentCount,
    limit: -1,
  };
}

export function getFeatureAccess(tier: SubscriptionTier) {
  const features = {
    free: {
      maxInvestmentsPerYear: 3,
      advancedAnalytics: false,
      aiRecommendations: false,
      prioritySupport: false,
      priorityDealFlow: false,
      customReporting: false,
      apiAccess: false,
    },
    pro: {
      maxInvestmentsPerYear: -1,
      advancedAnalytics: true,
      aiRecommendations: true,
      prioritySupport: true,
      priorityDealFlow: true,
      customReporting: false,
      apiAccess: false,
    },
    enterprise: {
      maxInvestmentsPerYear: -1,
      advancedAnalytics: true,
      aiRecommendations: true,
      prioritySupport: true,
      priorityDealFlow: true,
      customReporting: true,
      apiAccess: true,
    },
  };

  return features[tier] || features.free;
}

// Alias for feature access check
export async function checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const check = await checkSubscription(userId);
  const access = getFeatureAccess(check.tier);
  return (access as any)[feature] || false;
}
