'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, PieChart, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortfolioMetricsProps {
  stats: {
    totalInvested: number;
    activeInvestments: number;
    totalValue: number;
    roi: number;
  };
}

export function PortfolioMetrics({ stats }: PortfolioMetricsProps) {
  const roiPositive = stats.roi >= 0;

  const metrics = [
    {
      title: 'Total Invested',
      value: `$${stats.totalInvested.toLocaleString()}`,
      icon: DollarSign,
      description: 'Total capital deployed',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
    {
      title: 'Portfolio Value',
      value: `$${stats.totalValue.toLocaleString()}`,
      icon: PieChart,
      description: 'Current portfolio worth',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950',
    },
    {
      title: 'Active Investments',
      value: stats.activeInvestments.toString(),
      icon: Briefcase,
      description: 'Number of companies',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
    },
    {
      title: 'ROI',
      value: `${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(1)}%`,
      icon: roiPositive ? TrendingUp : TrendingDown,
      description: 'Return on investment',
      color: roiPositive ? 'text-green-600' : 'text-red-600',
      bgColor: roiPositive ? 'bg-green-100 dark:bg-green-950' : 'bg-red-100 dark:bg-red-950',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={cn('p-2 rounded-lg', metric.bgColor)}>
                <Icon className={cn('h-4 w-4', metric.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
