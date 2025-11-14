'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { FileUpload } from '@/components/ui/file-upload';
import { STORAGE_BUCKETS } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, DollarSign } from 'lucide-react';

const campaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  vslUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  pitchDeck: z.string().optional(),
  fundraisingGoal: z.string().min(1, 'Fundraising goal is required'),
  equityOffered: z.string().min(1, 'Equity offered is required'),
  valuation: z.string().min(1, 'Valuation is required'),
  minInvestment: z.string().min(1, 'Minimum investment is required'),
  maxInvestment: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface Campaign {
  id: string;
  title: string;
  vslUrl: string | null;
  pitchDeck: string | null;
  fundraisingGoal: number;
  equityOffered: number;
  valuation: number;
  minInvestment: number;
  maxInvestment: number | null;
  status: string;
}

interface CampaignFormEditProps {
  campaign: Campaign;
}

export function CampaignForm({ campaign }: CampaignFormEditProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pitchDeckUrl, setPitchDeckUrl] = useState<string>(campaign.pitchDeck || '');
  const [equityValue, setEquityValue] = useState(campaign.equityOffered);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: campaign.title,
      vslUrl: campaign.vslUrl || '',
      pitchDeck: campaign.pitchDeck || '',
      fundraisingGoal: campaign.fundraisingGoal.toString(),
      equityOffered: campaign.equityOffered.toString(),
      valuation: campaign.valuation.toString(),
      minInvestment: campaign.minInvestment.toString(),
      maxInvestment: campaign.maxInvestment?.toString() || '',
    },
  });

  const handleUpload = async (file: File, bucket: string): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('bucket', bucket);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const calculateValuation = () => {
    const goal = parseFloat(form.getValues('fundraisingGoal').replace(/[^0-9.-]+/g, ''));
    const equity = parseFloat(form.getValues('equityOffered'));
    if (goal && equity) {
      const valuation = (goal / equity) * 100;
      form.setValue('valuation', valuation.toFixed(0));
    }
  };

  const handleSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true);

    try {
      const payload = {
        title: data.title,
        vslUrl: data.vslUrl || '',
        pitchDeck: pitchDeckUrl,
        fundraisingGoal: parseFloat(data.fundraisingGoal.replace(/[^0-9.-]+/g, '')),
        equityOffered: parseFloat(data.equityOffered),
        valuation: parseFloat(data.valuation.replace(/[^0-9.-]+/g, '')),
        minInvestment: parseFloat(data.minInvestment.replace(/[^0-9.-]+/g, '')),
        maxInvestment: data.maxInvestment ? parseFloat(data.maxInvestment.replace(/[^0-9.-]+/g, '')) : null,
      };

      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update campaign');
      }

      toast.success('Campaign updated successfully!');
      router.push(`/campaigns/${campaign.id}`);
      router.refresh();
    } catch (error: any) {
      console.error('Campaign update error:', error);
      toast.error(error.message || 'Failed to update campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Update your campaign information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Title *</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="e.g., AI-Powered Customer Service Platform"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vslUrl">VSL Video URL</Label>
            <Input
              id="vslUrl"
              {...form.register('vslUrl')}
              placeholder="https://youtube.com/watch?v=..."
              type="url"
            />
            <p className="text-sm text-muted-foreground">
              YouTube, Vimeo, or direct video link
            </p>
            {form.formState.errors.vslUrl && (
              <p className="text-sm text-destructive">
                {form.formState.errors.vslUrl.message}
              </p>
            )}
          </div>

          <FileUpload
            label="Pitch Deck"
            accept="application/pdf"
            maxSize={50 * 1024 * 1024}
            description="Upload your pitch deck (PDF, max 50MB)"
            onUpload={async (file) => {
              const url = await handleUpload(file, STORAGE_BUCKETS.PITCH_DECKS);
              setPitchDeckUrl(url);
              form.setValue('pitchDeck', url);
              return url;
            }}
            currentUrl={pitchDeckUrl}
            onRemove={() => {
              setPitchDeckUrl('');
              form.setValue('pitchDeck', '');
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fundraising Terms</CardTitle>
          <CardDescription>Set your fundraising goals and terms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fundraisingGoal">Fundraising Goal *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fundraisingGoal"
                  {...form.register('fundraisingGoal')}
                  placeholder="500000"
                  className="pl-9"
                  onChange={(e) => {
                    form.register('fundraisingGoal').onChange(e);
                    calculateValuation();
                  }}
                />
              </div>
              {form.formState.errors.fundraisingGoal && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.fundraisingGoal.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valuation">Company Valuation *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="valuation"
                  {...form.register('valuation')}
                  placeholder="5000000"
                  className="pl-9"
                />
              </div>
              {form.formState.errors.valuation && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.valuation.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Equity Offered: {equityValue}%</Label>
            <Slider
              value={[equityValue]}
              onValueChange={(value) => {
                setEquityValue(value[0]);
                form.setValue('equityOffered', value[0].toString());
                calculateValuation();
              }}
              min={1}
              max={50}
              step={0.5}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Percentage of equity you're offering to investors
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minInvestment">Minimum Investment *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="minInvestment"
                  {...form.register('minInvestment')}
                  placeholder="1000"
                  className="pl-9"
                />
              </div>
              {form.formState.errors.minInvestment && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.minInvestment.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxInvestment">Maximum Investment (Optional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="maxInvestment"
                  {...form.register('maxInvestment')}
                  placeholder="50000"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
