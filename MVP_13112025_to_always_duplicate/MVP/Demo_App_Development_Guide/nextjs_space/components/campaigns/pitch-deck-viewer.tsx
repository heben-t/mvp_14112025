'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PitchDeckViewerProps {
  url: string;
  title?: string;
}

export function PitchDeckViewer({ url, title = 'Pitch Deck' }: PitchDeckViewerProps) {
  if (!url) {
    return null;
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${title.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
          <iframe
            src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full"
            title={title}
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleDownload} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button asChild variant="outline">
            <Link href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Click download to save the pitch deck or open in a new tab for full view
        </p>
      </CardContent>
    </Card>
  );
}
