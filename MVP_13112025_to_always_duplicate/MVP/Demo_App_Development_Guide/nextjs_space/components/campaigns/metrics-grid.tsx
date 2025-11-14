'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Users, Zap, Clock } from 'lucide-react';

interface MetricsGridProps {
  metrics: {
    mrr?: number;
    arr?: number;
    burnRate?: number;
    runway?: number;
    churnRate?: number;
    currentROI?: number;
    roiTrend?: number;
  };
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const metricsData = [
    {
      title: 'Monthly Recurring Revenue',
      value: metrics.mrr ? formatCurrency(metrics.mrr) : 'N/A',
      icon: DollarSign,
      trend: null,
    },
    {
      title: 'Annual Recurring Revenue',
      value: metrics.arr ? formatCurrency(metrics.arr) : 'N/A',
      icon: TrendingUp,
      trend: null,
    },
    {
      title: 'Monthly Burn Rate',
      value: metrics.burnRate ? formatCurrency(metrics.burnRate) : 'N/A',
      icon: Zap,
      trend: null,
    },
    {
      title: 'Runway',
      value: metrics.runway ? `${metrics.runway} months` : 'N/A',
      icon: Clock,
      trend: null,
    },
    {
      title: 'Churn Rate',
      value: metrics.churnRate ? `${metrics.churnRate}%` : 'N/A',
      icon: Users,
      trend: metrics.churnRate && metrics.churnRate < 5 ? 'positive' : 'negative',
    },
    {
      title: 'ROI Score',
      value: metrics.currentROI ? `${metrics.currentROI.toFixed(1)}%` : 'N/A',
      icon: TrendingUp,
      trend: metrics.roiTrend && metrics.roiTrend > 0 ? 'positive' : 'negative',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricsData.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  {metric.trend && (
                    <Badge
                      variant={metric.trend === 'positive' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {metric.trend === 'positive' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
