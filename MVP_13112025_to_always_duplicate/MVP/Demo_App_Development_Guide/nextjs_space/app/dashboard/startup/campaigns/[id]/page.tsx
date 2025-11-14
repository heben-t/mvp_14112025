
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import {
  DollarSign,
  Users,
  TrendingUp,
  Eye,
  FileText,
  ExternalLink,
  Edit,
  Share2,
  Clock,
  Target,
  Percent,
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

async function getCampaignWithAuth(id: string, userId: string) {
  const startupProfile = await prisma.startup_profiles.findUnique({
    where: { userId },
  });

  if (!startupProfile) {
    return null;
  }

  const campaign = await prisma.campaigns.findFirst({
    where: {
      id,
      startup_profile_id: startupProfile.id,
    },
    include: {
      investments: {
        include: {
          investor_profiles: {
            select: {
              userId: true,
              professional_title: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      },
      startup_profiles: true,
    },
  });

  return campaign;
}

export default async function StartupCampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect('/auth/signin');
  }

  if (user.role !== 'STARTUP') {
    redirect('/dashboard');
  }

  const campaign = await getCampaignWithAuth(params.id, user.id);

  if (!campaign) {
    notFound();
  }

  const fundingProgress = (Number(campaign.current_raised) / Number(campaign.max_investment)) * 100;
  const totalInvestors = campaign.investments.length;
  const isPublished = campaign.status === 'published';
  const isDraft = campaign.status === 'draft';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {campaign.title}
                  </h1>
                  <Badge
                    variant={isPublished ? 'default' : isDraft ? 'secondary' : 'outline'}
                    className={`px-3 py-1 text-sm ${
                      isPublished 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : isDraft 
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                        : ''
                    }`}
                  >
                    {isPublished && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {isDraft && <AlertCircle className="h-3 w-3 mr-1" />}
                    {campaign.status?.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(campaign.created_at || '').toLocaleDateString()}</span>
                  </div>
                  {campaign.published_at && (
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4" />
                      <span>Published {new Date(campaign.published_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="lg" className="shadow-sm hover:shadow-md transition-shadow" asChild>
                  <Link href={`/campaigns/${campaign.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Public
                  </Link>
                </Button>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all" asChild>
                  <Link href={`/dashboard/startup/campaigns/${campaign.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Campaign
                  </Link>
                </Button>
              </div>
            </div>

            {/* Status Banner */}
            {isPublished && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Campaign is Live! 🎉</p>
                    <p className="text-sm text-green-700 mt-1">
                      Your campaign is now visible to investors. Share your campaign link to attract more interest.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {isDraft && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900">Draft Mode</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Complete your campaign details and publish to make it visible to investors.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Key Performance Metrics - Enhanced Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-1">Fundraising Goal</p>
                <p className="text-3xl font-bold text-slate-900">
                  ${Number(campaign.max_investment || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <Percent className="h-3 w-3" />
                    {fundingProgress.toFixed(0)}%
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-1">Amount Raised</p>
                <p className="text-3xl font-bold text-slate-900">
                  ${Number(campaign.current_raised || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-1">Total Investors</p>
                <p className="text-3xl font-bold text-slate-900">{totalInvestors}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {totalInvestors > 0 ? 'Active investments' : 'No investments yet'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <Eye className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-1">Page Views</p>
                <p className="text-3xl font-bold text-slate-900">{campaign.view_count || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Total campaign views</p>
              </CardContent>
            </Card>
          </div>

          {/* Funding Progress - Premium Design */}
          <Card className="border-0 shadow-lg bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">Funding Progress</h3>
                  <p className="text-blue-100 mt-1">Track your campaign's fundraising journey</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{fundingProgress.toFixed(1)}%</div>
                  <p className="text-blue-100 text-sm">of goal</p>
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={fundingProgress} className="h-4 bg-blue-500/30" />
                <div className="flex justify-between text-sm text-blue-100">
                  <span>${Number(campaign.current_raised || 0).toLocaleString()} raised</span>
                  <span>${Number(campaign.max_investment || 0).toLocaleString()} goal</span>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Current Raised
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${Number(campaign.current_raised || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">Total funds collected</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Fundraising Goal
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${Number(campaign.max_investment || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">Target amount</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Campaign Activity Summary - MVP Version without analytics table */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Campaign Performance
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Overview of your campaign metrics
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">Total Views</span>
                      </div>
                      <p className="text-3xl font-bold text-slate-900">{campaign.view_count || 0}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Investors</span>
                      </div>
                      <p className="text-3xl font-bold text-slate-900">{totalInvestors}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Raised</span>
                      </div>
                      <p className="text-3xl font-bold text-slate-900">
                        ${Number(campaign.current_raised || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Investments */}
              {campaign.investments.length > 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          Recent Investments
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Latest investments in your campaign
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="px-3 py-1">
                        {totalInvestors} Total
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {campaign.investments.slice(0, 5).map((investment, idx) => (
                        <div
                          key={investment.id}
                          className="p-6 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {investment.investor_profiles.professional_title || 'Investor'}
                                </p>
                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(investment.created_at || investment.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-slate-900">
                                ${Number(investment.amount).toLocaleString()}
                              </p>
                              <Badge
                                variant={
                                  investment.status === 'COMPLETED'
                                    ? 'default'
                                    : investment.status === 'PENDING'
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className="mt-1"
                              >
                                {investment.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {campaign.investments.length > 5 && (
                      <div className="p-4 bg-slate-50 border-t">
                        <Button variant="link" className="w-full" asChild>
                          <Link href={`/dashboard/startup/campaigns/${campaign.id}/investments`}>
                            View All {campaign.investments.length} Investments →
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                      <Users className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Investments Yet</h3>
                    <p className="text-slate-600 text-center mb-6 max-w-md">
                      Share your campaign with investors to start receiving investments
                    </p>
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600" asChild>
                      <Link href={`/campaigns/${campaign.id}`}>
                        <Share2 className="mr-2 h-4 w-4" />
                        View Campaign Page
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              
              {/* Campaign Information */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
                <CardHeader className="border-b bg-white/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Campaign Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-600">Status</span>
                    <Badge
                      variant={isPublished ? 'default' : 'secondary'}
                      className={isPublished ? 'bg-green-100 text-green-700' : ''}
                    >
                      {campaign.status?.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {campaign.published_at && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-600">Published</span>
                      <span className="font-medium text-slate-900">
                        {new Date(campaign.published_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  {campaign.closes_at && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-600">Closes</span>
                      <span className="font-medium text-slate-900">
                        {new Date(campaign.closes_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  {campaign.max_investment && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-600">Goal</span>
                      <span className="font-semibold text-slate-900">
                        ${Number(campaign.max_investment).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-600">Views</span>
                    <span className="font-medium text-slate-900">{campaign.view_count || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  {campaign.vsl_url && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={campaign.vsl_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View VSL Video
                      </a>
                    </Button>
                  )}
                  {campaign.pitch_deck && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={campaign.pitch_deck} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        Download Pitch Deck
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="border-b bg-white/50">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href={`/dashboard/startup/campaigns/${campaign.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Campaign
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/campaigns/${campaign.id}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Public Page
                    </Link>
                  </Button>
                  {totalInvestors > 0 && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={`/dashboard/startup/campaigns/${campaign.id}/investments`}>
                        <Users className="mr-2 h-4 w-4" />
                        Manage Investments
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/startup/campaigns">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      All Campaigns
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
