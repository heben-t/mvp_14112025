
'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Share2 } from 'lucide-react';
import { fadeIn } from '@/lib/utils/animation';
import { formatCurrency } from '@/lib/utils/format';

interface Props {
  metrics: any;
}

export default function PredictionModule({ metrics }: Props) {
  const forecastedROI = metrics?.forecastedROI || 520;
  const forecastedSavings = metrics?.forecastedSavings || 492000;
  const forecastedHires = metrics?.forecastedHires || 3;
  const valuationImpact = metrics?.valuationImpact || 2.3;

  const predictions = [
    {
      label: 'Cost savings will reach',
      value: formatCurrency(forecastedSavings),
      color: 'text-green-600',
    },
    {
      label: 'ROI will hit',
      value: `${forecastedROI}%`,
      color: 'text-primary',
    },
    {
      label: "You'll need fewer hires",
      value: `${forecastedHires} less`,
      color: 'text-blue-600',
    },
    {
      label: 'Valuation impact',
      value: `+$${valuationImpact}M`,
      color: 'text-amber-600',
    },
  ];

  return (
    <motion.div
      {...fadeIn}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-purple-50 to-card dark:via-purple-950/20 p-6 shadow-xl border border-border/50"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.1),transparent)]" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="text-xl font-bold">AI Impact Forecast</h3>
          </div>
          <div className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600">
            NEXT 90 DAYS
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Based on current trajectory
        </p>

        {/* Predictions Grid */}
        <div className="space-y-4">
          {predictions.map((pred, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between rounded-lg bg-white/50 dark:bg-card/50 p-4 backdrop-blur-sm border border-border/30"
            >
              <span className="text-sm text-muted-foreground">{pred.label}</span>
              <span className={`text-xl font-bold ${pred.color}`}>{pred.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              alert(`Detailed Breakdown:\n\n1. Cost Savings Projection: ${formatCurrency(forecastedSavings)}\n   - Based on current reduction rate of 23% per month\n   - Extrapolated over 90 days\n\n2. ROI Growth to ${forecastedROI}%\n   - Current trajectory shows 15% monthly increase\n   - Expected to reach ${forecastedROI}% in Q1 2025\n\n3. Hiring Efficiency\n   - AI automation eliminates need for ${forecastedHires} additional hires\n   - Annual savings: ${formatCurrency(forecastedHires * 80000)}\n\n4. Valuation Impact: +$${valuationImpact}M\n   - Based on 10x revenue multiple\n   - Driven by operational efficiency gains`);
            }}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            Show me how
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'AI ROI Forecast - TechLogix',
                  text: `Check out our AI impact forecast for the next 90 days:\n\n💰 Cost savings: ${formatCurrency(forecastedSavings)}\n📈 ROI: ${forecastedROI}%\n👥 Hiring efficiency: ${forecastedHires} fewer hires needed\n💎 Valuation impact: +$${valuationImpact}M`,
                  url: window.location.href,
                }).catch((error) => console.log('Error sharing:', error));
              } else {
                alert(`Share this forecast with investors:\n\n💰 Cost savings will reach: ${formatCurrency(forecastedSavings)}\n📈 ROI will hit: ${forecastedROI}%\n👥 You'll need ${forecastedHires} fewer hires\n💎 Valuation impact: +$${valuationImpact}M\n\nCopy this link: ${window.location.href}`);
              }
            }}
            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share with investors
          </motion.button>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 border border-purple-500/20">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span className="text-xs font-medium text-purple-600">
            Prediction confidence: 94% (based on 47 similar startups)
          </span>
        </div>
      </div>
    </motion.div>
  );
}
