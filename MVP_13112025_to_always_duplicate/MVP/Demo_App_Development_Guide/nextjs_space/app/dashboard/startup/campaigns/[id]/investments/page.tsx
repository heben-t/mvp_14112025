import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';

async function getCampaignInvestments(campaignId: string, userId: string) {
  const campaign = await prisma.campaigns.findUnique({
    where: { id: campaignId },
    include: {
      startup_profiles: true,
      investments: {
        include: {
          investor_profiles: {
            include: {
              users: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!campaign) {
    return null;
  }

  if (campaign.startup_profiles.userId !== userId) {
    return null;
  }

  return campaign;
}

export default async function CampaignInvestmentsPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const campaign = await getCampaignInvestments(params.id, user.id);

  if (!campaign) {
    notFound();
  }

  const totalInvestments = campaign.investments.length;
  const completedInvestments = campaign.investments.filter(
    (inv: any) => inv.status === 'COMPLETED'
  ).length;
  const pendingInvestments = campaign.investments.filter(
    (inv: any) => inv.status === 'PENDING'
  ).length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'COMPLETED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'FAILED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard/startup/campaigns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{campaign.title}</h1>
          <p className="text-muted-foreground mt-2">Investment Management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Investments
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInvestments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedInvestments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingInvestments}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Investments</CardTitle>
          </CardHeader>
          <CardContent>
            {campaign.investments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No investments yet
              </div>
            ) : (
              <div className="space-y-4">
                {campaign.investments.map((investment: any) => (
                  <div
                    key={investment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(investment.status)}
                      <div>
                        <p className="font-medium">
                          {investment.investor_profiles.users.name || 'Anonymous'}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {investment.investor_profiles.users.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(investment.createdAt).toLocaleDateString()} at{' '}
                          {new Date(investment.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          ${investment.amount.toLocaleString()}
                        </p>
                        <Badge variant={getStatusVariant(investment.status)}>
                          {investment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
