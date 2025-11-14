
'use client';

import { motion } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle2, XCircle, FileText, BarChart3 } from 'lucide-react';
import { fadeIn } from '@/lib/utils/animation';

export default function DueDiligenceAssistant() {
  const newDeal = {
    name: 'NewStartup.ai',
    claimedROI: 250,
    analyzedROI: 142,
    redFlags: [
      'Adoption metrics 40% below successful patterns',
      'Burn rate incompatible with AI savings',
      'Technical implementation scores 4/10',
    ],
    similarStartups: 47,
    successProbability: 34,
  };

  return (
    <motion.div
      {...fadeIn}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-red-50 dark:to-red-950/20 p-6 shadow-xl border border-border/50"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold">New Deal Analyzer</h3>
          </div>
          <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            AI-POWERED
          </div>
        </div>

        {/* Deal Info */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Evaluating:</div>
              <div className="text-xl font-bold">{newDeal.name}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Claimed ROI</div>
                <div className="text-lg font-semibold">{newDeal.claimedROI}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Our Analysis</div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <div className="text-lg font-semibold text-amber-600">
                    {newDeal.analyzedROI}%
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">more realistic</div>
              </div>
            </div>
          </div>
        </div>

        {/* Red Flags */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <XCircle className="h-4 w-4" />
            <span>Red Flags:</span>
          </div>
          {newDeal.redFlags.map((flag, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 border border-destructive/20"
            >
              <div className="text-destructive">•</div>
              <div className="text-sm text-destructive">{flag}</div>
            </motion.div>
          ))}
        </div>

        {/* Analysis */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{newDeal.similarStartups}</div>
            <div className="text-xs text-muted-foreground">Similar startups in database</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{newDeal.successProbability}%</div>
            <div className="text-xs text-muted-foreground">Success probability</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <FileText className="h-4 w-4" />
            Full DD Report
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
            <BarChart3 className="h-4 w-4" />
            Compare
          </button>
        </div>
      </div>
    </motion.div>
  );
}
