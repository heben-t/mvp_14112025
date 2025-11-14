'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VSLPlayer } from './vsl-player';
import { VerificationBadge } from '../verification-badge';
import { InvestmentCalculator } from '../investments/investment-calculator';
import { DollarSign, Users, TrendingUp, Target } from 'lucide-react';

interface CampaignHeroProps {
  campaign: {
    id: string;
    title: string;
    vslUrl?: string | null;
    fundraisingGoal: number;
    currentRaised: number;
    equityOffered: number;
    valuation: number;
    minInvestment: number;
    maxInvestment?: number | null;
    interestedInvestors: number;
    startupProfile: {
      companyName: string;
      logo?: string | null;
      industry: string;
      stage: string;
      kycStatus: string;
    };
  };
  onInvest?: () => void;
}

export function CampaignHero({ campaign, onInvest }: CampaignHeroProps) {
  const fundingProgress = (campaign.currentRaised / campaign.fundraisingGoal) * 100;
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {campaign.startupProfile.logo && (
            <img
              src={campaign.startupProfile.logo}
              alt={campaign.startupProfile.companyName}
              className="h-16 w-16 rounded-lg object-cover"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{campaign.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-muted-foreground">
                {campaign.startupProfile.companyName}
              </p>
              <VerificationBadge status={campaign.startupProfile.kycStatus} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{campaign.startupProfile.industry}</Badge>
          <Badge variant="outline">{campaign.startupProfile.stage}</Badge>
        </div>
      </div>

      {campaign.vslUrl && (
        <VSLPlayer
          url={campaign.vslUrl}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="h-4 w-4" />
            <span className="text-sm">Goal</span>
          </div>
          <p className="text-2xl font-bold">
            ${campaign.fundraisingGoal.toLocaleString()}
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">Raised</span>
          </div>
          <p className="text-2xl font-bold">
            ${campaign.currentRaised.toLocaleString()}
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Equity</span>
          </div>
          <p className="text-2xl font-bold">{campaign.equityOffered}%</p>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">Investors</span>
          </div>
          <p className="text-2xl font-bold">{campaign.interestedInvestors}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Funding Progress</span>
          <span className="font-medium">{fundingProgress.toFixed(1)}%</span>
        </div>
        <Progress value={fundingProgress} className="h-2" />
      </div>

      {onInvest && (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div>
            <p className="font-medium">Ready to invest?</p>
            <p className="text-sm text-muted-foreground">
              Minimum investment: ${campaign.minInvestment.toLocaleString()}
              {campaign.maxInvestment &&
                ` - Maximum: $${campaign.maxInvestment.toLocaleString()}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="lg" variant="outline" onClick={() => setShowCalculator(true)}>
              Calculate Returns
            </Button>
            <Button size="lg" onClick={onInvest}>
              Invest Now
            </Button>
          </div>
        </div>
      )}

      {/* Investment Calculator Dialog */}
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Investment Calculator</DialogTitle>
          </DialogHeader>
          <InvestmentCalculator
            campaignId={campaign.id}
            equityOffered={campaign.equityOffered}
            valuation={campaign.valuation}
            fundraisingGoal={campaign.fundraisingGoal}
            defaultAmount={campaign.minInvestment}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
