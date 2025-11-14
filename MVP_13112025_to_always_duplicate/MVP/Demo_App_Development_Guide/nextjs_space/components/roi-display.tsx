'use client';

import { useMetrics } from '@/hooks/use-metrics';

interface ROIDisplayProps {
  startupProfileId: string;
  className?: string;
  type?: 'consolidated' | 'startup';
}

export function ROIDisplay({ startupProfileId, className = '', type = 'consolidated' }: ROIDisplayProps) {
  const { metrics, loading } = useMetrics(startupProfileId);

  if (loading) {
    return (
      <div className={className}>
        <span className="animate-pulse">--</span>%
      </div>
    );
  }

  const value = type === 'consolidated' 
    ? metrics.Consolidated_AI_Impact 
    : metrics.AI_Impact_Startup_i;

  return (
    <div className={className}>
      {value !== null ? value.toFixed(2) : '0.00'}%
    </div>
  );
}
