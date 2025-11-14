
'use client';

import { motion } from 'framer-motion';
import { Target, Download, TrendingUp } from 'lucide-react';
import { fadeIn } from '@/lib/utils/animation';

interface Props {
  benchmarks: any[];
}

export default function BenchmarkIntelligence({ benchmarks }: Props) {
  const categories = [
    { key: 'roi', label: 'Avg ROI', unit: '%' },
    { key: 'adoption', label: 'Adoption', unit: '%' },
    { key: 'efficiency', label: 'Efficiency', unit: 'x' },
    { key: 'timeToValue', label: 'Time to Value', unit: 'd' },
  ];

  const getBenchmark = (key: string) => {
    return benchmarks?.find((b) => b?.category === key);
  };

  const calculatePerformance = (portfolio: number, gcc: number) => {
    return ((portfolio - gcc) / gcc * 100).toFixed(0);
  };

  return (
    <motion.div
      {...fadeIn}
      className="relative overflow-hidden rounded-2xl bg-card p-6 shadow-xl border border-border/50"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-xl font-bold">Your Portfolio vs Market</h3>
              <p className="text-sm text-muted-foreground">Benchmark comparison</p>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
            <Download className="h-4 w-4" />
            Report
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left font-semibold">Metric</th>
                <th className="pb-3 text-center font-semibold">Your Portfolio</th>
                <th className="pb-3 text-center font-semibold">GCC Average</th>
                <th className="pb-3 text-center font-semibold">Global Top 10%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat, idx) => {
                const benchmark = getBenchmark(cat.key);
                const performance = benchmark ? calculatePerformance(
                  benchmark.portfolioValue,
                  benchmark.gccAverage
                ) : '0';
                
                return (
                  <motion.tr
                    key={cat.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4 font-medium">{cat.label}</td>
                    <td className="py-4 text-center">
                      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                        {benchmark?.portfolioValue?.toFixed(cat.unit === 'd' ? 0 : 1)}
                        {cat.unit}
                      </div>
                    </td>
                    <td className="py-4 text-center font-semibold">
                      {benchmark?.gccAverage?.toFixed(cat.unit === 'd' ? 0 : 1)}
                      {cat.unit}
                    </td>
                    <td className="py-4 text-center font-semibold text-muted-foreground">
                      {benchmark?.globalTop10?.toFixed(cat.unit === 'd' ? 0 : 1)}
                      {cat.unit}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border border-primary/20">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="font-semibold text-primary">
            Your portfolio performs 83% better than GCC average
          </span>
        </div>
      </div>
    </motion.div>
  );
}
