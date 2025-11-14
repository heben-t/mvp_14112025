
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, ChevronRight } from 'lucide-react';
import StartupView from './startup-view';
import InvestorView from './investor-view';
import { fadeIn } from '@/lib/utils/animation';

export default function DashboardContainer() {
  const [view, setView] = useState<'startup' | 'investor'>('startup');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-lg">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">AI ROI Dashboard</h1>
                <p className="text-xs text-muted-foreground">Real-time AI Performance Metrics</p>
              </div>
            </motion.div>

            {/* View Toggle */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 rounded-full bg-muted p-1"
            >
              <button
                onClick={() => setView('startup')}
                className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 ${
                  view === 'startup'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 className="h-4 w-4" />
                Startup View
              </button>
              <button
                onClick={() => setView('investor')}
                className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 ${
                  view === 'investor'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Investor View
              </button>
            </motion.div>

            {/* Live Indicator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <span className="text-sm font-medium text-primary">Live</span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'startup' ? <StartupView /> : <InvestorView />}
        </motion.div>
      </main>

      {/* Footer Badge */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-primary-foreground shadow-2xl"
        >
          <span>Powered by HebedAI</span>
          <ChevronRight className="h-4 w-4" />
        </motion.div>
      </div>
    </div>
  );
}
