
'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, ExternalLink } from 'lucide-react';
import { fadeIn } from '@/lib/utils/animation';
import { formatNumber } from '@/lib/utils/format';

interface Props {
  companies: any[];
}

export default function MoneyMultipleMonitor({ companies }: Props) {
  const totalInvestment = companies?.reduce((sum, c) => sum + (c?.investment || 0), 0) || 10;
  const totalValue = companies?.reduce((sum, c) => sum + (c?.currentValue || 0), 0) || 34.7;
  const multiple = totalValue / totalInvestment;

  const topPerformers = companies
    ?.sort((a, b) => (b?.multiple || 0) - (a?.multiple || 0))
    ?.slice(0, 3) || [];

  return (
    <motion.div
      {...fadeIn}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-green-50 dark:to-green-950/20 p-6 shadow-xl border border-border/50"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h3 className="text-xl font-bold">Portfolio Value Creation</h3>
        </div>

        {/* Main Stats */}
        <div className="space-y-4">
          <div className="rounded-xl bg-white/50 dark:bg-card/50 p-4 backdrop-blur-sm">
            <div className="text-sm text-muted-foreground">Initial Investment</div>
            <div className="text-3xl font-bold">
              {formatNumber(totalInvestment * 1000000)}
            </div>
            <div className="text-xs text-muted-foreground">across {companies?.length || 9} startups</div>
          </div>

          <div className="rounded-xl bg-green-500/10 p-4 border border-green-500/20">
            <div className="text-sm text-green-600 dark:text-green-400">Current AI-Generated Value</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatNumber(totalValue * 1000000)}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-600 dark:text-green-400">
                {multiple.toFixed(2)}x return
              </span>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-muted-foreground">Top Performers</div>
          {topPerformers.map((company, idx) => (
            <motion.button
              key={company?.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="w-full text-left rounded-lg bg-muted/50 p-4 hover:bg-muted transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{idx + 1}. {company?.name}</div>
                  <div className="text-xs text-muted-foreground">{company?.aiImplementation}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">
                    {company?.multiple?.toFixed(1)}x
                  </div>
                  <div className="text-xs text-muted-foreground">{company?.category}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Action Button */}
        <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <ExternalLink className="h-4 w-4" />
          Deep dive on any startup
        </button>
      </div>
    </motion.div>
  );
}
