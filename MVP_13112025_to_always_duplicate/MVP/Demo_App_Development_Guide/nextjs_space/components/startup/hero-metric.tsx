
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle2, Sparkles } from 'lucide-react';
import { fadeIn } from '@/lib/utils/animation';

interface Props {
  metrics: any;
}

export default function HeroMetric({ metrics }: Props) {
  const [animatedROI, setAnimatedROI] = useState(0);
  const targetROI = metrics?.currentROI || 327;

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = targetROI / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetROI) {
        setAnimatedROI(targetROI);
        clearInterval(timer);
      } else {
        setAnimatedROI(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [targetROI]);

  return (
    <motion.div
      {...fadeIn}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl border border-border/50 hover:shadow-primary/20 transition-all duration-300"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(100,181,255,0.1),transparent)]" />
      
      {/* Sparkle Effect */}
      <div className="absolute top-4 right-4">
        <Sparkles className="h-6 w-6 text-primary animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        {/* Label */}
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>PROVEN ROI</span>
        </div>

        {/* Main Number */}
        <div className="space-y-2">
          <div className="text-7xl font-bold bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-transparent">
            {animatedROI}%
          </div>
          
          {/* Trend */}
          <div className="flex items-center justify-center gap-2 text-primary">
            <TrendingUp className="h-5 w-5" />
            <span className="text-2xl font-semibold">
              ▲ {metrics?.roiTrend || 47}% this month
            </span>
          </div>
        </div>

        {/* Certification Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3 border border-primary/20"
        >
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <span className="font-semibold text-primary">Verified by HebedAI</span>
        </motion.div>

        {/* Floating Badge */}
        <div className="absolute -top-3 -right-3 rotate-12">
          <div className="rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-lg">
            TOP 5%
          </div>
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
}
