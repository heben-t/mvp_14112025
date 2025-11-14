'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calculator, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  campaignId: string;
  defaultAmount?: number;
  equityOffered: number;
  valuation: number;
  fundraisingGoal: number;
}

export function InvestmentCalculator({
  campaignId,
  defaultAmount = 5000,
  equityOffered,
  valuation,
  fundraisingGoal,
}: Props) {
  const [investmentAmount, setInvestmentAmount] = useState(defaultAmount);
  const [scenarios, setScenarios] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateReturns = async () => {
    setIsCalculating(true);
    try {
      // Calculate equity percentage based on investment amount
      const equityPercentage = (investmentAmount / fundraisingGoal) * equityOffered;

      const response = await fetch('/api/investments/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          investmentAmount,
          equityPercentage,
          valuation,
        }),
      });

      if (!response.ok) throw new Error('Failed to calculate');
      
      const data = await response.json();
      setScenarios(data.scenarios);
      toast.success('Investment scenarios calculated');
    } catch (error) {
      console.error('Error calculating investment:', error);
      toast.error('Failed to calculate scenarios');
    } finally {
      setIsCalculating(false);
    }
  };

  const equityPercentage = (investmentAmount / fundraisingGoal) * equityOffered;
  const quickAmounts = [1000, 5000, 10000, 25000, 50000];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Investment Calculator
        </CardTitle>
        <CardDescription>
          Explore potential returns on your investment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Investment Amount */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Investment Amount</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="amount"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                min={1000}
                max={fundraisingGoal}
                step={1000}
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant={investmentAmount === amount ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInvestmentAmount(amount)}
              >
                ${(amount / 1000).toFixed(0)}K
              </Button>
            ))}
          </div>

          {/* Slider */}
          <div>
            <Slider
              value={[investmentAmount]}
              onValueChange={(value) => setInvestmentAmount(value[0])}
              min={1000}
              max={Math.min(fundraisingGoal, 100000)}
              step={1000}
              className="w-full"
            />
          </div>
        </div>

        {/* Your Equity */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Your Equity Stake</div>
          <div className="text-3xl font-bold">{equityPercentage.toFixed(2)}%</div>
          <div className="text-sm text-muted-foreground mt-1">
            of a ${(valuation / 1000000).toFixed(1)}M valuation
          </div>
        </div>

        {/* Calculate Button */}
        <Button
          onClick={calculateReturns}
          disabled={isCalculating}
          className="w-full"
        >
          {isCalculating ? 'Calculating...' : 'Calculate Returns'}
        </Button>

        {/* Scenarios */}
        {scenarios && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Exit Scenarios</div>
            
            {/* Conservative */}
            <Card className="bg-red-50 dark:bg-red-950 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="font-medium">Conservative</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Exit at ${(scenarios.conservative.exitValue / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${scenarios.conservative.returnAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {scenarios.conservative.multiple.toFixed(1)}x return
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expected */}
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Minus className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Expected</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Exit at ${(scenarios.expected.exitValue / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${scenarios.expected.returnAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {scenarios.expected.multiple.toFixed(1)}x return
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Optimistic */}
            <Card className="bg-green-50 dark:bg-green-950 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Optimistic</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Exit at ${(scenarios.optimistic.exitValue / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${scenarios.optimistic.returnAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {scenarios.optimistic.multiple.toFixed(1)}x return
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
          <strong>Disclaimer:</strong> These calculations are for illustrative purposes only and do not guarantee future returns. All investments carry risk.
        </div>
      </CardContent>
    </Card>
  );
}
