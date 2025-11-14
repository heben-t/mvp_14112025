
'use client';

import { motion } from 'framer-motion';
import { FileText, Download, Share2, Clock } from 'lucide-react';
import { fadeIn } from '@/lib/utils/animation';

interface Props {
  metrics: any;
}

export default function InvestorReadyPacket({ metrics }: Props) {
  const handleDownload = (type: string) => {
    // In a real implementation, this would generate actual PDF/PPT files
    alert(`Generating ${type} report... This is a demo.`);
  };

  const reports = [
    { name: 'Monthly ROI Report', formats: ['PDF', 'PPT'] },
    { name: 'Efficiency Audit', formats: ['PDF', 'PPT'] },
    { name: 'AI Performance Certificate', formats: ['PDF', 'SHARE'] },
    { name: 'Integration with Pitch Deck', formats: ['EXPORT'] },
  ];

  return (
    <motion.div
      {...fadeIn}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-amber-50 dark:to-amber-950/20 p-6 shadow-xl border border-border/50"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            <h3 className="text-xl font-bold">Board-Ready Reports</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last updated: 3 minutes ago</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 border border-amber-500/20">
          <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
          <span className="text-sm font-medium text-amber-600">Live data</span>
        </div>

        {/* Reports List */}
        <div className="space-y-3">
          {reports.map((report, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between rounded-lg bg-muted/50 p-4 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{report.name}</span>
              </div>
              <div className="flex gap-2">
                {report.formats.map((format) => (
                  <button
                    key={format}
                    onClick={() => handleDownload(`${report.name} - ${format}`)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    {format}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleDownload('Complete Investor Package')}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-4 text-center font-semibold text-primary-foreground shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-center gap-2">
            <Download className="h-5 w-5" />
            <span>Generate Complete Package</span>
          </div>
        </motion.button>

        <p className="text-center text-xs text-muted-foreground">
          Click to generate investor deck in 10 seconds
        </p>
      </div>
    </motion.div>
  );
}
