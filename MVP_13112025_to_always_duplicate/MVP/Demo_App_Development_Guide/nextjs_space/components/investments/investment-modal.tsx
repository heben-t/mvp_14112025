'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, DollarSign, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const investmentSchema = z.object({
  amount: z.string().min(1, 'Investment amount is required'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

interface InvestmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: {
    id: string;
    title: string;
    minInvestment: number;
    maxInvestment?: number | null;
    equityOffered: number;
    fundraisingGoal: number;
  };
}

export function InvestmentModal({
  open,
  onOpenChange,
  campaign,
}: InvestmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const form = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      amount: campaign.minInvestment.toString(),
      agreeToTerms: false,
    },
  });

  const calculateEquity = (amount: number) => {
    const percentage = (amount / campaign.fundraisingGoal) * campaign.equityOffered;
    return percentage.toFixed(4);
  };

  const watchAmount = form.watch('amount');
  const investmentAmount = parseFloat(watchAmount?.replace(/[^0-9.-]+/g, '') || '0');

  const handleSubmit = async (data: InvestmentFormData) => {
    setIsSubmitting(true);

    try {
      const amount = parseFloat(data.amount.replace(/[^0-9.-]+/g, ''));

      if (amount < campaign.minInvestment) {
        toast.error(`Minimum investment is $${campaign.minInvestment.toLocaleString()}`);
        setIsSubmitting(false);
        return;
      }

      if (campaign.maxInvestment && amount > campaign.maxInvestment) {
        toast.error(`Maximum investment is $${campaign.maxInvestment.toLocaleString()}`);
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/investments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaign.id,
          amount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create investment');
      }

      const result = await response.json();

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.success('Investment created successfully!');
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Investment error:', error);
      toast.error(error.message || 'Failed to process investment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invest in {campaign.title}</DialogTitle>
          <DialogDescription>
            Enter your investment amount and complete the checkout process
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Investment Range</p>
                <p className="text-sm">
                  Min: ${campaign.minInvestment.toLocaleString()}
                  {campaign.maxInvestment &&
                    ` - Max: $${campaign.maxInvestment.toLocaleString()}`}
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="amount">Investment Amount *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                {...form.register('amount')}
                placeholder={campaign.minInvestment.toString()}
                className="pl-9"
                type="number"
                step="100"
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {investmentAmount > 0 && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">
                You will receive approximately
              </p>
              <p className="text-2xl font-bold">
                {calculateEquity(investmentAmount)}% equity
              </p>
            </div>
          )}

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => {
                setAgreeToTerms(checked as boolean);
                form.setValue('agreeToTerms', checked as boolean);
              }}
            />
            <label htmlFor="terms" className="text-sm leading-none cursor-pointer">
              I agree to the{' '}
              <a href="/terms" className="underline" target="_blank">
                terms and conditions
              </a>{' '}
              and understand the risks associated with startup investments
            </label>
          </div>
          {form.formState.errors.agreeToTerms && (
            <p className="text-sm text-destructive">
              {form.formState.errors.agreeToTerms.message}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed to Checkout'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
