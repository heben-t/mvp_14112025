
'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fadeIn } from '@/lib/utils/animation';

interface Props {
  timeSeries: any[];
}

export default function AdoptionVelocityGraph({ timeSeries }: Props) {
  const chartData = timeSeries?.map((item) => ({
    week: `W${item?.week}`,
    adoption: item?.value?.toFixed(1),
  })) || [];

  return (
    <motion.div
      {...fadeIn}
      className="relative overflow-hidden rounded-2xl bg-card p-6 shadow-xl border border-border/50"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">User Adoption & Engagement</h3>
            <p className="text-sm text-muted-foreground">Hockey stick growth trajectory</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">94% Adoption</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="adoptionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="week" 
                tickLine={false}
                tick={{ fontSize: 10 }}
                label={{ value: 'Week', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 11 } }}
              />
              <YAxis 
                tickLine={false}
                tick={{ fontSize: 10 }}
                label={{ value: 'Adoption %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: 11
                }}
              />
              <Line 
                type="monotone" 
                dataKey="adoption" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
                fill="url(#adoptionGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">12%</div>
            <div className="text-xs text-muted-foreground">Week 1</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">94%</div>
            <div className="text-xs text-muted-foreground">Week 12</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">2.3%</div>
            <div className="text-xs text-muted-foreground">Fallback Rate</div>
          </div>
        </div>

        {/* Badge */}
        <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 p-3">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            "Fastest adoption in UAE startup history"
          </span>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Active daily users:</span>
            <span className="font-semibold">847/900 (94%)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">AI interactions:</span>
            <span className="font-semibold">47,293 this week</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
