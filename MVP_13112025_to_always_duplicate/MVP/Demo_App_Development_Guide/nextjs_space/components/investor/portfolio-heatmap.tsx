
'use client';

import { motion } from 'framer-motion';
import { Map, TrendingUp } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fadeIn } from '@/lib/utils/animation';

interface Props {
  companies: any[];
}

export default function PortfolioHeatmap({ companies }: Props) {
  const chartData = companies?.map((company) => ({
    name: company?.name,
    adoption: company?.adoptionRate,
    roi: company?.roi,
    status: company?.status,
  })) || [];

  const getColor = (status: string) => {
    switch (status) {
      case 'winner':
        return '#10b981'; // green
      case 'promising':
        return '#f59e0b'; // amber
      case 'struggling':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const statusCounts = {
    winners: companies?.filter((c) => c?.status === 'winner')?.length || 0,
    promising: companies?.filter((c) => c?.status === 'promising')?.length || 0,
    struggling: companies?.filter((c) => c?.status === 'struggling')?.length || 0,
  };

  return (
    <motion.div
      {...fadeIn}
      className="relative overflow-hidden rounded-2xl bg-card p-6 shadow-xl border border-border/50"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-xl font-bold">Portfolio AI Performance Matrix</h3>
              <p className="text-sm text-muted-foreground">ROI vs Adoption Rate</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>Winners ({statusCounts.winners})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span>Promising ({statusCounts.promising})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>Struggling ({statusCounts.struggling})</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                dataKey="adoption" 
                name="Adoption"
                unit="%"
                domain={[0, 100]}
                tickLine={false}
                tick={{ fontSize: 10 }}
                label={{ value: 'Adoption Rate (%)', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 11 } }}
              />
              <YAxis 
                type="number" 
                dataKey="roi" 
                name="ROI"
                unit="%"
                tickLine={false}
                tick={{ fontSize: 10 }}
                label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: 11
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'adoption') return [`${value}%`, 'Adoption'];
                  if (name === 'roi') return [`${value}%`, 'ROI'];
                  return [value, name];
                }}
              />
              <Scatter name="Companies" data={chartData}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.status)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Company List */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50 md:grid-cols-4">
          {companies?.slice(0, 8)?.map((company, idx) => (
            <motion.div
              key={company?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-2 rounded-lg bg-muted/50 p-2"
            >
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: getColor(company?.status) }}
              />
              <span className="text-xs font-medium truncate">{company?.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
