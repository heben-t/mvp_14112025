'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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

interface InvestmentActionsProps {
  investmentId: string;
}

export function InvestmentActions({ investmentId }: InvestmentActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: 'accept' | 'reject') => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/investments/${investmentId}/${action}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to process investment');
      }

      toast.success(
        action === 'accept' 
          ? 'Investment accepted successfully!' 
          : 'Investment rejected'
      );

      router.refresh();
    } catch (error) {
      console.error('Error processing investment:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to process investment'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="default" 
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Accept
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Investment?</AlertDialogTitle>
            <AlertDialogDescription>
              By accepting this investment, you agree to:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Move forward with this investor</li>
                <li>Complete legal documentation</li>
                <li>Transfer equity as agreed</li>
                <li>Release funds from escrow once documentation is signed</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAction('accept')}>
              Accept Investment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Investment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this investment? This action will:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Decline the investor's offer</li>
                <li>Return funds from escrow to the investor</li>
                <li>Notify the investor of your decision</li>
              </ul>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleAction('reject')}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject Investment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
