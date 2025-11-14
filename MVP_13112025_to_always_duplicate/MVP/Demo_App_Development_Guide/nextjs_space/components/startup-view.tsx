
'use client';

import { useEffect, useState } from 'react';
import HeroMetric from './startup/hero-metric';
import MoneySavedCounter from './startup/money-saved-counter';
import TimeLiberationClock from './startup/time-liberation-clock';
import BeforeAfterKiller from './startup/before-after-killer';
import AdoptionVelocityGraph from './startup/adoption-velocity-graph';
import CompetitiveAdvantageBox from './startup/competitive-advantage-box';
import InvestorReadyPacket from './startup/investor-ready-packet';
import PredictionModule from './startup/prediction-module';

export default function StartupView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/startup');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching startup data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh data every 5 seconds for "live" feel
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading || !data?.metrics) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <MoneySavedCounter metrics={data.metrics} />
        <HeroMetric metrics={data.metrics} />
        <TimeLiberationClock metrics={data.metrics} />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 gap-6">
        <BeforeAfterKiller />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AdoptionVelocityGraph timeSeries={data.timeSeriesAdoption} />
        <CompetitiveAdvantageBox metrics={data.metrics} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InvestorReadyPacket metrics={data.metrics} />
        <PredictionModule metrics={data.metrics} />
      </div>
    </div>
  );
}
