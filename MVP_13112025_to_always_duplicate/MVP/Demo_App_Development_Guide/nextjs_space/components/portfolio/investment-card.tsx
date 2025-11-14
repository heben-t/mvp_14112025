'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, DollarSign, TrendingUp, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Investment {
  id: string;
  amount: number;
  createdAt: string;
  campaigns: {
    id: string;
    title: string;
    equityOffered: number;
    startup_profiles: {
      companyName: string;
      industry: string;
      logo?: string;
      stage: string;
    };
  };
}

interface InvestmentCardProps {
  investment: Investment;
}

export function InvestmentCard({ investment }: InvestmentCardProps) {
  const router = useRouter();
  const investmentDate = new Date(investment.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {investment.campaigns.startup_profiles.logo ? (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={investment.campaigns.startup_profiles.logo}
                  alt={investment.campaigns.startup_profiles.companyName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">
                {investment.campaigns.startup_profiles.companyName}
              </CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {investment.campaigns.title}
              </p>
            </div>
          </div>
          <Badge variant="secondary">{investment.campaigns.startup_profiles.stage}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Investment</span>
            </div>
            <p className="text-xl font-bold">
              ${investment.amount.toLocaleString()}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Equity</span>
            </div>
            <p className="text-xl font-bold">
              {investment.campaigns.equityOffered}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
          <Calendar className="h-4 w-4" />
          <span>Invested on {investmentDate}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline">{investment.campaigns.startup_profiles.industry}</Badge>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/campaigns/${investment.campaigns.id}`)}
        >
          View Campaign
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
