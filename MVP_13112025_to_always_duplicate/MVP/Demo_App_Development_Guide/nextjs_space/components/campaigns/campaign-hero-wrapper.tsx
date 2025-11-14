'use client';

import { useState } from 'react';
import { CampaignHero } from './campaign-hero';
import { InvestmentModal } from '../investments/investment-modal';

interface CampaignHeroWrapperProps {
  campaign: any;
}

export function CampaignHeroWrapper({ campaign }: CampaignHeroWrapperProps) {
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);

  return (
    <>
      <CampaignHero
        campaign={campaign}
        onInvest={() => setShowInvestmentModal(true)}
      />
      <InvestmentModal
        open={showInvestmentModal}
        onOpenChange={setShowInvestmentModal}
        campaign={campaign}
      />
    </>
  );
}
