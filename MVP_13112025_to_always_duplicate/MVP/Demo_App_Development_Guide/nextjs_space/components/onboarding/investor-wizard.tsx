'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploader } from './file-uploader';
import { ProgressTracker } from './progress-tracker';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const steps = [
  { id: 1, title: 'Professional Profile', description: 'Your information' },
  { id: 2, title: 'Investment Preferences', description: 'Set your criteria' },
  { id: 3, title: 'Accreditation', description: 'Verify your status' },
  { id: 4, title: 'Payment Setup', description: 'Connect Stripe' },
];

const step1Schema = z.object({
  professionalTitle: z.string().min(2, 'Professional title is required'),
  investmentFocus: z.string().min(2, 'Investment focus is required'),
  ticketSize: z.string().min(1, 'Ticket size is required'),
});

const step2Schema = z.object({
  minROIThreshold: z.number().min(0).max(100),
  preferredStages: z.array(z.string()).min(1, 'Select at least one stage'),
  sectorFilters: z.array(z.string()).min(1, 'Select at least one sector'),
  geographicPreferences: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

const STAGES = ['Pre-Seed', 'Seed', 'Series A', 'Series B'];
const SECTORS = ['AI/ML', 'SaaS', 'FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'Other'];

export function InvestorWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [accreditationDocument, setAccreditationDocument] = useState<File | null>(null);
  const [minROI, setMinROI] = useState<number>(10);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: formData.step1 || {},
  });

  const handleNext = async () => {
    let isValid = false;

    if (currentStep === 0) {
      isValid = await step1Form.trigger();
      if (isValid) {
        setFormData({ ...formData, step1: step1Form.getValues() });
      }
    } else if (currentStep === 1) {
      if (selectedStages.length === 0) {
        toast.error('Please select at least one preferred stage');
        return;
      }
      if (selectedSectors.length === 0) {
        toast.error('Please select at least one sector');
        return;
      }
      setFormData({
        ...formData,
        step2: {
          minROIThreshold: minROI,
          preferredStages: selectedStages,
          sectorFilters: selectedSectors,
          geographicPreferences: '',
        },
      });
      isValid = true;
    } else if (currentStep === 2) {
      isValid = true;
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

      if (formData.step2) {
        formDataToSend.append('minROIThreshold', formData.step2.minROIThreshold.toString());
        formDataToSend.append('preferredStages', JSON.stringify(formData.step2.preferredStages));
        formDataToSend.append('sectorFilters', JSON.stringify(formData.step2.sectorFilters));
        formDataToSend.append('geographicPreferences', formData.step2.geographicPreferences || '');
      }

      if (accreditationDocument) {
        formDataToSend.append('accreditationDocument', accreditationDocument);
      }

      const response = await fetch('/api/onboarding/investor', {
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

  const toggleStage = (stage: string) => {
    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    );
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
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
                <Label htmlFor="professionalTitle">Professional Title *</Label>
                <Input
                  id="professionalTitle"
                  {...step1Form.register('professionalTitle')}
                  placeholder="e.g., Angel Investor, VC Partner"
                />
                {step1Form.formState.errors.professionalTitle && (
                  <p className="text-sm text-destructive">
                    {step1Form.formState.errors.professionalTitle.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="investmentFocus">Investment Focus *</Label>
                <Input
                  id="investmentFocus"
                  {...step1Form.register('investmentFocus')}
                  placeholder="e.g., Early-stage AI startups"
                />
                {step1Form.formState.errors.investmentFocus && (
                  <p className="text-sm text-destructive">
                    {step1Form.formState.errors.investmentFocus.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticketSize">Typical Ticket Size *</Label>
                <Input
                  id="ticketSize"
                  {...step1Form.register('ticketSize')}
                  placeholder="e.g., $10,000 - $50,000"
                />
                {step1Form.formState.errors.ticketSize && (
                  <p className="text-sm text-destructive">
                    {step1Form.formState.errors.ticketSize.message}
                  </p>
                )}
              </div>
            </form>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Minimum ROI Threshold: {minROI}%</Label>
                <Slider
                  value={[minROI]}
                  onValueChange={(value) => setMinROI(value[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Only show startups with ROI score above this threshold
                </p>
              </div>

              <div className="space-y-3">
                <Label>Preferred Stages *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {STAGES.map((stage) => (
                    <div key={stage} className="flex items-center space-x-2">
                      <Checkbox
                        id={`stage-${stage}`}
                        checked={selectedStages.includes(stage)}
                        onCheckedChange={() => toggleStage(stage)}
                      />
                      <label
                        htmlFor={`stage-${stage}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {stage}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Sector Filters *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {SECTORS.map((sector) => (
                    <div key={sector} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sector-${sector}`}
                        checked={selectedSectors.includes(sector)}
                        onCheckedChange={() => toggleSector(sector)}
                      />
                      <label
                        htmlFor={`sector-${sector}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {sector}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="geographicPreferences">Geographic Preferences (Optional)</Label>
                <Input
                  id="geographicPreferences"
                  placeholder="e.g., North America, Europe"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      step2: { ...formData.step2, geographicPreferences: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <FileUploader
                label="Accreditation Document"
                description="Upload proof of accredited investor status (PDF or image, max 10MB)"
                onFileSelect={setAccreditationDocument}
                accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] }}
                maxSize={10 * 1024 * 1024}
                preview={false}
              />
              <p className="text-sm text-muted-foreground">
                Your document will be reviewed by our team. You'll be notified once verified.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium mb-2">Stripe Connect Setup</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your Stripe account to receive payouts and manage investments securely.
                </p>
                <Button
                  type="button"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/stripe/connect', {
                        method: 'POST',
                      });
                      const data = await response.json();
                      if (data.url) {
                        window.location.href = data.url;
                      }
                    } catch (error) {
                      toast.error('Failed to connect Stripe account');
                    }
                  }}
                >
                  Connect Stripe Account
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                You can skip this step and set it up later from your dashboard.
              </p>
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
            <Button type="button" onClick={handleNext} disabled={isSubmitting}>
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
