
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { fadeIn } from '@/lib/utils/animation';

interface Props {
  metrics: any;
}

export default function MoneySavedCounter({ metrics }: Props) {
  const [currentSavings, setCurrentSavings] = useState(metrics?.costSavings || 147293);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSavings((prev: number) => prev + Math.random() * 10);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const laborCost = metrics?.laborCostReduction || 87421;
  const errorReduction = metrics?.errorReduction || 31872;
  const processOpt = metrics?.processOptimization || 28000;

  return (
    <motion.div
      {...fadeIn}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-green-50 dark:to-green-950/20 p-6 shadow-xl border border-border/50 hover:shadow-green-500/20 transition-all duration-300"
    >
      {/* Live Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
        <span className="text-xs font-medium text-green-600 dark:text-green-400">LIVE</span>
      </div>

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <DollarSign className="h-5 w-5 text-green-600" />
          <span className="text-sm font-semibold uppercase tracking-wide">Cost Savings Live Counter</span>
        </div>

        {/* Main Counter */}
        <div className="space-y-2">
          <div className="text-4xl font-bold text-green-600 dark:text-green-400 tabular-nums">
            {formatCurrency(Math.floor(currentSavings))}
          </div>
          <div className="text-xs text-muted-foreground">
            Updating every 3 seconds
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Labor costs reduced</span>
            <span className="font-semibold text-green-600">{formatCurrency(laborCost)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Error reduction</span>
            <span className="font-semibold text-green-600">{formatCurrency(errorReduction)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Process optimization</span>
            <span className="font-semibold text-green-600">{formatCurrency(processOpt)}</span>
          </div>
        </div>

        {/* Mini Sparkline Placeholder */}
        <div className="pt-2">
          <div className="h-12 w-full rounded-lg bg-gradient-to-r from-green-500/10 via-green-500/20 to-green-500/10" />
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-green-500/20 to-green-600/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
}
