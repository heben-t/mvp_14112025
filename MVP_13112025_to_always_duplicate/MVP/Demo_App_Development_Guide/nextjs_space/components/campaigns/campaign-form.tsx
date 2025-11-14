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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { STORAGE_BUCKETS } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Sparkles, Video, FileText, Target, Building2, Eye, ArrowUpRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const campaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  campaignObjective: z.string().min(20, 'Campaign objective must be at least 20 characters').max(500, 'Maximum 500 characters'),
  companyDescription: z.string().min(50, 'Company description must be at least 50 characters').max(2000, 'Maximum 2000 characters'),
  vslUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  pitchDeck: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  user?: any;
}

export function CampaignForm({ user }: CampaignFormProps = {}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdCampaignId, setCreatedCampaignId] = useState<string>('');
  const [pitchDeckUrl, setPitchDeckUrl] = useState<string>('');

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: '',
      campaignObjective: '',
      companyDescription: '',
      vslUrl: '',
      pitchDeck: '',
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

  const handleSubmit = async (data: CampaignFormData, publish: boolean = false) => {
    console.log('handleSubmit called with:', { data, publish });
    setIsSubmitting(true);

    try {
      const payload = {
        title: data.title,
        campaignObjective: data.campaignObjective,
        description: data.companyDescription,
        vslUrl: data.vslUrl || '',
        pitchDeck: pitchDeckUrl,
        status: publish ? 'published' : 'draft',
      };

      console.log('Payload to send:', payload);

      const response = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('API error response:', error);
        throw new Error(error.error || 'Failed to create campaign');
      }

      const result = await response.json();
      console.log('Campaign created:', result);

      setCreatedCampaignId(result.campaign.id);

      if (publish) {
        // Show success dialog for published campaigns
        toast.success('Campaign published successfully!');
        setShowSuccessDialog(true);
      } else {
        // Redirect directly for drafts
        toast.success('Campaign saved as draft!');
        router.push(`/dashboard/startup/campaigns/${result.campaign.id}`);
      }
    } catch (error: any) {
      console.error('Campaign creation error:', error);
      toast.error(error.message || 'Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowPublishDialog(false);
    }
  };

  const onSaveDraft = async () => {
    console.log('Save as Draft clicked');
    const isValid = await form.trigger();
    console.log('Form validation result:', isValid);
    if (isValid) {
      setIsDraft(true);
      console.log('Submitting as draft...', form.getValues());
      await handleSubmit(form.getValues(), false);
    } else {
      console.log('Form validation errors:', form.formState.errors);
      toast.error('Please fill in all required fields');
    }
  };

  const onPublish = () => {
    console.log('=== PUBLISH BUTTON CLICKED ===');
    console.log('Current form values:', form.getValues());
    console.log('Form errors:', form.formState.errors);
    
    // Validate form
    form.trigger().then((isValid) => {
      console.log('Form validation result:', isValid);
      
      if (isValid) {
        console.log('Form is valid - opening publish dialog');
        setShowPublishDialog(true);
      } else {
        console.log('Form validation failed:', form.formState.errors);
        toast.error('Please fill in all required fields');
        
        // Show which fields are missing
        Object.keys(form.formState.errors).forEach(key => {
          console.log(`Error in ${key}:`, form.formState.errors[key as keyof typeof form.formState.errors]);
        });
      }
    }).catch(error => {
      console.error('Validation error:', error);
      toast.error('Error validating form');
    });
  };

  const confirmPublish = () => {
    console.log('=== CONFIRM PUBLISH CLICKED ===');
    handleSubmit(form.getValues(), true);
  };

  return (
    <>
      <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); console.log('Form submit prevented'); }}>
        {/* Campaign Overview Card */}
        <Card className="border-2 border-blue-100 shadow-xl bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Campaign Overview</CardTitle>
                <CardDescription className="mt-1">
                  Create a compelling campaign to attract investors
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                Campaign Title *
              </Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="e.g., AI-Powered Customer Service Platform"
                className="h-12 border-2 focus:border-blue-400"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  {form.formState.errors.title.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                A clear, engaging title that captures your startup's value proposition
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaignObjective" className="text-base font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                Campaign Objective *
              </Label>
              <Textarea
                id="campaignObjective"
                {...form.register('campaignObjective')}
                placeholder="What is the primary goal of this fundraising campaign? (e.g., Product development, market expansion, team growth)"
                className="min-h-[100px] border-2 focus:border-purple-400 resize-none"
                maxLength={500}
              />
              {form.formState.errors.campaignObjective && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.campaignObjective.message}
                </p>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Clearly state why you're raising funds and what you'll achieve</span>
                <span>{form.watch('campaignObjective')?.length || 0}/500</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyDescription" className="text-base font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-600" />
                Company Description *
              </Label>
              <Textarea
                id="companyDescription"
                {...form.register('companyDescription')}
                placeholder="Describe your company, product, market opportunity, traction, and competitive advantage..."
                className="min-h-[200px] border-2 focus:border-emerald-400 resize-none"
                maxLength={2000}
              />
              {form.formState.errors.companyDescription && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.companyDescription.message}
                </p>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tell investors about your startup's story, vision, and what makes you unique</span>
                <span>{form.watch('companyDescription')?.length || 0}/2000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media & Assets Card */}
        <Card className="border-2 border-purple-100 shadow-xl bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Media & Assets</CardTitle>
                <CardDescription className="mt-1">
                  Showcase your startup with compelling visuals
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="vslUrl" className="text-base font-semibold flex items-center gap-2">
                <Video className="h-4 w-4 text-purple-600" />
                VSL Video URL
              </Label>
              <Input
                id="vslUrl"
                {...form.register('vslUrl')}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                type="url"
                className="h-12 border-2 focus:border-purple-400"
              />
              {form.formState.errors.vslUrl && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.vslUrl.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Add a video sales letter (YouTube, Vimeo, or direct link) to engage investors
              </p>
            </div>

            <div className="bg-white rounded-xl border-2 border-dashed border-purple-200 p-6">
              <FileUpload
                label={
                  <span className="flex items-center gap-2 text-base font-semibold">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Pitch Deck
                  </span>
                }
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
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-muted-foreground">
            * Required fields
          </p>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              disabled={isSubmitting}
              className="h-12 px-8 border-2"
              size="lg"
            >
              {isSubmitting && isDraft ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save as Draft'
              )}
            </Button>
            <Button 
              type="button" 
              onClick={onPublish} 
              disabled={isSubmitting}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {isSubmitting && !isDraft ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Publish Campaign
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <AlertDialogTitle className="text-center text-2xl">Publish Campaign?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Once published, your campaign will be visible to all investors on the
              platform. Make sure all information is accurate and complete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:space-x-4">
            <AlertDialogCancel className="h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmPublish}
              className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Publish Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <AlertDialogTitle className="text-center text-3xl">Campaign Published!</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              Congratulations! Your campaign is now live and visible to all investors on the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 my-4">
            <Button
              onClick={() => router.push(`/dashboard/startup/campaigns/${createdCampaignId}`)}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <Eye className="mr-2 h-5 w-5" />
              View in Dashboard
            </Button>
            <Button
              onClick={() => router.push('/discover')}
              className="w-full h-12"
              variant="outline"
              size="lg"
            >
              <Target className="mr-2 h-5 w-5" />
              See in Campaigns Hub
            </Button>
            <Button
              onClick={() => router.push(`/campaigns/${createdCampaignId}`)}
              className="w-full h-12"
              variant="outline"
              size="lg"
            >
              <ArrowUpRight className="mr-2 h-5 w-5" />
              View Public Page
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
