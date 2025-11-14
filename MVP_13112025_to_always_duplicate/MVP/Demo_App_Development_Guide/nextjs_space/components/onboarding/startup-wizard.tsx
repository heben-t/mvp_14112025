'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploader } from './file-uploader';
import { ProgressTracker } from './progress-tracker';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const steps = [
  { id: 1, title: 'Company Profile', description: 'Basic information' },
  { id: 2, title: 'Business Metrics', description: 'Financial data' },
  { id: 3, title: 'Fundraising', description: 'Campaign setup' },
  { id: 4, title: 'Documents', description: 'Upload files' },
];

const step1Schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  stage: z.string().min(1, 'Stage is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const step2Schema = z.object({
  mrr: z.string().min(1, 'MRR is required'),
  arr: z.string().min(1, 'ARR is required'),
  burnRate: z.string().min(1, 'Burn rate is required'),
  runway: z.string().min(1, 'Runway is required'),
  churnRate: z.string().min(1, 'Churn rate is required'),
});

const step3Schema = z.object({
  fundraisingGoal: z.string().min(1, 'Fundraising goal is required'),
  equityOffered: z.string().min(1, 'Equity offered is required'),
  valuation: z.string().min(1, 'Valuation is required'),
  minInvestment: z.string().min(1, 'Minimum investment is required'),
  maxInvestment: z.string().min(1, 'Maximum investment is required'),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

export function StartupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [logo, setLogo] = useState<File | null>(null);
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);
  const [founderIdDocument, setFounderIdDocument] = useState<File | null>(null);
  const [pitchDeck, setPitchDeck] = useState<File | null>(null);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: formData.step1 || {},
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: formData.step2 || {},
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: formData.step3 || {},
  });

  const handleNext = async () => {
    let isValid = false;

    if (currentStep === 0) {
      isValid = await step1Form.trigger();
      if (isValid) {
        setFormData({ ...formData, step1: step1Form.getValues() });
      }
    } else if (currentStep === 1) {
      isValid = await step2Form.trigger();
      if (isValid) {
        setFormData({ ...formData, step2: step2Form.getValues() });
      }
    } else if (currentStep === 2) {
      isValid = await step3Form.trigger();
      if (isValid) {
        setFormData({ ...formData, step3: step3Form.getValues() });
      }
    } else if (currentStep === 3) {
      isValid = true;
    }

    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        await handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData.step1 || {}).forEach(([key, value]) => {
        formDataToSend.append(key, value as string);
      });
      Object.entries(formData.step2 || {}).forEach(([key, value]) => {
        formDataToSend.append(key, value as string);
      });
      Object.entries(formData.step3 || {}).forEach(([key, value]) => {
        formDataToSend.append(key, value as string);
      });

      if (logo) formDataToSend.append('logo', logo);
      if (businessLicense) formDataToSend.append('businessLicense', businessLicense);
      if (founderIdDocument) formDataToSend.append('founderIdDocument', founderIdDocument);
      if (pitchDeck) formDataToSend.append('pitchDeck', pitchDeck);

      const response = await fetch('/api/onboarding/startup', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to submit onboarding');
      }

      toast.success('Onboarding completed successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <ProgressTracker steps={steps} currentStep={currentStep} />

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  {...step1Form.register('companyName')}
                  placeholder="Enter your company name"
                />
                {step1Form.formState.errors.companyName && (
                  <p className="text-sm text-destructive">
                    {step1Form.formState.errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  onValueChange={(value) => step1Form.setValue('industry', value)}
                  defaultValue={step1Form.getValues('industry')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AI/ML">AI/ML</SelectItem>
                    <SelectItem value="SaaS">SaaS</SelectItem>
                    <SelectItem value="FinTech">FinTech</SelectItem>
                    <SelectItem value="HealthTech">HealthTech</SelectItem>
                    <SelectItem value="EdTech">EdTech</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {step1Form.formState.errors.industry && (
                  <p className="text-sm text-destructive">
                    {step1Form.formState.errors.industry.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Stage *</Label>
                <Select
                  onValueChange={(value) => step1Form.setValue('stage', value)}
                  defaultValue={step1Form.getValues('stage')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                    <SelectItem value="Seed">Seed</SelectItem>
                    <SelectItem value="Series A">Series A</SelectItem>
                    <SelectItem value="Series B">Series B</SelectItem>
                  </SelectContent>
                </Select>
                {step1Form.formState.errors.stage && (
                  <p className="text-sm text-destructive">
                    {step1Form.formState.errors.stage.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description *</Label>
                <Textarea
                  id="description"
                  {...step1Form.register('description')}
                  placeholder="Describe your company and what you do"
                  rows={4}
                />
                {step1Form.formState.errors.description && (
                  <p className="text-sm text-destructive">
                    {step1Form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  {...step1Form.register('website')}
                  placeholder="https://yourcompany.com"
                  type="url"
                />
                {step1Form.formState.errors.website && (
                  <p className="text-sm text-destructive">
                    {step1Form.formState.errors.website.message}
                  </p>
                )}
              </div>

              <FileUploader
                label="Company Logo"
                description="Upload your company logo (PNG, JPG, max 5MB)"
                onFileSelect={setLogo}
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                preview
              />
            </form>
          )}

          {currentStep === 1 && (
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mrr">Monthly Recurring Revenue (MRR) *</Label>
                  <Input
                    id="mrr"
                    {...step2Form.register('mrr')}
                    placeholder="$10,000"
                    type="text"
                  />
                  {step2Form.formState.errors.mrr && (
                    <p className="text-sm text-destructive">
                      {step2Form.formState.errors.mrr.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arr">Annual Recurring Revenue (ARR) *</Label>
                  <Input
                    id="arr"
                    {...step2Form.register('arr')}
                    placeholder="$120,000"
                    type="text"
                  />
                  {step2Form.formState.errors.arr && (
                    <p className="text-sm text-destructive">
                      {step2Form.formState.errors.arr.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="burnRate">Monthly Burn Rate *</Label>
                  <Input
                    id="burnRate"
                    {...step2Form.register('burnRate')}
                    placeholder="$15,000"
                    type="text"
                  />
                  {step2Form.formState.errors.burnRate && (
                    <p className="text-sm text-destructive">
                      {step2Form.formState.errors.burnRate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="runway">Runway (months) *</Label>
                  <Input
                    id="runway"
                    {...step2Form.register('runway')}
                    placeholder="12"
                    type="text"
                  />
                  {step2Form.formState.errors.runway && (
                    <p className="text-sm text-destructive">
                      {step2Form.formState.errors.runway.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="churnRate">Churn Rate (%) *</Label>
                  <Input
                    id="churnRate"
                    {...step2Form.register('churnRate')}
                    placeholder="5"
                    type="text"
                  />
                  {step2Form.formState.errors.churnRate && (
                    <p className="text-sm text-destructive">
                      {step2Form.formState.errors.churnRate.message}
                    </p>
                  )}
                </div>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fundraisingGoal">Fundraising Goal *</Label>
                  <Input
                    id="fundraisingGoal"
                    {...step3Form.register('fundraisingGoal')}
                    placeholder="$500,000"
                    type="text"
                  />
                  {step3Form.formState.errors.fundraisingGoal && (
                    <p className="text-sm text-destructive">
                      {step3Form.formState.errors.fundraisingGoal.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equityOffered">Equity Offered (%) *</Label>
                  <Input
                    id="equityOffered"
                    {...step3Form.register('equityOffered')}
                    placeholder="10"
                    type="text"
                  />
                  {step3Form.formState.errors.equityOffered && (
                    <p className="text-sm text-destructive">
                      {step3Form.formState.errors.equityOffered.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valuation">Company Valuation *</Label>
                  <Input
                    id="valuation"
                    {...step3Form.register('valuation')}
                    placeholder="$5,000,000"
                    type="text"
                  />
                  {step3Form.formState.errors.valuation && (
                    <p className="text-sm text-destructive">
                      {step3Form.formState.errors.valuation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minInvestment">Minimum Investment *</Label>
                  <Input
                    id="minInvestment"
                    {...step3Form.register('minInvestment')}
                    placeholder="$1,000"
                    type="text"
                  />
                  {step3Form.formState.errors.minInvestment && (
                    <p className="text-sm text-destructive">
                      {step3Form.formState.errors.minInvestment.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxInvestment">Maximum Investment *</Label>
                  <Input
                    id="maxInvestment"
                    {...step3Form.register('maxInvestment')}
                    placeholder="$50,000"
                    type="text"
                  />
                  {step3Form.formState.errors.maxInvestment && (
                    <p className="text-sm text-destructive">
                      {step3Form.formState.errors.maxInvestment.message}
                    </p>
                  )}
                </div>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <FileUploader
                label="Business License"
                description="Upload your business license (PDF, max 10MB)"
                onFileSelect={setBusinessLicense}
                accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] }}
                maxSize={10 * 1024 * 1024}
                preview={false}
              />

              <FileUploader
                label="Founder ID Document"
                description="Upload government-issued ID (PDF or image, max 10MB)"
                onFileSelect={setFounderIdDocument}
                accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] }}
                maxSize={10 * 1024 * 1024}
                preview={false}
              />

              <FileUploader
                label="Pitch Deck"
                description="Upload your pitch deck (PDF, max 10MB)"
                onFileSelect={setPitchDeck}
                accept={{ 'application/pdf': ['.pdf'] }}
                maxSize={10 * 1024 * 1024}
                preview={false}
              />
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : currentStep === steps.length - 1 ? (
                'Complete Onboarding'
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
