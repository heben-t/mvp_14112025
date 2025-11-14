
'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { fadeIn } from '@/lib/utils/animation';

interface Props {
  companies: any[];
}

export default function EfficiencyLeagueTable({ companies }: Props) {
  const getTrendIcon = (trend: string, value: number) => {
    if (trend === 'up' || value > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (trend === 'down' || value < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendArrows = (value: number) => {
    if (value >= 2) return '↑↑';
    if (value >= 1) return '↑';
    if (value <= -2) return '↓↓';
    if (value <= -1) return '↓';
    return '→';
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
            <Trophy className="h-5 w-5 text-amber-600" />
            <div>
              <h3 className="text-xl font-bold">Portfolio Rankings</h3>
              <p className="text-sm text-muted-foreground">Q4 2024</p>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left font-semibold">#</th>
                <th className="pb-3 text-left font-semibold">STARTUP</th>
                <th className="pb-3 text-right font-semibold">AI ROI</th>
                <th className="pb-3 text-right font-semibold">EFFICIENCY</th>
                <th className="pb-3 text-center font-semibold">TREND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {companies?.slice(0, 9)?.map((company, idx) => (
                <motion.tr
                  key={company?.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{idx + 1}.</span>
                      {idx < 3 && <Trophy className="h-4 w-4 text-amber-500" />}
                    </div>
                  </td>
                  <td className="py-3 font-medium">{company?.name}</td>
                  <td className="py-3 text-right font-semibold text-primary">
                    {company?.roi?.toFixed(0)}%
                  </td>
                  <td className="py-3 text-right">
                    <span className="font-semibold">{company?.efficiency}/100</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-center gap-1">
                      {getTrendIcon(company?.trend, company?.trendValue)}
                      <span className={`text-xs font-medium ${
                        (company?.trendValue || 0) > 0 
                          ? 'text-green-600' 
                          : (company?.trendValue || 0) < 0 
                          ? 'text-red-600' 
                          : 'text-muted-foreground'
                      }`}>
                        {getTrendArrows(company?.trendValue || 0)}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center gap-3 pt-4 border-t border-border/50">
          <button className="text-sm text-primary font-medium hover:underline">
            Export for LP report
          </button>
          <span className="text-muted-foreground">•</span>
          <button className="text-sm text-primary font-medium hover:underline">
            Share with founders
          </button>
        </div>
      </div>
    </motion.div>
  );
}
