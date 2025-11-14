'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Rocket, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CampaignPublishButtonProps {
  campaignId: string;
  currentStatus: string;
}

export function CampaignPublishButton({
  campaignId,
  currentStatus,
}: CampaignPublishButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isPublished = currentStatus === 'published';

  const handleAction = async (action: 'publish' | 'unpublish') => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Action failed');
      }

      toast.success(
        action === 'publish'
          ? 'Campaign published successfully!'
          : 'Campaign unpublished'
      );

      router.refresh();
    } catch (error) {
      console.error('Action error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Action failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isPublished) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <EyeOff className="h-4 w-4 mr-2" />
            )}
            Unpublish
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the campaign from public view. You can publish it again later.
              Current investments will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAction('unpublish')}>
              Unpublish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Rocket className="h-4 w-4 mr-2" />
          )}
          Publish Campaign
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Publish Campaign?</AlertDialogTitle>
          <AlertDialogDescription>
            Publishing will make your campaign visible to all investors. Make sure all details are correct before publishing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleAction('publish')}>
            Publish Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
