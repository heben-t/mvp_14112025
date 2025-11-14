'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ReactPlayer = dynamic(() => import('react-player/lazy'), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface VSLPlayerProps {
  url: string;
  className?: string;
  autoplay?: boolean;
  controls?: boolean;
}

export function VSLPlayer({ 
  url, 
  className,
  autoplay = false,
  controls = true,
}: VSLPlayerProps) {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [hasError, setHasError] = useState(false);

  if (!url) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-0">
          <div className="aspect-video bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No video available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-0">
          <div className="aspect-video bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Unable to load video</p>
              <p className="text-xs mt-1">Please check the video URL</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-0">
        <div className="aspect-video bg-black relative">
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          <ReactPlayer
            url={url}
            width="100%"
            height="100%"
            playing={isPlaying}
            controls={controls}
            onReady={() => setIsReady(true)}
            onError={() => setHasError(true)}
            config={{
              youtube: {
                playerVars: { 
                  showinfo: 1,
                  modestbranding: 1,
                },
              },
              vimeo: {
                playerOptions: {
                  byline: false,
                  portrait: false,
                },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
