
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Calendar } from 'lucide-react';
import { fadeIn } from '@/lib/utils/animation';

interface Props {
  metrics: any;
}

export default function TimeLiberationClock({ metrics }: Props) {
  const [animatedHours, setAnimatedHours] = useState(0);
  const targetHours = metrics?.hoursSaved || 4827;
  const employeesFreed = metrics?.employeesFreed || 2.3;

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = targetHours / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetHours) {
        setAnimatedHours(targetHours);
        clearInterval(timer);
      } else {
        setAnimatedHours(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [targetHours]);

  return (
    <motion.div
      {...fadeIn}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-blue-50 dark:to-blue-950/20 p-6 shadow-xl border border-border/50 hover:shadow-blue-500/20 transition-all duration-300"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-semibold uppercase tracking-wide">Human Hours Returned</span>
        </div>

        {/* Main Number */}
        <div className="space-y-2">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            {animatedHours.toLocaleString()} hours
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>= {employeesFreed} employees freed</span>
          </div>
        </div>

        {/* Visual Calendar */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Work accomplished in record time</span>
          </div>
          
          {/* Calendar Visual */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded ${
                  i < 20
                    ? 'bg-blue-500 dark:bg-blue-600'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <div className="text-center text-xs font-medium text-blue-600 dark:text-blue-400">
            "Your AI did 6 months of human work in 1 month"
          </div>
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
}
