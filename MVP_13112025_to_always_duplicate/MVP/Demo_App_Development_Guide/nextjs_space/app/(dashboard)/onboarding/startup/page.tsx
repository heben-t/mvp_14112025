'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { EnhancedCSVUpload } from '@/components/metrics/enhanced-csv-upload';
import { STORAGE_BUCKETS } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'Education',
  'Real Estate',
  'Manufacturing',
  'Other',
];

const STAGES = [
  'Idea',
  'MVP',
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B+',
];

export default function StartupOnboardingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    stage: '',
    description: '',
    website: '',
    logo: '',
    businessLicense: '',
    founderIdDocument: '',
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

    // Enhanced validation
    const errors: string[] = [];
    
    if (!formData.companyName?.trim()) {
      errors.push('Company name is required');
    }
    
    if (!formData.industry) {
      errors.push('Industry is required');
    }
    
    if (!formData.stage) {
      errors.push('Current stage is required');
    }
    
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      errors.push('Website must be a valid URL starting with http:// or https://');
    }
    
    if (errors.length > 0) {
      toast.error(errors.join(' • '), { duration: 5000 });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/onboarding/startup', {
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
          <CardTitle>Complete Your Startup Profile</CardTitle>
          <CardDescription>
            Tell us about your company to get started with fundraising
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Enter your company name"
                required
              />
            </div>

            <FileUpload
              label="Company Logo"
              accept="image/*"
              maxSize={5 * 1024 * 1024}
              preview="image"
              description="Upload your company logo (PNG, JPG, or SVG, max 5MB)"
              onUpload={async (file) => {
                const url = await handleUpload(file, STORAGE_BUCKETS.LOGOS);
                setFormData({ ...formData, logo: url });
                return url;
              }}
              currentUrl={formData.logo}
              onRemove={() => setFormData({ ...formData, logo: '' })}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">
                  Industry <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                  required
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">
                  Current Stage <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => setFormData({ ...formData, stage: value })}
                  required
                >
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourcompany.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell us about your company..."
                rows={4}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">KYC Documents (Optional)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload these documents to verify your company and access premium features
              </p>

              <div className="space-y-4">
                <FileUpload
                  label="Business License"
                  accept="application/pdf,image/*"
                  maxSize={20 * 1024 * 1024}
                  description="Upload your business registration or license (PDF or image, max 20MB)"
                  onUpload={async (file) => {
                    const url = await handleUpload(file, STORAGE_BUCKETS.DOCUMENTS);
                    setFormData({ ...formData, businessLicense: url });
                    return url;
                  }}
                  currentUrl={formData.businessLicense}
                  onRemove={() => setFormData({ ...formData, businessLicense: '' })}
                />

                <FileUpload
                  label="Founder ID Document"
                  accept="application/pdf,image/*"
                  maxSize={20 * 1024 * 1024}
                  description="Upload a government-issued ID (PDF or image, max 20MB)"
                  onUpload={async (file) => {
                    const url = await handleUpload(file, STORAGE_BUCKETS.DOCUMENTS);
                    setFormData({ ...formData, founderIdDocument: url });
                    return url;
                  }}
                  currentUrl={formData.founderIdDocument}
                  onRemove={() => setFormData({ ...formData, founderIdDocument: '' })}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Initial Metrics (Optional)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your historical metrics via CSV to showcase your traction
              </p>
              <EnhancedCSVUpload onUploadComplete={(data) => {
                console.log('Metrics uploaded:', data);
                toast.success('Metrics uploaded successfully!');
              }} />
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
