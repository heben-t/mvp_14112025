
'use client';

import { motion } from 'framer-motion';
import { Target, Download, TrendingUp } from 'lucide-react';
import { fadeIn } from '@/lib/utils/animation';

interface Props {
  metrics: any;
}

export default function CompetitiveAdvantageBox({ metrics }: Props) {
  const processingSpeed = metrics?.processingSpeed || 12;
  const accuracy = metrics?.accuracy || 94;
  const costPerOp = metrics?.costPerOperation || 87;
  const uptime = metrics?.uptime || 99.97;

  const comparisons = [
    {
      label: 'Processing Speed',
      value: processingSpeed,
      max: 15,
      comparison: `${processingSpeed}x faster`,
    },
    {
      label: 'Accuracy',
      value: accuracy,
      max: 100,
      comparison: `${accuracy}% vs 71%`,
    },
    {
      label: 'Cost per Operation',
      value: costPerOp,
      max: 100,
      comparison: `${costPerOp}% cheaper`,
    },
    {
      label: 'Uptime',
      value: uptime,
      max: 100,
      comparison: `${uptime}% vs 94%`,
    },
  ];

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
            <h3 className="text-xl font-bold">Efficiency vs Competitors</h3>
          </div>
          <button 
            onClick={() => {
              alert('Generating Competitive Advantage Report...\n\nThis would download a PDF with detailed benchmarking data.');
            }}
            className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <Download className="h-4 w-4" />
            Report
          </button>
        </div>

        <p className="text-sm text-muted-foreground">Your AI vs Industry Average</p>

        {/* Comparisons */}
        <div className="space-y-6">
          {comparisons.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-primary font-semibold">{item.comparison}</span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / item.max) * 100}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Badge */}
        <div className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border border-primary/20">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="font-semibold text-primary">
            You're in the TOP 5% of AI implementations globally
          </span>
        </div>
      </div>
    </motion.div>
  );
}
