'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Users, Star, FileText, Video, ExternalLink, Clock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface CampaignAnalytics {
  analytics: any[];
  totals: {
    views: number;
    uniqueVisitors: number;
    watchlistAdds: number;
    pitchDeckViews: number;
    videoPlays: number;
    websiteClicks: number;
    avgTimeOnPage: number;
  };
  unansweredQuestions: number;
}

interface Props {
  campaignId: string;
}

export function CampaignAnalyticsDashboard({ campaignId }: Props) {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (campaignId) {
      fetchAnalytics();
    }
  }, [campaignId]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/campaigns/analytics?campaignId=${campaignId}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">No analytics data available</div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      title: 'Total Views',
      value: analytics.totals.views.toLocaleString(),
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Unique Visitors',
      value: analytics.totals.uniqueVisitors.toLocaleString(),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Watchlist Adds',
      value: analytics.totals.watchlistAdds.toLocaleString(),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Pitch Deck Views',
      value: analytics.totals.pitchDeckViews.toLocaleString(),
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Video Plays',
      value: analytics.totals.videoPlays.toLocaleString(),
      icon: Video,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Website Clicks',
      value: analytics.totals.websiteClicks.toLocaleString(),
      icon: ExternalLink,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Avg Time on Page',
      value: `${Math.floor(analytics.totals.avgTimeOnPage / 60)}:${(analytics.totals.avgTimeOnPage % 60).toString().padStart(2, '0')}`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Questions Asked',
      value: analytics.unansweredQuestions.toString(),
      icon: MessageSquare,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      highlight: analytics.unansweredQuestions > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Analytics for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.title} className={metric.highlight ? 'border-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                      <metric.icon className={`h-5 w-5 ${metric.color}`} />
                    </div>
                  </div>
                  {metric.highlight && analytics.unansweredQuestions > 0 && (
                    <p className="text-xs text-primary mt-2">Respond quickly!</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {analytics.analytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>View Trend</CardTitle>
            <CardDescription>Daily views over the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1">
              {analytics.analytics.map((day, index) => {
                const maxViews = Math.max(...analytics.analytics.map((d) => d.views || 0));
                const height = maxViews > 0 ? ((day.views || 0) / maxViews) * 100 : 0;
                
                return (
                  <div
                    key={index}
                    className="flex-1 bg-primary rounded-t transition-all hover:opacity-80"
                    style={{ height: `${height}%`, minHeight: height > 0 ? '2px' : '0' }}
                    title={`${new Date(day.date).toLocaleDateString()}: ${day.views} views`}
                  />
                );
              })}
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              {analytics.analytics.length} days of data
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
