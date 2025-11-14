'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionGateProps {
  feature: string;
  description?: string;
  requiredTier?: 'pro' | 'enterprise';
  children?: React.ReactNode;
}

export function SubscriptionGate({
  feature,
  description,
  requiredTier = 'pro',
  children,
}: SubscriptionGateProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}</CardTitle>
        <CardDescription>
          {description || `Unlock ${feature} and more premium features`}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {children}
        <Button asChild size="lg" className="w-full">
          <Link href="/pricing">
            <Zap className="h-4 w-4 mr-2" />
            View Plans
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
