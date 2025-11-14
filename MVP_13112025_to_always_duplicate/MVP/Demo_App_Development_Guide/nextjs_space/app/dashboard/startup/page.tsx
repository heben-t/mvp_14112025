

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { DollarSign, Users, TrendingUp, Eye, Plus, Rocket, Target, BarChart3 } from 'lucide-react';

async function getStartupData(userId: string) {
  const startupProfile = await prisma.startup_profiles.findUnique({
    where: { userId },
    include: {
      campaigns: {
        include: {
          _count: {
            select: { investments: true },
          },
        },
        orderBy: { created_at: 'desc' },
        take: 5,
      },
    },
  });

  return startupProfile;
}

export default async function StartupDashboardPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect('/auth/signin');
  }

  if (user.role !== 'STARTUP') {
    redirect('/dashboard');
  }

  const startupProfile = await getStartupData(user.id);

  if (!startupProfile) {
    redirect('/auth/onboarding/startup');
  }

  const totalRaised = startupProfile.campaigns.reduce(
    (sum, campaign) => sum + Number(campaign.current_raised || 0),
    0
  );

  const totalInvestors = startupProfile.campaigns.reduce(
    (sum, campaign) => sum + campaign._count.investments,
    0
  );

  const totalViews = startupProfile.campaigns.reduce(
    (sum, campaign) => sum + (campaign.view_count || 0),
    0
  );

  const activeCampaigns = startupProfile.campaigns.filter(
    (c) => c.status === 'published'
  ).length;

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {startupProfile.companyName}!</h1>
            <p className="text-muted-foreground mt-2">
              Here's what's happening with your fundraising campaigns
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard/startup/campaigns/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRaised.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInvestors}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Unique backers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Campaign visibility
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Rocket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCampaigns}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently live
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/startup/campaigns">
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle>View All Campaigns</CardTitle>
                <CardDescription>
                  Manage and track all your fundraising campaigns
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/startup/campaigns/create">
              <CardHeader>
                <Plus className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Create Campaign</CardTitle>
                <CardDescription>
                  Launch a new fundraising campaign for your startup
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/startup/profile">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Update Profile</CardTitle>
                <CardDescription>
                  Keep your company information up to date
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary">
            <Link href={startupProfile.campaigns.length > 0 ? `/roi/${startupProfile.campaigns[0].id}` : '#'}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <span className="text-xs text-primary font-semibold">See more →</span>
                </div>
                <CardTitle>Consolidated ROI</CardTitle>
                <CardDescription>
                  View comprehensive ROI metrics and performance insights
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Your latest fundraising campaigns</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/startup/campaigns">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {startupProfile.campaigns.length === 0 ? (
              <div className="text-center py-12">
                <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first campaign to start raising funds
                </p>
                <Button asChild>
                  <Link href="/dashboard/startup/campaigns/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Campaign
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {startupProfile.campaigns.map((campaign) => {
                  const currentRaised = Number(campaign.current_raised || 0);
                  const campaignObjective = campaign.campaign_objective || '';
                  
                  return (
                    <div
                      key={campaign.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{campaign.title}</h3>
                          {campaignObjective && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {campaignObjective}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Created {new Date(campaign.created_at || '').toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            campaign.status === 'published'
                              ? 'default'
                              : campaign.status === 'draft'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="ml-4"
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
                        <Link href={`/roi/${campaign.id}`} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200 hover:border-blue-400 transition-all cursor-pointer group">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-blue-600 font-semibold">ROI Analysis</p>
                            <BarChart3 className="h-3 w-3 text-blue-600 group-hover:scale-110 transition-transform" />
                          </div>
                          <p className="font-bold text-lg text-blue-600">View Report</p>
                        </Link>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/startup/campaigns/${campaign.id}`}>
                            View Details
                          </Link>
                        </Button>
                        {campaign.status === 'draft' && (
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/startup/campaigns/${campaign.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                        )}
                        {campaign.status === 'published' && (
                          <Button asChild variant="default" size="sm">
                            <Link href={`/campaigns/${campaign.id}`}>
                              View Public Page
                            </Link>
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
