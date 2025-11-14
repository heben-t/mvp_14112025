
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, DollarSign, Heart, TrendingUp } from 'lucide-react';
import { fadeIn } from '@/lib/utils/animation';

export default function BeforeAfterKiller() {
  const [operations, setOperations] = useState<any[]>([]);
  const [selectedOp, setSelectedOp] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const response = await fetch('/api/operations');
        const data = await response.json();
        setOperations(data || []);
      } catch (error) {
        console.error('Error fetching operations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOperations();
  }, []);

  if (loading || operations.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-card">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const op = operations[selectedOp];
  const timeReduction = ((op?.timeBefore - op?.timeAfter) / op?.timeBefore * 100) || 0;
  const costReduction = ((op?.costBefore - op?.costAfter) / op?.costBefore * 100) || 0;
  const csatImprovement = ((op?.csatAfter - op?.csatBefore) / op?.csatBefore * 100) || 0;
  const volumeIncrease = (op?.volumeAfter / op?.volumeBefore) || 0;

  return (
    <motion.div
      {...fadeIn}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-accent/5 p-8 shadow-xl border border-border/50"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">The Transformation</h2>
            <p className="text-sm text-muted-foreground">Click different operations to see the impact</p>
          </div>
          
          {/* Operation Selector */}
          <div className="flex gap-2">
            {operations.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOp(idx)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedOp === idx
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {operations[idx]?.category}
              </button>
            ))}
          </div>
        </div>

        {/* Before/After Comparison */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedOp}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-primary">{op?.name}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              {/* Before */}
              <div className="md:col-span-2 space-y-4 rounded-xl bg-destructive/10 p-6 border border-destructive/20">
                <div className="text-center text-sm font-semibold text-destructive uppercase">Before AI</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Time:</span>
                    <span className="text-lg font-bold">{op?.timeBefore?.toFixed(1)}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cost:</span>
                    <span className="text-lg font-bold">${op?.costBefore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">CSAT:</span>
                    <span className="text-lg font-bold">{op?.csatBefore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Volume:</span>
                    <span className="text-lg font-bold">{op?.volumeBefore}/day</span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg">
                  <ArrowRight className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>

              {/* After */}
              <div className="md:col-span-2 space-y-4 rounded-xl bg-primary/10 p-6 border border-primary/20">
                <div className="text-center text-sm font-semibold text-primary uppercase">With AI</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Time:</span>
                    <div className="text-right">
                      <div className="text-lg font-bold">{(op?.timeAfter * 60)?.toFixed(0)}min</div>
                      <div className="text-xs text-primary">({timeReduction.toFixed(1)}% ↓)</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cost:</span>
                    <div className="text-right">
                      <div className="text-lg font-bold">${op?.costAfter?.toFixed(2)}</div>
                      <div className="text-xs text-primary">({costReduction.toFixed(1)}% ↓)</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">CSAT:</span>
                    <div className="text-right">
                      <div className="text-lg font-bold">{op?.csatAfter}%</div>
                      <div className="text-xs text-primary">({csatImprovement.toFixed(1)}% ↑)</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Volume:</span>
                    <div className="text-right">
                      <div className="text-lg font-bold">{op?.volumeAfter?.toLocaleString()}/day</div>
                      <div className="text-xs text-primary">({volumeIncrease.toFixed(0)}x ↑)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
