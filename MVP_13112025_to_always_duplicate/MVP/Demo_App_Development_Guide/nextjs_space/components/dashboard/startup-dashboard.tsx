'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, DollarSign, Users, Eye, Rocket, Target, BarChart3, Calendar, ArrowUpRight, Activity, Zap } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  campaign_objective: string | null;
  current_raised: string;
  status: string;
  created_at: Date;
  view_count: number | null;
  startup_profile_id?: string;
  _count: {
    investments: number;
  };
}

export default function StartupDashboard({ user }: { user: any }) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalInvestors: 0,
    activeCampaigns: 0,
    avgConsolidatedROI: 0,
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      const data = await response.json();
      setCampaigns(data.campaigns || []);
      
      const totalRaised = data.campaigns?.reduce((sum: number, c: Campaign) => sum + Number(c.current_raised || 0), 0) || 0;
      const totalInvestors = data.campaigns?.reduce((sum: number, c: Campaign) => sum + c._count.investments, 0) || 0;
      const activeCampaigns = data.campaigns?.filter((c: Campaign) => c.status === 'published').length || 0;
      
      // Fetch average Consolidated_AI_Impact from all campaigns' metrics
      let avgConsolidatedROI = 0;
      if (data.campaigns && data.campaigns.length > 0) {
        // Get unique startup profile IDs
        const startupProfileIds = [...new Set(data.campaigns.map((c: any) => c.startup_profile_id).filter(Boolean))];
        
        if (startupProfileIds.length > 0) {
          const metricsPromises = startupProfileIds.map((id: string) => 
            fetch(`/api/metrics/${id}`).then(res => res.json()).catch(() => null)
          );
          const metricsResults = await Promise.all(metricsPromises);
          const consolidatedImpacts = metricsResults
            .filter(m => m && m.Consolidated_AI_Impact !== null)
            .map(m => m.Consolidated_AI_Impact);
          
          if (consolidatedImpacts.length > 0) {
            avgConsolidatedROI = consolidatedImpacts.reduce((sum: number, val: number) => sum + val, 0) / consolidatedImpacts.length;
          }
        }
      }
      
      setStats({ totalRaised, totalInvestors, activeCampaigns, avgConsolidatedROI });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Startup Dashboard
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Welcome back, {user.name}
            </p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/startup/campaigns/create')} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all h-12"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Raised</CardTitle>
              <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${stats.totalRaised.toLocaleString()}</div>
              <p className="text-xs text-blue-100 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Across all campaigns
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Total Investors</CardTitle>
              <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalInvestors}</div>
              <p className="text-xs text-purple-100 mt-2 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Unique backers
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100">Active Campaigns</CardTitle>
              <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Rocket className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeCampaigns}</div>
              <p className="text-xs text-emerald-100 mt-2 flex items-center gap-1">
                <Target className="h-3 w-3" />
                Currently live
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Consolidated AI Impact</CardTitle>
              <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.avgConsolidatedROI.toFixed(2)}%
              </div>
              <p className="text-xs text-orange-100 mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                 Trend
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group bg-white">
            <CardHeader onClick={() => router.push('/dashboard/startup/campaigns')}>
              <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">View All Campaigns</CardTitle>
              <CardDescription className="mt-2">
                Manage and track all your fundraising campaigns
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer group bg-white">
            <CardHeader onClick={() => router.push('/dashboard/startup/campaigns/create')}>
              <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Create Campaign</CardTitle>
              <CardDescription className="mt-2">
                Launch a new fundraising campaign for your startup
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer group bg-white">
            <CardHeader onClick={() => router.push('/dashboard/startup/profile')}>
              <div className="h-12 w-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">Update Profile</CardTitle>
              <CardDescription className="mt-2">
                Keep your company information up to date
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Campaigns */}
        <Card className="border-none shadow-xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-slate-50 to-blue-50">
            <div>
              <CardTitle className="text-2xl">Recent Campaigns</CardTitle>
              <CardDescription className="mt-1">Your latest fundraising campaigns</CardDescription>
            </div>
            <Button variant="outline" asChild className="border-blue-200 hover:bg-blue-50">
              <div onClick={() => router.push('/dashboard/startup/campaigns')}>
                View All
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </div>
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading campaigns...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Rocket className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Create your first campaign to start raising funds and connecting with investors
                </p>
                <Button 
                  onClick={() => router.push('/dashboard/startup/campaigns/create')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Campaign
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => {
                  const currentRaised = Number(campaign.current_raised || 0);
                  
                  return (
                    <div
                      key={campaign.id}
                      className="border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer bg-gradient-to-br from-white to-slate-50"
                      onClick={() => router.push(`/dashboard/startup/campaigns/${campaign.id}`)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-900 mb-1">{campaign.title}</h3>
                          {campaign.campaign_objective && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-1">{campaign.campaign_objective}</p>
                          )}
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Created {new Date(campaign.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          className={
                            campaign.status === 'published'
                              ? 'bg-green-100 text-green-700 hover:bg-green-100'
                              : campaign.status === 'draft'
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                              : 'bg-red-100 text-red-700 hover:bg-red-100'
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <p className="text-xs text-gray-600 mb-1">Raised</p>
                          <p className="font-bold text-lg text-green-600">
                            ${currentRaised.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <p className="text-xs text-gray-600 mb-1">Investors</p>
                          <p className="font-bold text-lg text-purple-600">{campaign._count.investments}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <p className="text-xs text-gray-600 mb-1">Views</p>
                          <p className="font-bold text-lg text-blue-600">{campaign.view_count || 0}</p>
                        </div>
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/roi/${campaign.id}`);
                          }}
                          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200 hover:border-blue-400 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-blue-600 font-semibold">ROI Analysis</p>
                            <BarChart3 className="h-3 w-3 text-blue-600 group-hover:scale-110 transition-transform" />
                          </div>
                          <p className="font-bold text-lg text-blue-600">View Report</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/startup/campaigns/${campaign.id}`);
                          }}
                          className="border-blue-200 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {campaign.status === 'draft' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/startup/campaigns/${campaign.id}/edit`);
                            }}
                            className="border-purple-200 hover:bg-purple-50"
                          >
                            Edit
                          </Button>
                        )}
                        {campaign.status === 'published' && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/campaigns/${campaign.id}`);
                            }}
                            className="bg-gradient-to-r from-blue-600 to-purple-600"
                          >
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            View Public Page
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
