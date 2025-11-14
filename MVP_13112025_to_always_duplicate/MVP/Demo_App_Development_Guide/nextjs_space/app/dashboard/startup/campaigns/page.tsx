import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DollarSign, Users, TrendingUp, Eye, Plus } from 'lucide-react';

async function getStartupCampaigns(userId: string) {
  const startupProfile = await prisma.startup_profiles.findUnique({
    where: { userId },
    include: {
      campaigns: {
        include: {
          investments: {
            include: {
              investor_profiles: {
                select: {
                  userId: true,
                  accreditation_status: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      },
    },
  });

  return startupProfile;
}

export default async function StartupCampaignsPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect('/auth/signin');
  }

  const startupProfile = await getStartupCampaigns(user.id);

  if (!startupProfile) {
    redirect('/auth/onboarding/startup');
  }

  const totalRaised = startupProfile.campaigns.reduce(
    (sum: number, campaign: any) => sum + Number(campaign.current_raised || 0),
    0
  );

  const totalInvestors = new Set(
    startupProfile.campaigns.flatMap((campaign: any) =>
      campaign.investments.map((inv: any) => inv.investor_profile_id)
    )
  ).size;

  const totalViews = startupProfile.campaigns.reduce(
    (sum: number, campaign: any) => sum + (campaign.view_count || 0),
    0
  );


  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Campaigns</h1>
            <p className="text-muted-foreground mt-2">
              Manage your fundraising campaigns
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/startup/campaigns/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalRaised.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInvestors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {startupProfile.campaigns.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {startupProfile.campaigns.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  You haven't created any campaigns yet
                </p>
                <Button asChild>
                  <Link href="/dashboard/startup/campaigns/create">
                    Create Your First Campaign
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            startupProfile.campaigns.map((campaign: any) => {
              const fundingProgress =
                (Number(campaign.current_raised || 0) / Number(campaign.max_investment || 1)) * 100;
              const investorCount = campaign.investments.length;

              return (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{campaign.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
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
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Goal</p>
                        <p className="text-lg font-bold">
                          ${Number(campaign.max_investment || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Raised</p>
                        <p className="text-lg font-bold">
                          ${Number(campaign.current_raised || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <p className="text-lg font-bold">
                          {fundingProgress.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Investors</p>
                        <p className="text-lg font-bold">{investorCount}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/campaigns/${campaign.id}`}>View</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/dashboard/startup/campaigns/${campaign.id}/investments`}
                        >
                          Manage Investments
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
