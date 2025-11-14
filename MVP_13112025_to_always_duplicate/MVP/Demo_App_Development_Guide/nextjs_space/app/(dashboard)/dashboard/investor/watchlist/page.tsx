import { getCurrentUser } from '@/lib/auth';
import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { CampaignCard } from '@/components/campaigns/campaign-card';
import { WatchlistFolders } from '@/components/watchlist/watchlist-folders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark, TrendingUp, AlertCircle } from 'lucide-react';

async function getWatchlist(investorProfileId: string) {
  // Optimized: Single query with join instead of N+1 queries
  const watchlist = await prisma.watchlists.findMany({
    where: { investorProfileId },
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
    orderBy: { createdAt: 'desc' },
  });

  return watchlist;
}

export default async function WatchlistPage() {
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

  const watchlist = await getWatchlist(investorProfile.id);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bookmark className="h-8 w-8" />
            My Watchlist
          </h1>
          <p className="text-muted-foreground mt-2">
            Track campaigns you're interested in
          </p>
        </div>
        <Card className="w-fit">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{watchlist.length}</p>
                <p className="text-xs text-muted-foreground">Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Watchlist Folders Component */}
      <WatchlistFolders />

      {watchlist.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-muted p-6">
              <Bookmark className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No campaigns in watchlist</h3>
              <p className="text-muted-foreground max-w-md">
                Start exploring campaigns and bookmark the ones you're interested in to track them here.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((item) => item.campaigns && (
            <CampaignCard
              key={item.id}
              campaign={{
                ...item.campaigns,
                viewCount: item.campaigns.viewCount || 0,
                investorCount: item.campaigns.interestedInvestors || 0,
              }}
            />
          ))}
        </div>
      )}

      {watchlist.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <AlertCircle className="h-5 w-5" />
              Watchlist Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>• Click the bookmark icon on any campaign to add or remove it from your watchlist</p>
            <p>• Watchlist campaigns are sorted by when you added them (newest first)</p>
            <p>• You'll receive notifications when campaigns you're watching have important updates</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
