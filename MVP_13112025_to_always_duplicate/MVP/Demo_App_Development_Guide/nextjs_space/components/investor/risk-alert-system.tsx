
'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Eye, TrendingUp, Calendar } from 'lucide-react';
import { fadeIn } from '@/lib/utils/animation';

interface Props {
  alerts: any[];
}

export default function RiskAlertSystem({ alerts }: Props) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'urgent':
        return 'bg-red-500/10 border-red-500/20 text-red-600';
      case 'watch':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-600';
      case 'opportunity':
        return 'bg-green-500/10 border-green-500/20 text-green-600';
      default:
        return 'bg-muted border-border text-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'urgent':
        return '🔴';
      case 'watch':
        return '🟡';
      case 'opportunity':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const urgentCount = alerts?.filter((a) => a?.severity === 'urgent')?.length || 0;
  const watchCount = alerts?.filter((a) => a?.severity === 'watch')?.length || 0;
  const opportunityCount = alerts?.filter((a) => a?.severity === 'opportunity')?.length || 0;

  return (
    <motion.div
      {...fadeIn}
      className="relative overflow-hidden rounded-2xl bg-card p-6 shadow-xl border border-border/50"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="text-xl font-bold">Portfolio Alerts</h3>
          </div>
          <div className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
            ACTION REQUIRED
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-red-500/10 p-3 border border-red-500/20">
            <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
            <div className="text-xs text-red-600">Urgent</div>
          </div>
          <div className="rounded-lg bg-amber-500/10 p-3 border border-amber-500/20">
            <div className="text-2xl font-bold text-amber-600">{watchCount}</div>
            <div className="text-xs text-amber-600">Watch</div>
          </div>
          <div className="rounded-lg bg-green-500/10 p-3 border border-green-500/20">
            <div className="text-2xl font-bold text-green-600">{opportunityCount}</div>
            <div className="text-xs text-green-600">Opportunity</div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {alerts?.slice(0, 4)?.map((alert, idx) => (
            <motion.div
              key={alert?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-lg p-4 border ${getSeverityColor(alert?.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-xl">{getSeverityIcon(alert?.severity)}</div>
                <div className="flex-1 space-y-1">
                  <div className="font-semibold">{alert?.severity?.toUpperCase()}: {alert?.title}</div>
                  <div className="text-sm opacity-90">{alert?.description}</div>
                  <div className="text-xs opacity-70">{alert?.company?.name}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Eye className="h-4 w-4" />
            View recommendations
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
            <Calendar className="h-4 w-4" />
            Schedule calls
          </button>
        </div>
      </div>
    </motion.div>
  );
}
