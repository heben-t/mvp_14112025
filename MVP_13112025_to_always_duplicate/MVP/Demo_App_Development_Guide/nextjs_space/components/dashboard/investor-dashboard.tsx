'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, DollarSign, Briefcase, Filter, Sparkles, Star, ArrowUpRight, Activity, Zap, TrendingDown, PieChart, Wallet } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  campaign_objective: string | null;
  current_raised: string;
  status: string;
  startup_profiles: {
    companyName: string;
    logo: string | null;
    industry: string;
    stage: string;
  };
  _count: {
    investments: number;
  };
  view_count: number | null;
}

export default function InvestorDashboard({ user }: { user: any }) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [investments, setInvestments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalInvested: 0,
    activeInvestments: 0,
    portfolioValue: 0,
    avgROI: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [searchQuery, campaigns]);

  const fetchData = async () => {
    try {
      const [campaignsRes, investmentsRes] = await Promise.all([
        fetch('/api/campaigns/published'),
        fetch('/api/investments'),
      ]);

      const campaignsData = await campaignsRes.json();
      const investmentsData = await investmentsRes.json();

      setCampaigns(campaignsData.campaigns || []);
      setFilteredCampaigns(campaignsData.campaigns || []);
      setInvestments(investmentsData.investments || []);

      const totalInvested = investmentsData.investments?.reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0;
      const activeInvestments = investmentsData.investments?.filter((inv: any) => inv.status === 'COMPLETED').length || 0;
      
      // Fetch startup metrics for invested campaigns to calculate avg ROI
      let avgROI = 0;
      if (investmentsData.investments && investmentsData.investments.length > 0) {
        const startupProfileIds = investmentsData.investments
          .map((inv: any) => inv.campaigns?.startup_profiles?.id)
          .filter(Boolean);
        if (startupProfileIds.length > 0) {
          const metricsPromises = startupProfileIds.map((id: string) => 
            fetch(`/api/metrics/${id}`).then(res => res.json()).catch(() => null)
          );
          const metricsResults = await Promise.all(metricsPromises);
          const consolidatedImpacts = metricsResults
            .filter(m => m && m.Consolidated_AI_Impact !== null)
            .map(m => m.Consolidated_AI_Impact);
          if (consolidatedImpacts.length > 0) {
            avgROI = consolidatedImpacts.reduce((sum: number, val: number) => sum + val, 0) / consolidatedImpacts.length;
          }
        }
      }

      setStats({
        totalInvested,
        activeInvestments,
        portfolioValue: totalInvested * 1.15,
        avgROI,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCampaigns = () => {
    if (!searchQuery.trim()) {
      setFilteredCampaigns(campaigns);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = campaigns.filter(
      (campaign) =>
        campaign.title.toLowerCase().includes(query) ||
        campaign.startup_profiles.companyName.toLowerCase().includes(query) ||
        campaign.startup_profiles.industry.toLowerCase().includes(query)
    );
    setFilteredCampaigns(filtered);
  };

  const getROI = (campaign: Campaign) => {
    return campaign.startupProfile.metrics[0]?.roi || 0;
  };

  const getVerificationLevel = (campaign: Campaign) => {
    return campaign.startupProfile.metrics[0]?.verificationLevel || 'SELF_REPORTED';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Investor Dashboard
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Welcome back, {user.name}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Total Invested</CardTitle>
              <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${stats.totalInvested.toLocaleString()}</div>
              <p className="text-xs text-purple-100 mt-2 flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                Across {stats.activeInvestments} investments
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100">Portfolio Value</CardTitle>
              <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${stats.portfolioValue.toLocaleString()}</div>
              <p className="text-xs text-emerald-100 mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +15% estimated growth
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Active Investments</CardTitle>
              <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeInvestments}</div>
              <p className="text-xs text-blue-100 mt-2 flex items-center gap-1">
                <PieChart className="h-3 w-3" />
                In your portfolio
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Avg. ROI</CardTitle>
              <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgROI.toFixed(2)}%</div>
              <p className="text-xs text-orange-100 mt-2 flex items-center gap-1">
                <Star className="h-3 w-3" />
                Based on your investments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Discover Campaigns Section */}
        <Card className="border-none shadow-xl bg-white">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-purple-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  Discover Campaigns
                </CardTitle>
                <CardDescription className="mt-1">Browse verified AI startup opportunities</CardDescription>
              </div>
              <Button variant="outline" className="border-purple-200 hover:bg-purple-50 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search campaigns, companies, or industries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-2 focus:border-purple-300"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading opportunities...</p>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map((campaign) => {
                  const currentRaised = Number(campaign.current_raised || 0);
                  
                  return (
                    <div
                      key={campaign.id}
                      className="border-2 border-gray-100 rounded-xl p-6 hover:shadow-xl hover:border-purple-200 transition-all cursor-pointer bg-gradient-to-br from-white to-slate-50 group"
                      onClick={() => router.push(`/campaigns/${campaign.id}`)}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        {campaign.startup_profiles.logo ? (
                          <img
                            src={campaign.startup_profiles.logo}
                            alt={campaign.startup_profiles.companyName}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                            {campaign.startup_profiles.companyName.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                            {campaign.startup_profiles.companyName}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-1">{campaign.title}</p>
                        </div>
                      </div>

                      {campaign.campaign_objective && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {campaign.campaign_objective}
                        </p>
                      )}

                      <div className="flex gap-2 mb-4">
                        <Badge variant="outline" className="border-purple-200 text-purple-700 text-xs">
                          {campaign.startup_profiles.industry}
                        </Badge>
                        <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                          {campaign.startup_profiles.stage}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                          <p className="text-xs text-gray-600 mb-1">Raised</p>
                          <p className="font-bold text-sm text-green-600">${(currentRaised / 1000).toFixed(0)}K</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                          <p className="text-xs text-gray-600 mb-1">Investors</p>
                          <p className="font-bold text-sm text-purple-600">{campaign._count.investments}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                          <p className="text-xs text-gray-600 mb-1">Views</p>
                          <p className="font-bold text-sm text-blue-600">{campaign.view_count || 0}</p>
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 group-hover:shadow-lg transition-all" size="sm">
                        View Campaign
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Your Investments Section */}
        {investments.length > 0 && (
          <Card className="border-none shadow-xl bg-white">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">Your Investments</CardTitle>
                  <CardDescription className="mt-1">Track your portfolio performance</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/portfolio')}
                  className="border-blue-200 hover:bg-blue-50"
                >
                  View All
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {investments.slice(0, 5).map((investment) => (
                  <div 
                    key={investment.id} 
                    className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all bg-gradient-to-br from-white to-slate-50"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900">{investment.campaign.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {investment.campaign.startupProfile.user.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-600 mb-1">Invested</p>
                        <p className="font-bold text-xl text-gray-900">${investment.amount.toLocaleString()}</p>
                      </div>
                      <Badge
                        className={
                          investment.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                        }
                      >
                        {investment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
