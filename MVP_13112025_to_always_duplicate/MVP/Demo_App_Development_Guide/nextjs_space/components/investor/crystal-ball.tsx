
'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, Users, PlayCircle } from 'lucide-react';
import { fadeIn } from '@/lib/utils/animation';
import { formatNumber } from '@/lib/utils/format';

interface Props {
  companies: any[];
}

export default function CrystalBall({ companies }: Props) {
  const totalInvestment = companies?.reduce((sum, c) => sum + (c?.investment || 0), 0) || 10;
  const projectedValue = 67;
  const projectedMultiple = projectedValue / totalInvestment;

  const topPerformer = companies?.sort((a, b) => (b?.roi || 0) - (a?.roi || 0))?.[0];
  const projectedROI = (topPerformer?.roi || 487) * 2.5;

  const seriesBReady = companies?.filter((c) => 
    (c?.roi || 0) > 350 && (c?.adoptionRate || 0) > 85
  )?.length || 3;

  const needsIntervention = companies?.filter((c) => 
    (c?.status === 'struggling' || c?.roi < 100)
  )?.slice(0, 2) || [];

  const recommendations = [
    {
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      type: 'success',
      title: `Double down on ${topPerformer?.name || 'SmartLogix'}`,
      description: '97% success probability',
      priority: 'high',
    },
    {
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      type: 'urgent',
      title: `Intervention call with ${needsIntervention[0]?.name || 'LaggardCo'} this week`,
      description: 'Critical burn rate issue',
      priority: 'urgent',
    },
    {
      icon: <Users className="h-5 w-5 text-blue-600" />,
      type: 'opportunity',
      title: 'Connect DataFlow with TechServe',
      description: 'Synergy detected in operations',
      priority: 'medium',
    },
  ];

  return (
    <motion.div
      {...fadeIn}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-purple-50 to-card dark:via-purple-950/20 p-8 shadow-xl border border-border/50"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(147,51,234,0.1),transparent)]" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <div>
              <h3 className="text-2xl font-bold">Portfolio Predictions</h3>
              <p className="text-sm text-muted-foreground">AI-powered 2025 forecast</p>
            </div>
          </div>
          <div className="rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
            2025
          </div>
        </div>

        {/* Predictions */}
        <div className="space-y-4">
          <div className="text-sm font-semibold text-muted-foreground">If current trends continue:</div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 p-4 border border-green-500/20">
              <div className="text-sm text-muted-foreground">Portfolio value</div>
              <div className="text-3xl font-bold text-green-600">
                {formatNumber(projectedValue * 1000000)}
              </div>
              <div className="text-xs text-green-600">{projectedMultiple.toFixed(1)}x multiple</div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 p-4 border border-primary/20">
              <div className="text-sm text-muted-foreground">Top performer will hit</div>
              <div className="text-3xl font-bold text-primary">
                {projectedROI.toFixed(0)}%
              </div>
              <div className="text-xs text-primary">ROI</div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-4 border border-blue-500/20">
              <div className="text-sm text-muted-foreground">Series B ready</div>
              <div className="text-3xl font-bold text-blue-600">
                {seriesBReady}
              </div>
              <div className="text-xs text-blue-600">startups</div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 p-4 border border-amber-500/20">
              <div className="text-sm text-muted-foreground">Need intervention</div>
              <div className="text-3xl font-bold text-amber-600">
                {needsIntervention.length}
              </div>
              <div className="text-xs text-amber-600">NOW</div>
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="space-y-3 pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <PlayCircle className="h-4 w-4 text-primary" />
            <span>RECOMMENDED ACTIONS:</span>
          </div>

          {recommendations.map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-4 rounded-lg bg-card/50 p-4 backdrop-blur-sm border border-border/30 hover:border-border hover:bg-card transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                {rec.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{idx + 1}. {rec.title}</span>
                  {rec.priority === 'urgent' && (
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600">
                      URGENT
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{rec.description}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Sparkles className="h-4 w-4" />
            Run different scenarios
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
            <Users className="h-4 w-4" />
            Share with LPs
          </button>
        </div>
      </div>
    </motion.div>
  );
}
