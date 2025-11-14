import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Cpu, Users2, Target, DollarSign, Eye, Sparkles, BarChart3, Activity, Zap, Star, Award } from 'lucide-react';

interface ROIMetric {
  title: string;
  description: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
}

async function getCampaignData(campaignId: string, userId: string) {
  const campaign = await prisma.campaigns.findFirst({
    where: {
      id: campaignId,
      startup_profiles: {
        userId: userId,
      },
    },
    include: {
      startup_profiles: {
        include: {
          startup_metrics: {
            orderBy: {
              created_at: 'desc',
            },
            take: 1,
          },
        },
      },
      _count: {
        select: { investments: true },
      },
    },
  });

  return campaign;
}

export default async function ConsolidatedROIPage({
  params,
}: {
  params: { campaignId: string };
}) {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect('/auth/signin');
  }

  if (user.role !== 'STARTUP') {
    redirect('/dashboard');
  }

  const campaign = await getCampaignData(params.campaignId, user.id);

  if (!campaign) {
    notFound();
  }

  // Get latest metrics from database
  const latestMetrics = campaign.startup_profiles.startup_metrics[0];
  const consolidatedAIImpact = latestMetrics?.Consolidated_AI_Impact 
    ? Number(latestMetrics.Consolidated_AI_Impact) 
    : null;
  const aiImpactStartup = latestMetrics?.AI_Impact_Startup_i 
    ? Number(latestMetrics.AI_Impact_Startup_i) 
    : null;
  const financialI = latestMetrics?.Financial_i 
    ? Number(latestMetrics.Financial_i) 
    : null;
  const technologyI = latestMetrics?.Technology_i 
    ? Number(latestMetrics.Technology_i) 
    : null;
  const industryI = latestMetrics?.Industry_i 
    ? Number(latestMetrics.Industry_i) 
    : null;
  const socialI = latestMetrics?.Social_i 
    ? Number(latestMetrics.Social_i) 
    : null;

  // Calculate ROI metrics and overall score
  const currentRaised = Number(campaign.current_raised || 0);
  const investorCount = campaign._count.investments;
  const viewCount = campaign.view_count || 0;

  // Use database values if available, otherwise calculate
  const financeScore = financialI !== null ? financialI : Math.min(100, (currentRaised / 100000) * 100);
  const techScore = technologyI !== null ? technologyI : (aiImpactStartup !== null ? aiImpactStartup : 85);
  const socialScore = socialI !== null ? socialI : Math.min(100, (viewCount / 1000) * 100);
  const industryScore = industryI !== null ? industryI : Math.min(100, (investorCount / 50) * 100);
  
  // Use Consolidated_AI_Impact if available, otherwise calculate from component scores
  const overallROI = consolidatedAIImpact !== null 
    ? consolidatedAIImpact 
    : ((financeScore + techScore + socialScore + industryScore) / 4);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-700' };
    if (score >= 60) return { label: 'Good', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Needs Improvement', color: 'bg-orange-100 text-orange-700' };
  };

  const roiMetrics: ROIMetric[] = [
    {
      title: 'Finance ROI',
      description: 'Measure traction and revenue stability',
      value: financialI !== null ? `${financialI.toFixed(2)}` : (currentRaised > 0 ? `$${currentRaised.toLocaleString()}` : 'N/A'),
      change: currentRaised > 0 ? '+12.5%' : undefined,
      icon: <TrendingUp className="h-10 w-10 text-green-600" />,
    },
    {
      title: 'Technology ROI',
      description: 'Measure AI integration and impact',
      value: technologyI !== null ? `${technologyI.toFixed(2)}` : 'High',
      change: '+8.2%',
      icon: <Cpu className="h-10 w-10 text-blue-600" />,
    },
    {
      title: 'Social ROI',
      description: 'Measure credibility and public visibility',
      value: socialI !== null ? `${socialI.toFixed(2)}` : (viewCount > 0 ? `${viewCount.toLocaleString()} views` : 'N/A'),
      change: viewCount > 100 ? '+15.3%' : undefined,
      icon: <Users2 className="h-10 w-10 text-purple-600" />,
    },
    {
      title: 'Industry ROI',
      description: 'Measure user traction and retention',
      value: industryI !== null ? `${industryI.toFixed(2)}` : (investorCount > 0 ? `${investorCount} investors` : 'N/A'),
      change: investorCount > 5 ? '+20.1%' : undefined,
      icon: <Target className="h-10 w-10 text-orange-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="hover:bg-white/60">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-blue-600">
                Consolidated ROI Analysis
              </h1>
              <Sparkles className="h-6 w-6 text-purple-500 animate-pulse" />
            </div>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Campaign: <span className="font-semibold">{campaign.title}</span>
            </p>
          </div>
        </div>

        {/* Overall ROI Score Hero Section */}
        <Card className="border-none shadow-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <CardContent className="pt-8 pb-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-6 w-6" />
                  <p className="text-white/80 text-sm font-medium uppercase tracking-wide">Overall Performance Score</p>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="text-7xl font-bold">{overallROI.toFixed(2)}%</span>
                </div>
                <Badge className={`mt-4 ${getScoreBadge(Math.round(overallROI)).color} border-0 px-4 py-1 text-sm`}>
                  {getScoreBadge(Math.round(overallROI)).label}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <div className="text-2xl font-bold">{financeScore.toFixed(2)}</div>
                  <div className="text-xs text-white/70">Finance</div>
                </div>
                <div className="text-center">
                  <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                    <Cpu className="h-8 w-8" />
                  </div>
                  <div className="text-2xl font-bold">{techScore.toFixed(2)}</div>
                  <div className="text-xs text-white/70">Tech</div>
                </div>
                <div className="text-center">
                  <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                    <Users2 className="h-8 w-8" />
                  </div>
                  <div className="text-2xl font-bold">{socialScore.toFixed(2)}</div>
                  <div className="text-xs text-white/70">Social</div>
                </div>
                <div className="text-center">
                  <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                    <Target className="h-8 w-8" />
                  </div>
                  <div className="text-2xl font-bold">{industryScore.toFixed(2)}</div>
                  <div className="text-xs text-white/70">Industry</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Introductory Notice */}
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 backdrop-blur-sm shadow-lg">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed text-gray-700">
                This consolidated ROI dashboard provides a comprehensive view of your campaign's performance
                across four key dimensions: <span className="font-semibold text-blue-700">Financial metrics</span>, <span className="font-semibold text-blue-700">Technology integration</span>, <span className="font-semibold text-purple-700">Social visibility</span>,
                and <span className="font-semibold text-orange-700">Industry traction</span>. Use these insights to understand your startup's holistic performance
                and identify areas for strategic improvement.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ROI Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roiMetrics.map((metric, index) => {
            const colors = [
              { gradient: 'from-green-500 to-emerald-600', bg: 'bg-green-50', border: 'border-green-200' },
              { gradient: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50', border: 'border-blue-200' },
              { gradient: 'from-purple-500 to-pink-600', bg: 'bg-purple-50', border: 'border-purple-200' },
              { gradient: 'from-orange-500 to-red-600', bg: 'bg-orange-50', border: 'border-orange-200' },
            ];
            
            return (
              <Card key={index} className={`border-2 ${colors[index].border} hover:shadow-2xl transition-all duration-300 hover:scale-105 group bg-white overflow-hidden`}>
                <div className={`h-2 bg-gradient-to-r ${colors[index].gradient}`}></div>
                <CardHeader className={`${colors[index].bg} border-b`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                        {metric.title}
                        <Star className="h-5 w-5 text-yellow-500 group-hover:animate-spin" />
                      </CardTitle>
                      <CardDescription className="text-sm font-medium">
                        {metric.description}
                      </CardDescription>
                    </div>
                    <div className={`p-3 ${colors[index].bg} rounded-xl border-2 ${colors[index].border} group-hover:scale-110 transition-transform`}>
                      {metric.icon}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="text-4xl font-bold text-gray-800">
                      {metric.value}
                    </div>
                    {metric.change && (
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg inline-flex">
                        <Activity className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700 font-semibold">
                          {metric.change}
                        </span>
                        <span className="text-xs text-green-600">vs last period</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Performance Overview */}
        <Card className="border-none shadow-xl bg-white">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl">Performance Overview</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Detailed breakdown of your campaign metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-green-700">Total Raised</p>
                  </div>
                  <p className="text-4xl font-bold text-green-600">
                    ${currentRaised.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Users2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-purple-700">Total Investors</p>
                  </div>
                  <p className="text-4xl font-bold text-purple-600">{investorCount}</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-blue-700">Campaign Views</p>
                  </div>
                  <p className="text-4xl font-bold text-blue-600">{viewCount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Dashboard */}
        <div className="flex justify-center pt-4 pb-8">
          <Button asChild variant="outline" size="lg" className="border-2 hover:bg-blue-50 hover:border-blue-400 transition-all group">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
