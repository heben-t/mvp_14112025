import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Building2, TrendingUp, Users, DollarSign } from 'lucide-react';

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    fundraisingGoal: number;
    currentRaised: number;
    equityOffered: number;
    minInvestment: number;
    status: string;
    viewCount: number;
    investorCount: number;
    startup_profiles: {
      companyName: string;
      industry: string;
      stage: string;
      logo: string | null;
    };
  };
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const fundingProgress = (campaign.currentRaised / campaign.fundraisingGoal) * 100;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {campaign.startup_profiles.logo ? (
              <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <Image
                  src={campaign.startup_profiles.logo}
                  alt={campaign.startup_profiles.companyName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg truncate">{campaign.title}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {campaign.startup_profiles.companyName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Badge variant="secondary">{campaign.startup_profiles.industry}</Badge>
          <Badge variant="outline">{campaign.startup_profiles.stage}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Raised</span>
            <span className="font-semibold">
              ${campaign.currentRaised.toLocaleString()} / ${campaign.fundraisingGoal.toLocaleString()}
            </span>
          </div>
          <Progress value={fundingProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {fundingProgress.toFixed(1)}% funded
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs font-medium">{campaign.equityOffered}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Equity</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <Users className="h-3 w-3" />
              <span className="text-xs font-medium">{campaign.investorCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Investors</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <DollarSign className="h-3 w-3" />
              <span className="text-xs font-medium">${(campaign.minInvestment / 1000).toFixed(0)}K</span>
            </div>
            <p className="text-xs text-muted-foreground">Min</p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/campaigns/${campaign.id}`}>
            View Campaign
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
