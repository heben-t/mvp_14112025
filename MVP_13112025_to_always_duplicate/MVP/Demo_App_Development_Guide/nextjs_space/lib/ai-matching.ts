import OpenAI from 'openai';
import { prisma } from './db';

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  industry: string;
  stage: string;
  fundraisingGoal: number;
  equityOffered: number;
  minInvestment: number;
}

interface InvestorPreferences {
  minROIThreshold: number;
  preferredStages: string;
  sectorFilters: string;
  geographicPreferences: string;
}

export async function generateInvestorRecommendations(
  investorProfileId: string,
  limit: number = 10
): Promise<{ campaignId: string; score: number; reasoning: string }[]> {
  try {
    const investorProfile = await prisma.investor_profiles.findUnique({
      where: { id: investorProfileId },
      include: {
        investor_preferences: true,
      },
    });

    if (!investorProfile || !investorProfile.investor_preferences) {
      throw new Error('Investor profile or preferences not found');
    }

    const campaigns = await prisma.campaigns.findMany({
      where: {
        status: 'published',
      },
      include: {
        startup_profiles: {
          select: {
            companyName: true,
            industry: true,
            stage: true,
            description: true,
          },
        },
      },
      take: 50,
    });

    const preferences = investorProfile.investor_preferences;
    const preferredStages = preferences.preferredStages?.split(',') || [];
    const sectorFilters = preferences.sectorFilters?.split(',') || [];

    const scoredCampaigns = campaigns.map((campaign) => {
      let score = 0;

      if (preferredStages.includes(campaign.startup_profiles.stage)) {
        score += 30;
      }

      if (sectorFilters.includes(campaign.startup_profiles.industry)) {
        score += 25;
      }

      if (preferences.minROIThreshold && campaign.minInvestment <= preferences.minROIThreshold * 10000) {
        score += 20;
      }

      const fundingProgress = (campaign.currentRaised / campaign.fundraisingGoal) * 100;
      if (fundingProgress > 20 && fundingProgress < 80) {
        score += 15;
      }

      if (campaign.equityOffered >= 5) {
        score += 10;
      }

      return {
        campaignId: campaign.id,
        score,
        campaign,
      };
    });

    scoredCampaigns.sort((a, b) => b.score - a.score);

    const topCampaigns = scoredCampaigns.slice(0, limit);

    const recommendations = await Promise.all(
      topCampaigns.map(async ({ campaignId, score, campaign }) => {
        try {
          const prompt = `As an AI investment advisor, provide a brief 2-sentence reasoning for why this startup matches the investor's profile:

Investor Profile:
- Investment Focus: ${investorProfile.investmentFocus}
- Preferred Stages: ${preferences.preferredStages}
- Sector Interests: ${preferences.sectorFilters}
- Min ROI Threshold: ${preferences.minROIThreshold}%

Campaign:
- Title: ${campaign.title}
- Industry: ${campaign.startup_profiles.industry}
- Stage: ${campaign.startup_profiles.stage}
- Equity Offered: ${campaign.equityOffered}%
- Description: ${campaign.startup_profiles.description?.substring(0, 200) || 'No description available'}

Provide a concise, professional recommendation.`;

          const openai = getOpenAIClient();
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 150,
            temperature: 0.7,
          });

          const reasoning = completion.choices[0]?.message?.content || 'Strong match based on your preferences.';

          return {
            campaignId,
            score,
            reasoning,
          };
        } catch (error) {
          console.error('OpenAI error for campaign:', campaignId, error);
          return {
            campaignId,
            score,
            reasoning: 'This campaign matches your investment criteria and preferences.',
          };
        }
      })
    );

    return recommendations;
  } catch (error) {
    console.error('AI matching error:', error);
    throw error;
  }
}

export async function analyzeCampaignRisk(campaignId: string): Promise<{
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
}> {
  try {
    const campaign = await prisma.campaigns.findUnique({
      where: { id: campaignId },
      include: {
        startup_profiles: true,
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    let riskScore = 50;
    const factors: string[] = [];

    if (campaign.startup_profiles.stage === 'Pre-seed') {
      riskScore += 20;
      factors.push('Early stage startup (higher risk, higher potential)');
    } else if (campaign.startup_profiles.stage === 'Series A' || campaign.startup_profiles.stage === 'Series B') {
      riskScore -= 10;
      factors.push('Established funding stage (lower risk)');
    }

    const fundingProgress = (campaign.currentRaised / campaign.fundraisingGoal) * 100;
    if (fundingProgress < 10) {
      riskScore += 15;
      factors.push('Low funding traction');
    } else if (fundingProgress > 50) {
      riskScore -= 15;
      factors.push('Strong funding momentum');
    }

    if (campaign.equityOffered < 5) {
      riskScore += 10;
      factors.push('Lower equity offering');
    } else if (campaign.equityOffered > 15) {
      riskScore -= 10;
      factors.push('Generous equity offering');
    }

    if (!campaign.vslUrl) {
      riskScore += 5;
      factors.push('No video pitch available');
    }

    if (!campaign.pitchDeck) {
      riskScore += 5;
      factors.push('No pitch deck available');
    }

    riskScore = Math.max(0, Math.min(100, riskScore));

    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore < 40) {
      riskLevel = 'low';
    } else if (riskScore < 70) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    return {
      riskScore,
      riskLevel,
      factors,
    };
  } catch (error) {
    console.error('Risk analysis error:', error);
    throw error;
  }
}
