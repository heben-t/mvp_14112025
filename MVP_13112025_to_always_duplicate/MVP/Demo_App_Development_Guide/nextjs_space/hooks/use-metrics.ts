'use client';

import { useEffect, useState } from 'react';

interface MetricsData {
  Consolidated_AI_Impact: number | null;
  AI_Impact_Startup_i: number | null;
  Financial_i: number | null;
  Technology_i: number | null;
  Industry_i: number | null;
  Social_i: number | null;
  MRR_now: number | null;
  active_customers: number | null;
  churn_rate: number | null;
}

export function useMetrics(startupProfileId: string | null) {
  const [metrics, setMetrics] = useState<MetricsData>({
    Consolidated_AI_Impact: null,
    AI_Impact_Startup_i: null,
    Financial_i: null,
    Technology_i: null,
    Industry_i: null,
    Social_i: null,
    MRR_now: null,
    active_customers: null,
    churn_rate: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!startupProfileId) {
      setLoading(false);
      return;
    }

    const fetchMetrics = async () => {
      try {
        const response = await fetch(`/api/metrics/${startupProfileId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Poll for updates every 30 seconds for real-time updates
    const interval = setInterval(fetchMetrics, 30000);

    return () => clearInterval(interval);
  }, [startupProfileId]);

  return { metrics, loading, error };
}
