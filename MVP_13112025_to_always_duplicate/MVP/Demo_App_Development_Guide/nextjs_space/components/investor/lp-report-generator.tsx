
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Eye, Edit, Send, CheckCircle2 } from 'lucide-react';
import { fadeIn } from '@/lib/utils/animation';

export default function LPReportGenerator() {
  const [progress, setProgress] = useState(82);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 82;
        return Math.min(prev + 1, 95);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const sections = [
    { name: 'AI Impact Across Portfolio', completed: true },
    { name: 'Value Creation Metrics', completed: true },
    { name: 'Efficiency Improvements', completed: true },
    { name: 'Founder Testimonials', completed: false, gathering: true },
    { name: '2025 AI Projections', completed: false, gathering: true },
  ];

  return (
    <motion.div
      {...fadeIn}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-purple-50 dark:to-purple-950/20 p-6 shadow-xl border border-border/50"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <h3 className="text-xl font-bold">Automated LP Reporting</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Next LP Meeting: 14 days</span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Report Status</span>
            <span className="font-semibold text-purple-600">{progress}% ready</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
            />
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-muted-foreground">Sections completed:</div>
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
            >
              {section.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground animate-pulse" />
              )}
              <div className="flex-1">
                <div className="font-medium">{section.name}</div>
                {section.gathering && (
                  <div className="text-xs text-muted-foreground">Gathering data...</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          <button className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>
    </motion.div>
  );
}
