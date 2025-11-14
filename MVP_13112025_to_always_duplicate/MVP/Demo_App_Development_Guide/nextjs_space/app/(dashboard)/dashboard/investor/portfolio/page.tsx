import { getCurrentUser } from '@/lib/auth';
import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { PortfolioMetrics } from '@/components/portfolio/portfolio-metrics';
import { InvestmentCard } from '@/components/portfolio/investment-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, TrendingUp, Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

async function getPortfolio(investorProfileId: string) {
  const investments = await prisma.investments.findMany({
    where: {
      investorProfileId,
      status: 'ACCEPTED',
    },
    include: {
      campaigns: {
        include: {
          startup_profiles: {
            select: {
              companyName: true,
              industry: true,
              logo: true,
              stage: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const activeInvestments = investments.length;

  const stats = {
    totalInvested,
    activeInvestments,
    totalValue: totalInvested,
    roi: 0,
  };

  return { investments, stats };
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}

export default async function PortfolioPage() {
  const user = await getCurrentUser();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const investorProfile = await prisma.investor_profiles.findUnique({
    where: { userId: user.id },
  });

  if (!investorProfile) {
    redirect('/auth/onboarding/investor');
  }

  const { investments, stats } = await getPortfolio(investorProfile.id);

  // Transform to match expected interface
  const transformedInvestments = investments.map((inv: any) => ({
    id: inv.id,
    amount: inv.amount,
    createdAt: inv.createdAt.toISOString(),
    campaigns: {
      id: inv.campaigns.id,
      title: inv.campaigns.title,
      equityOffered: inv.campaigns.equityOffered,
      startup_profiles: {
        companyName: inv.campaigns.startup_profiles.companyName,
        industry: inv.campaigns.startup_profiles.industry,
        logo: inv.campaigns.startup_profiles.logo,
        stage: inv.campaigns.startup_profiles.stage,
      },
    },
  }));

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PieChart className="h-8 w-8" />
            Portfolio
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your investments and performance
          </p>
        </div>
      </div>

      <Suspense fallback={<PortfolioSkeleton />}>
        <PortfolioMetrics stats={stats} />
      </Suspense>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Active Investments
          </h2>
          <p className="text-muted-foreground">
            {transformedInvestments.length} {transformedInvestments.length === 1 ? 'company' : 'companies'}
          </p>
        </div>

        {transformedInvestments.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="rounded-full bg-muted p-6">
                <TrendingUp className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No active investments yet</h3>
                <p className="text-muted-foreground max-w-md">
                  Start exploring campaigns and make your first investment to build your portfolio.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformedInvestments.map((investment) => (
              <InvestmentCard key={investment.id} investment={investment} />
            ))}
          </div>
        )}
      </div>

      {transformedInvestments.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <TrendingUp className="h-5 w-5" />
              Portfolio Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>• Your portfolio is diversified across {new Set(transformedInvestments.map(i => i.campaigns.startup_profiles.industry)).size} industries</p>
            <p>• Average investment size: ${(stats.totalInvested / transformedInvestments.length).toLocaleString()}</p>
            <p>• Track campaign updates and metrics to monitor your investments</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
