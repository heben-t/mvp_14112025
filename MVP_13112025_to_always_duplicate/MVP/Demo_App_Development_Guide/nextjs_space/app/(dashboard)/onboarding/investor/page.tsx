'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { STORAGE_BUCKETS } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const INVESTMENT_FOCUSES = [
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'Education',
  'Real Estate',
  'Manufacturing',
  'Any Industry',
];

const TICKET_SIZES = [
  '$1K - $10K',
  '$10K - $50K',
  '$50K - $100K',
  '$100K - $500K',
  '$500K+',
];

export default function InvestorOnboardingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    professionalTitle: '',
    investmentFocus: '',
    ticketSize: '',
    accreditationDocument: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/onboarding/investor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Onboarding failed');
      }

      toast.success('Profile created successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Investor Profile</CardTitle>
          <CardDescription>
            Tell us about your investment preferences to discover relevant opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="professionalTitle">Professional Title</Label>
              <Input
                id="professionalTitle"
                value={formData.professionalTitle}
                onChange={(e) => setFormData({ ...formData, professionalTitle: e.target.value })}
                placeholder="e.g., Angel Investor, VC Partner"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="investmentFocus">Investment Focus</Label>
              <Select
                value={formData.investmentFocus}
                onValueChange={(value) => setFormData({ ...formData, investmentFocus: value })}
              >
                <SelectTrigger id="investmentFocus">
                  <SelectValue placeholder="Select your focus area" />
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_FOCUSES.map((focus) => (
                    <SelectItem key={focus} value={focus}>
                      {focus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticketSize">Typical Investment Size</Label>
              <Select
                value={formData.ticketSize}
                onValueChange={(value) => setFormData({ ...formData, ticketSize: value })}
              >
                <SelectTrigger id="ticketSize">
                  <SelectValue placeholder="Select your ticket size" />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Accreditation (Optional)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload accreditation documents to access exclusive investment opportunities
              </p>

              <FileUpload
                label="Accreditation Document"
                accept="application/pdf,image/*"
                maxSize={20 * 1024 * 1024}
                description="Upload proof of accredited investor status (PDF or image, max 20MB)"
                onUpload={async (file) => {
                  const url = await handleUpload(file, STORAGE_BUCKETS.DOCUMENTS);
                  setFormData({ ...formData, accreditationDocument: url });
                  return url;
                }}
                currentUrl={formData.accreditationDocument}
                onRemove={() => setFormData({ ...formData, accreditationDocument: '' })}
              />

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-sm mb-2">What counts as accreditation?</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Income over $200K individually or $300K jointly for the past 2 years</li>
                  <li>• Net worth over $1M (excluding primary residence)</li>
                  <li>• Professional certifications (Series 7, 65, or 82 licenses)</li>
                  <li>• Entity with assets exceeding $5M</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                disabled={isSubmitting}
              >
                Skip for Now
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
