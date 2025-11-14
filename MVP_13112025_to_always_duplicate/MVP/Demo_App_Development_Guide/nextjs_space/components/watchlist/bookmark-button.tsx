'use client';

import { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface BookmarkButtonProps {
  campaignId: string;
  isBookmarked?: boolean;
  onToggle?: (bookmarked: boolean) => void;
}

export function BookmarkButton({ 
  campaignId, 
  isBookmarked: initialBookmarked = false,
  onToggle 
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isBookmarked) {
        const response = await fetch(`/api/watchlist?campaignId=${campaignId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove from watchlist');
        }

        setIsBookmarked(false);
        onToggle?.(false);
        toast({
          title: 'Removed from watchlist',
          description: 'Campaign removed from your watchlist',
        });
      } else {
        const response = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add to watchlist');
        }

        setIsBookmarked(true);
        onToggle?.(true);
        toast({
          title: 'Added to watchlist',
          description: 'Campaign added to your watchlist',
        });
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update watchlist',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isLoading}
      className="h-9 w-9"
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-5 w-5 fill-primary text-primary" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
      <span className="sr-only">
        {isBookmarked ? 'Remove from watchlist' : 'Add to watchlist'}
      </span>
    </Button>
  );
}
