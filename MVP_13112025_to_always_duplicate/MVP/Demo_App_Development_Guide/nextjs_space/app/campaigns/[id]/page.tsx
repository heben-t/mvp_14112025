import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VSLPlayer } from '@/components/campaigns/vsl-player';
import { VerificationBadge } from '@/components/verification-badge';
import { FileText, ExternalLink, Building2, MapPin, Calendar, Eye, BarChart3, Award } from 'lucide-react';
import Link from 'next/link';

async function getCampaign(id: string) {
  const campaign = await prisma.campaigns.findUnique({
    where: { id },
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

  if (!campaign) {
    return null;
  }

  await prisma.campaigns.update({
    where: { id },
    data: { view_count: { increment: 1 } },
  });

  return campaign;
}

// Calculate ROI score
function calculateROI(campaign: any) {
  // Use Consolidated_AI_Impact from metrics if available
  const latestMetrics = campaign.startup_profiles?.startup_metrics?.[0];
  if (latestMetrics?.Consolidated_AI_Impact) {
    return Number(latestMetrics.Consolidated_AI_Impact).toFixed(2);
  }

  // Fallback to calculated ROI
  const currentRaised = Number(campaign.current_raised || 0);
  const investorCount = campaign._count.investments;
  const viewCount = campaign.view_count || 0;

  const financeScore = Math.min(100, (currentRaised / 100000) * 100);
  const techScore = latestMetrics?.AI_Impact_Startup_i 
    ? Number(latestMetrics.AI_Impact_Startup_i) 
    : 85;
  const socialScore = Math.min(100, (viewCount / 1000) * 100);
  const industryScore = Math.min(100, (investorCount / 50) * 100);
  
  return ((financeScore + techScore + socialScore + industryScore) / 4).toFixed(2);
}

function getROIBadge(score: string | number) {
  const numScore = typeof score === 'string' ? parseFloat(score) : score;
  if (numScore >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-700' };
  if (numScore >= 60) return { label: 'Good', color: 'bg-yellow-100 text-yellow-700' };
  return { label: 'Fair', color: 'bg-orange-100 text-orange-700' };
}

export default async function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const campaign = await getCampaign(params.id);

  if (!campaign) {
    notFound();
  }

  const startup = campaign.startup_profiles;
  const roiScore = calculateROI(campaign);
  const roiBadge = getROIBadge(roiScore);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Hero Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-start gap-6">
              {startup?.logo && (
                <img
                  src={startup.logo}
                  alt={startup.companyName || ''}
                  className="h-20 w-20 rounded-xl object-cover shadow-md ring-2 ring-slate-100"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">
                      {campaign.title}
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-lg text-slate-600 font-medium">
                        {startup?.companyName}
                      </p>
                      <VerificationBadge status={startup?.kyc_status || 'PENDING'} />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="px-3 py-1">
                      {startup?.industry}
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1">
                      {startup?.stage}
                    </Badge>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
                  {startup?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{startup.location}</span>
                    </div>
                  )}
                  {startup?.foundedYear && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Founded {startup.foundedYear}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{campaign.view_count || 0} views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VSL Video */}
          {campaign.vsl_url && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <VSLPlayer url={campaign.vsl_url} />
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Campaign Description */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Campaign Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {campaign.description || 'No campaign description available.'}
                  </p>
                </CardContent>
              </Card>

              {/* About the Company */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    About {startup?.companyName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    {startup?.description || 'No company description available.'}
                  </p>
                  {startup?.website && (
                    <Button variant="outline" asChild>
                      <a
                        href={startup.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit Website
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              
              {/* ROI Score Widget */}
              <Card className="border-none shadow-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
                <CardContent className="p-6 pt-8 pb-8 relative z-10">
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-2 justify-center">
                      <Award className="h-5 w-5" />
                      <p className="text-white/80 text-xs font-medium uppercase tracking-wide">Consolidated ROI Score</p>
                    </div>
                    <div className="flex items-baseline gap-4 justify-center">
                      <span className="text-7xl font-bold">{roiScore}%</span>

                    </div>
                    <Badge className={`mt-4 ${roiBadge.color} border-0 px-4 py-1 text-sm`}>
                      {roiBadge.label}
                    </Badge>
                    <Button 
                      asChild 
                      variant="secondary" 
                      className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Link href={`/roi/${campaign.id}`} className="flex items-center justify-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        View Detailed Analysis
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Campaign Stats */}
              <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="text-lg">Campaign Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Status</p>
                    <Badge 
                      variant={campaign.status === 'published' ? 'default' : 'secondary'}
                      className="text-sm px-3 py-1"
                    >
                      {campaign.status?.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {campaign.campaign_objective && (
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Objective</p>
                      <p className="font-semibold text-slate-900">{campaign.campaign_objective}</p>
                    </div>
                  )}

                  {campaign.published_at && (
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Published</p>
                      <p className="font-medium text-slate-900">
                        {new Date(campaign.published_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {campaign.closes_at && (
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Closes</p>
                      <p className="font-medium text-slate-900">
                        {new Date(campaign.closes_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resources */}
              {campaign.pitch_deck && (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={campaign.pitch_deck} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        View Pitch Deck
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Company Info */}
              {(startup?.teamSize || startup?.foundedYear) && (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Company Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {startup.teamSize && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Team Size</span>
                        <span className="font-medium text-slate-900">{startup.teamSize}</span>
                      </div>
                    )}
                    {startup.foundedYear && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Founded</span>
                        <span className="font-medium text-slate-900">{startup.foundedYear}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
