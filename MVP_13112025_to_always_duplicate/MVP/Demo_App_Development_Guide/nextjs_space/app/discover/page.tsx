import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Rocket, 
  Building2, 
  Search,
  Filter,
  ArrowRight,
  TrendingDown,
  Clock,
  Target,
  Sparkles,
  BarChart3,
  Zap,
  Award,
  MapPin,
  Calendar,
  Star
} from 'lucide-react';

async function getPublishedCampaigns() {
  const campaigns = await prisma.campaigns.findMany({
    where: {
      status: 'published',
    },
    include: {
      startup_profiles: {
        select: {
          companyName: true,
          logo: true,
          industry: true,
          stage: true,
          description: true,
          geographicPresence: true,
          userId: true,
          startup_metrics: {
            orderBy: {
              created_at: 'desc',
            },
            take: 1,
            select: {
              Consolidated_AI_Impact: true,
              AI_Impact_Startup_i: true,
            },
          },
        },
      },
      _count: {
        select: { investments: true },
      },
    },
    orderBy: { published_at: 'desc' },
  });

  return campaigns;
}

// Calculate ROI score for a campaign
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

export default async function DiscoverPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect('/auth/signin');
  }

  const campaigns = await getPublishedCampaigns();
  
  const totalRaised = campaigns.reduce((sum, c) => sum + Number(c.current_raised || 0), 0);
  const totalInvestments = campaigns.reduce((sum, c) => sum + c._count.investments, 0);
  const industries = new Set(campaigns.map((c) => c.startup_profiles.industry));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <div className="container py-10">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Hero Header with Enhanced Design */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 text-white shadow-2xl">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-6 py-3 mb-2">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span className="text-sm font-semibold tracking-wide">LIVE FUNDRAISING CAMPAIGNS</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black tracking-tight">
                Explore verified 
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200">
                  AI matching opportunities
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Browse innovative startups raising capital across the MENA region. 
                Track metrics, analyze trends, and discover tomorrow's unicorns.
              </p>

              {/* Enhanced Search Bar in Hero */}
              <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto pt-6">
                <div className="flex-1 relative group">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input 
                    placeholder="Search by company name, industry, or keyword..." 
                    className="pl-14 h-16 bg-white/95 backdrop-blur border-2 border-white/50 rounded-2xl text-lg shadow-xl focus:border-white focus:ring-4 focus:ring-white/20 transition-all"
                  />
                </div>
                <Button 
                  size="lg" 
                  className="h-16 px-8 bg-white text-blue-600 hover:bg-blue-50 rounded-2xl shadow-xl font-bold text-lg gap-3 group transition-all hover:scale-105"
                >
                  <Filter className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Advanced Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Premium Stats Dashboard with Enhanced Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Active Campaigns Card */}
            <Card className="relative overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-white group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Active Campaigns</CardTitle>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <Rocket className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black text-blue-600 mb-2">{campaigns.length}</div>
                <p className="text-sm text-gray-600 font-medium">Currently fundraising</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-blue-600 font-semibold">
                  <TrendingUp className="h-4 w-4" />
                  <span>+12% this month</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Raised Card */}
            <Card className="relative overflow-hidden border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-green-50 to-white group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-green-600 uppercase tracking-wide">Total Raised</CardTitle>
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black text-green-600 mb-2">
                  ${(totalRaised / 1000000).toFixed(1)}M
                </div>
                <p className="text-sm text-gray-600 font-medium">Across all campaigns</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-semibold">
                  <Zap className="h-4 w-4" />
                  <span>$250K last week</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Investors Card */}
            <Card className="relative overflow-hidden border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-white group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Total Investors</CardTitle>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black text-purple-600 mb-2">{totalInvestments}</div>
                <p className="text-sm text-gray-600 font-medium">Active participants</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-purple-600 font-semibold">
                  <Award className="h-4 w-4" />
                  <span>Top rated community</span>
                </div>
              </CardContent>
            </Card>

            {/* Industries Card */}
            <Card className="relative overflow-hidden border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-white group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Industries</CardTitle>
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black text-orange-600 mb-2">{industries.size}</div>
                <p className="text-sm text-gray-600 font-medium">Diverse sectors</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-orange-600 font-semibold">
                  <Target className="h-4 w-4" />
                  <span>Fast growing markets</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Category Pills */}
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Filter className="h-4 w-4" />
                  <span>Filter by:</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  <Button 
                    size="lg" 
                    className="rounded-full px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all hover:scale-105 font-semibold"
                  >
                    All Campaigns
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="rounded-full px-6 border-2 hover:border-blue-600 hover:bg-blue-50 transition-all hover:scale-105 font-semibold"
                  >
                    Technology
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="rounded-full px-6 border-2 hover:border-green-600 hover:bg-green-50 transition-all hover:scale-105 font-semibold"
                  >
                    Healthcare
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="rounded-full px-6 border-2 hover:border-purple-600 hover:bg-purple-50 transition-all hover:scale-105 font-semibold"
                  >
                    Fintech
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="rounded-full px-6 border-2 hover:border-orange-600 hover:bg-orange-50 transition-all hover:scale-105 font-semibold"
                  >
                    E-commerce
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="rounded-full px-6 border-2 hover:border-pink-600 hover:bg-pink-50 transition-all hover:scale-105 font-semibold"
                  >
                    SaaS
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns Grid */}
          {campaigns.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl mb-6 shadow-lg">
                  <Rocket className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold mb-3 text-gray-900">No campaigns available yet</h3>
                <p className="text-gray-600 text-lg max-w-sm mx-auto leading-relaxed">
                  Check back soon for exciting investment opportunities! New campaigns are added regularly.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {campaigns.length} Active Campaign{campaigns.length !== 1 ? 's' : ''}
                  </h2>
                  <p className="text-gray-600 mt-1">Showing newest opportunities first</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <Button variant="outline" size="sm" className="rounded-full font-semibold">
                    Newest First
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {campaigns.map((campaign) => {
                  const currentRaised = Number(campaign.current_raised || 0);
                  const maxInvestment = Number(campaign.max_investment || 1);
                  const progress = (currentRaised / maxInvestment) * 100;
                  const viewCount = campaign.view_count || 0;
                  const investorCount = campaign._count.investments;

                  return (
                    <Card
                      key={campaign.id}
                      className="group relative overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-white"
                    >
                      {/* Premium Badge */}
                      {investorCount > 10 && (
                        <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                          <Star className="h-3 w-3 fill-white" />
                          HOT
                        </div>
                      )}

                      {/* Gradient Header with Logo */}
                      <div className="relative h-40 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)]"></div>
                        </div>
                        
                        <div className="relative h-full p-6 flex items-start justify-between">
                          {/* Logo Container */}
                          {campaign.startup_profiles.logo ? (
                            <div className="h-20 w-20 rounded-2xl bg-white p-3 shadow-2xl ring-4 ring-white/50 group-hover:scale-110 transition-transform">
                              <img
                                src={campaign.startup_profiles.logo}
                                alt={campaign.startup_profiles.companyName}
                                className="h-full w-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="h-20 w-20 rounded-2xl bg-white shadow-2xl ring-4 ring-white/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <span className="text-3xl font-black bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {campaign.startup_profiles.companyName.charAt(0)}
                              </span>
                            </div>
                          )}

                          {/* Badges */}
                          <div className="flex flex-col gap-2">
                            <Badge className="bg-white/90 text-blue-600 border-white/50 backdrop-blur font-bold shadow-lg">
                              {campaign.startup_profiles.industry}
                            </Badge>
                            <Badge className="bg-blue-500/90 text-white border-white/30 backdrop-blur font-semibold shadow-lg">
                              {campaign.startup_profiles.stage}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <CardHeader className="space-y-4 pb-4">
                        <div>
                          <CardTitle className="text-2xl font-bold line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {campaign.startup_profiles.companyName}
                          </CardTitle>
                          <CardDescription className="text-base font-semibold mt-2 line-clamp-1 text-gray-700">
                            {campaign.title}
                          </CardDescription>
                        </div>

                        {campaign.startup_profiles.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {campaign.startup_profiles.description}
                          </p>
                        )}

                        <Separator />
                      </CardHeader>

                      <CardContent className="space-y-6 pb-6">
                        {/* Funding Progress Section */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Raised</p>
                              <p className="text-3xl font-black text-green-600">
                                ${(currentRaised / 1000).toFixed(0)}K
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Goal</p>
                              <p className="text-xl font-bold text-gray-700">
                                ${(maxInvestment / 1000).toFixed(0)}K
                              </p>
                            </div>
                          </div>
                          
                          <div className="relative">
                            <Progress 
                              value={Math.min(progress, 100)} 
                              className="h-3 bg-gray-200" 
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-white drop-shadow-lg">
                                {progress.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Metrics Grid with Enhanced Design */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 border-2 border-purple-200 hover:border-purple-400 transition-all group/metric">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>
                            <div className="relative flex flex-col items-center text-center">
                              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg mb-2">
                                <Users className="h-5 w-5 text-white" />
                              </div>
                              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Investors</p>
                              <p className="text-2xl font-black text-purple-700">{investorCount}</p>
                            </div>
                          </div>

                          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 border-2 border-blue-200 hover:border-blue-400 transition-all group/metric">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
                            <div className="relative flex flex-col items-center text-center">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg mb-2">
                                <Eye className="h-5 w-5 text-white" />
                              </div>
                              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Views</p>
                              <p className="text-2xl font-black text-blue-700">{viewCount}</p>
                            </div>
                          </div>

                          <Link 
                            href={`/roi/${campaign.id}`}
                            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-4 border-2 border-orange-200 hover:border-orange-400 transition-all group/metric cursor-pointer"
                          >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-xl"></div>
                            <div className="relative flex flex-col items-center text-center">
                              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg mb-2">
                                <BarChart3 className="h-5 w-5 text-white" />
                              </div>
                              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">ROI</p>
                              <p className="text-2xl font-black text-orange-700">{calculateROI(campaign)}%</p>
                            </div>
                          </Link>
                        </div>

                        <Separator />

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button 
                            asChild 
                            size="lg"
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl font-bold text-base group/btn transition-all hover:scale-105"
                          >
                            <Link href={`/campaigns/${campaign.id}`} className="flex items-center justify-center gap-2">
                              View Details
                              <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {/* Enhanced Load More Button */}
          {campaigns.length > 0 && (
            <div className="flex justify-center pt-6">
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-2xl px-12 h-16 border-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 gap-3"
              >
                Load More Campaigns
                <TrendingDown className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
