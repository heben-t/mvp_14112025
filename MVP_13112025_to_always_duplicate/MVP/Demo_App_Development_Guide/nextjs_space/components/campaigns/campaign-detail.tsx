'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactPlayer from 'react-player';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerificationBadge } from '@/components/verification-badge';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  Building2, 
  Target,
  Heart,
  Share2,
  FileText
} from 'lucide-react';

interface CampaignData {
  id: string;
  title: string;
  vslUrl: string;
  pitchDeck: string;
  fundraisingGoal: number;
  currentAmount: number;
  equityOffered: number;
  valuation: number;
  minInvestment: number;
  maxInvestment: number;
  status: string;
  createdAt: string;
  startupProfile: {
    companyName: string;
    industry: string;
    stage: string;
    description: string;
    foundedYear: number;
    teamSize: number;
    website: string;
    user: {
      name: string;
      email: string;
    };
    metrics: Array<{
      verificationLevel: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'SELF_REPORTED';
      roi: number;
      revenue: number;
      growth: number;
      customers: number;
    }>;
  };
  _count: {
    investments: number;
  };
}

export default function CampaignDetail({ campaignId, user }: { campaignId: string; user: any }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (response.ok) {
        const data = await response.json();
        setCampaign(data.campaign);
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async () => {
    if (!investmentAmount || isNaN(Number(investmentAmount))) {
      alert('Please enter a valid amount');
      return;
    }

    const amount = Number(investmentAmount);
    if (campaign && amount < campaign.minInvestment) {
      alert(`Minimum investment is $${campaign.minInvestment.toLocaleString()}`);
      return;
    }

    if (campaign?.maxInvestment && amount > campaign.maxInvestment) {
      alert(`Maximum investment is $${campaign.maxInvestment.toLocaleString()}`);
      return;
    }

    setIsInvesting(true);
    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          amount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/dashboard/invest/${data.investment.id}?clientSecret=${data.clientSecret}`);
      } else {
        alert(data.error || 'Failed to create investment');
      }
    } catch (error) {
      console.error('Error creating investment:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const metrics = campaign.startupProfile.metrics[0];
  const progressPercentage = Math.min(((campaign.currentAmount || 0) / campaign.fundraisingGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          ← Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl mb-2">{campaign.title}</CardTitle>
                    <CardDescription className="text-lg">
                      {campaign.startupProfile.companyName}
                    </CardDescription>
                  </div>
                  {metrics && <VerificationBadge level={metrics.verificationLevel} />}
                </div>
                <div className="flex gap-2 mt-4">
                  <Badge variant="outline">{campaign.startupProfile.industry}</Badge>
                  <Badge variant="outline">{campaign.startupProfile.stage}</Badge>
                  <Badge className="bg-green-100 text-green-800">{campaign.status}</Badge>
                </div>
              </CardHeader>
            </Card>

            {campaign.vslUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Video Pitch</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <ReactPlayer
                      url={campaign.vslUrl}
                      width="100%"
                      height="100%"
                      controls
                      config={{
                        youtube: {
                          playerVars: { showinfo: 1 }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>About the Company</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{campaign.startupProfile.description || 'No description available.'}</p>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Founded</p>
                          <p className="font-semibold">{campaign.startupProfile.foundedYear || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Team Size</p>
                          <p className="font-semibold">{campaign.startupProfile.teamSize || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Industry</p>
                          <p className="font-semibold">{campaign.startupProfile.industry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Stage</p>
                          <p className="font-semibold">{campaign.startupProfile.stage}</p>
                        </div>
                      </div>
                    </div>

                    {campaign.startupProfile.website && (
                      <div className="pt-4 border-t">
                        <a
                          href={campaign.startupProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit Website →
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metrics">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Verified financial and operational data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {metrics ? (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <p className="text-sm text-gray-600">ROI</p>
                          </div>
                          <p className="text-3xl font-bold text-green-600">{metrics.roi}%</p>
                        </div>
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                            <p className="text-sm text-gray-600">Revenue</p>
                          </div>
                          <p className="text-3xl font-bold">${metrics.revenue?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                            <p className="text-sm text-gray-600">Growth Rate</p>
                          </div>
                          <p className="text-3xl font-bold">{metrics.growth || 0}%</p>
                        </div>
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-5 w-5 text-orange-600" />
                            <p className="text-sm text-gray-600">Customers</p>
                          </div>
                          <p className="text-3xl font-bold">{metrics.customers?.toLocaleString() || 'N/A'}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">No metrics available yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team">
                <Card>
                  <CardHeader>
                    <CardTitle>Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                          {campaign.startupProfile.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{campaign.startupProfile.user.name}</p>
                          <p className="text-sm text-gray-600">Founder & CEO</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {campaign.pitchDeck && (
              <Card>
                <CardHeader>
                  <CardTitle>Pitch Deck</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={campaign.pitchDeck} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2" />
                      View Pitch Deck
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Investment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-semibold">{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600">
                      ${(campaign.currentAmount || 0).toLocaleString()} raised
                    </span>
                    <span className="text-sm text-gray-600">
                      ${campaign.fundraisingGoal.toLocaleString()} goal
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y">
                  <div>
                    <p className="text-sm text-gray-600">Valuation</p>
                    <p className="font-bold text-lg">${campaign.valuation.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Equity</p>
                    <p className="font-bold text-lg">{campaign.equityOffered}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Min Investment</p>
                    <p className="font-bold text-lg">${campaign.minInvestment.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Investors</p>
                    <p className="font-bold text-lg">{campaign._count.investments}</p>
                  </div>
                </div>

                {user.role === 'INVESTOR' && campaign.status === 'published' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Investment Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value)}
                          placeholder={campaign.minInvestment.toString()}
                          className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min={campaign.minInvestment}
                          max={campaign.maxInvestment}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Min: ${campaign.minInvestment.toLocaleString()}
                        {campaign.maxInvestment && ` • Max: $${campaign.maxInvestment.toLocaleString()}`}
                      </p>
                    </div>

                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleInvest}
                      disabled={isInvesting}
                    >
                      {isInvesting ? 'Processing...' : 'Invest Now'}
                    </Button>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Heart className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                )}

                {user.role === 'STARTUP' && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">You are viewing your own campaign</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => router.push(`/dashboard/campaigns/${campaign.id}/edit`)}
                    >
                      Edit Campaign
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
