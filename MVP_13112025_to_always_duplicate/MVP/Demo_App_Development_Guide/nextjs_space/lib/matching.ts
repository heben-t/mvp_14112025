interface InvestorProfile {
  id: string;
  investmentRange: string;
  preferredIndustries: string[];
  riskTolerance: string;
  investmentStage: string[];
}

interface Campaign {
  id: string;
  industry: string;
  stage: string;
  fundraisingGoal: number;
  minInvestment: number;
  equityOffered: number;
  currentAmount: number;
}

export function calculateMatchingScore(
  investor: InvestorProfile,
  campaign: Campaign
): number {
  let score = 0;
  let maxScore = 0;

  maxScore += 30;
  if (investor.preferredIndustries.includes(campaign.industry)) {
    score += 30;
  }

  maxScore += 25;
  if (investor.investmentStage.includes(campaign.stage)) {
    score += 25;
  }

  maxScore += 20;
  const [minRange, maxRange] = investor.investmentRange
    .replace(/[^0-9-]/g, '')
    .split('-')
    .map(Number);
  if (
    campaign.minInvestment >= minRange &&
    campaign.minInvestment <= maxRange
  ) {
    score += 20;
  } else if (campaign.minInvestment < minRange) {
    score += 10;
  }

  maxScore += 15;
  const fundingProgress = (campaign.currentAmount / campaign.fundraisingGoal) * 100;
  if (fundingProgress >= 20 && fundingProgress <= 80) {
    score += 15;
  } else if (fundingProgress < 20) {
    score += 10;
  } else {
    score += 5;
  }

  maxScore += 10;
  if (investor.riskTolerance === 'HIGH' && campaign.stage === 'Seed') {
    score += 10;
  } else if (investor.riskTolerance === 'MEDIUM' && campaign.stage === 'Series A') {
    score += 10;
  } else if (investor.riskTolerance === 'LOW' && campaign.stage === 'Series B') {
    score += 10;
  } else {
    score += 5;
  }

  return Math.round((score / maxScore) * 100);
}

export function getMatchReasons(
  investor: InvestorProfile,
  campaign: Campaign,
  score: number
): string[] {
  const reasons: string[] = [];

  if (investor.preferredIndustries.includes(campaign.industry)) {
    reasons.push(`Matches your ${campaign.industry} industry preference`);
  }

  if (investor.investmentStage.includes(campaign.stage)) {
    reasons.push(`${campaign.stage} stage aligns with your investment criteria`);
  }

  const [minRange, maxRange] = investor.investmentRange
    .replace(/[^0-9-]/g, '')
    .split('-')
    .map(Number);
  if (
    campaign.minInvestment >= minRange &&
    campaign.minInvestment <= maxRange
  ) {
    reasons.push(`Minimum investment fits your budget range`);
  }

  const fundingProgress = (campaign.currentAmount / campaign.fundraisingGoal) * 100;
  if (fundingProgress >= 20 && fundingProgress <= 80) {
    reasons.push(`Campaign has strong momentum (${fundingProgress.toFixed(0)}% funded)`);
  }

  if (score >= 80) {
    reasons.push('Excellent overall match for your portfolio');
  } else if (score >= 60) {
    reasons.push('Good fit for diversification');
  }

  return reasons;
}
