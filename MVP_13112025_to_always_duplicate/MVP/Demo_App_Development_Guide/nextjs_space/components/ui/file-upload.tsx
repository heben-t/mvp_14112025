'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, FileIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number;
  onUpload: (file: File) => Promise<string>;
  currentUrl?: string;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
  preview?: 'image' | 'file';
  description?: string;
}

export function FileUpload({
  label,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024,
  onUpload,
  currentUrl,
  onRemove,
  disabled,
  className,
  preview = 'file',
  description,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | undefined>(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setIsUploading(true);
    try {
      const url = await onUpload(file);
      setUploadedUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    setUploadedUrl(undefined);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onRemove?.();
  };

  const url = uploadedUrl || currentUrl;

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {url && !isUploading ? (
        <div className="relative">
          {preview === 'image' && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border">
              <Image
                src={url}
                alt="Uploaded file"
                fill
                className="object-cover"
              />
            </div>
          )}
          {preview === 'file' && (
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
              <FileIcon className="h-8 w-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">File uploaded</p>
                <p className="text-xs text-muted-foreground truncate">{url}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
            className="mt-2"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            dragActive && 'border-primary bg-primary/5',
            disabled && 'opacity-50 cursor-not-allowed',
            !disabled && 'cursor-pointer hover:border-primary hover:bg-accent/50'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <Input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={disabled || isUploading}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  Drop file here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max size: {Math.round(maxSize / 1024 / 1024)}MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
