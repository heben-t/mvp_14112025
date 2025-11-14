'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, ArrowUpRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Investment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  campaigns: {
    id: string;
    title: string;
    startup_profiles: {
      companyName: string;
      logo?: string;
    };
  };
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <p className="text-lg font-medium mb-2">{message}</p>
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}

export default function InvestorInvestmentsPage() {
  const router = useRouter();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch('/api/investments/list');
      if (!response.ok) throw new Error('Failed to fetch investments');
      
      const data = await response.json();
      setInvestments(data.investments);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching investments:', error);
      setError('Failed to load investments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending Review</Badge>;
      case 'ACCEPTED':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState message={error} onRetry={fetchInvestments} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Investments</h1>
        <p className="text-muted-foreground">
          Track and manage your investment portfolio
        </p>
      </div>

      {stats && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Investments</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.accepted}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Invested</CardDescription>
              <CardTitle className="text-3xl">${stats.totalInvested.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        {investments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No investments yet</p>
              <p className="text-muted-foreground mb-4">
                Start building your portfolio by discovering startups
              </p>
              <Button onClick={() => router.push('/discover')}>
                Browse Campaigns
              </Button>
            </CardContent>
          </Card>
        ) : (
          investments.map((investment) => (
            <Card key={investment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{investment.campaigns.title}</CardTitle>
                      {getStatusBadge(investment.status)}
                    </div>
                    <CardDescription>
                      {investment.campaigns.startup_profiles.companyName}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">${investment.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      Invested on {new Date(investment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/campaigns/${investment.campaigns.id}`)}
                  >
                    View Campaign
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                {investment.status === 'PENDING' && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      ⏳ Awaiting startup review. You'll be notified once they respond.
                    </p>
                  </div>
                )}

                {investment.status === 'ACCEPTED' && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-400">
                      ✅ Investment accepted! Funds transferred to escrow.
                    </p>
                  </div>
                )}

                {investment.status === 'REJECTED' && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-400">
                      ❌ Investment declined. Refund processed within 5-7 business days.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
