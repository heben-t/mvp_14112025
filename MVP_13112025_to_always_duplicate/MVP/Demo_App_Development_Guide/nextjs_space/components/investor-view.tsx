
'use client';

import { useEffect, useState } from 'react';
import PortfolioHeatmap from './investor/portfolio-heatmap';
import MoneyMultipleMonitor from './investor/money-multiple-monitor';
import RiskAlertSystem from './investor/risk-alert-system';
import EfficiencyLeagueTable from './investor/efficiency-league-table';
import LPReportGenerator from './investor/lp-report-generator';
import BenchmarkIntelligence from './investor/benchmark-intelligence';
import DueDiligenceAssistant from './investor/due-diligence-assistant';
import CrystalBall from './investor/crystal-ball';

export default function InvestorView() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesRes, alertsRes, benchmarksRes] = await Promise.all([
          fetch('/api/portfolio'),
          fetch('/api/alerts'),
          fetch('/api/benchmarks'),
        ]);

        const [companiesData, alertsData, benchmarksData] = await Promise.all([
          companiesRes.json(),
          alertsRes.json(),
          benchmarksRes.json(),
        ]);

        setCompanies(companiesData || []);
        setAlerts(alertsData || []);
        setBenchmarks(benchmarksData || []);
      } catch (error) {
        console.error('Error fetching investor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh data every 10 seconds
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Row - Heatmap */}
      <div className="grid grid-cols-1 gap-6">
        <PortfolioHeatmap companies={companies} />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MoneyMultipleMonitor companies={companies} />
        <RiskAlertSystem alerts={alerts} />
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EfficiencyLeagueTable companies={companies} />
        <LPReportGenerator />
      </div>

      {/* Fourth Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BenchmarkIntelligence benchmarks={benchmarks} />
        <DueDiligenceAssistant />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6">
        <CrystalBall companies={companies} />
      </div>
    </div>
  );
}
