'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  label?: string;
  description?: string;
  preview?: boolean;
  value?: File | string | null;
}

export function FileUploader({
  onFileSelect,
  accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
  maxSize = 5 * 1024 * 1024,
  label,
  description,
  preview = true,
  value,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    typeof value === 'string' ? value : null
  );
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError(`File is too large. Max size is ${maxSize / 1024 / 1024}MB`);
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('Invalid file type');
        } else {
          setError('File upload failed');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        onFileSelect(selectedFile);

        if (preview && selectedFile.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
          };
          reader.readAsDataURL(selectedFile);
        }
      }
    },
    [maxSize, onFileSelect, preview]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    onFileSelect(null);
  };

  const isImage = accept['image/*'] !== undefined;

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      {!file && !previewUrl ? (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            error && 'border-destructive'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {isImage ? (
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground" />
            )}
            <div className="text-sm">
              {isDragActive ? (
                <p className="text-primary">Drop the file here</p>
              ) : (
                <>
                  <p className="font-medium">
                    Drag & drop or <span className="text-primary">browse</span>
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Max size: {maxSize / 1024 / 1024}MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-start gap-4">
            {preview && previewUrl && isImage ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="h-20 w-20 object-cover rounded"
              />
            ) : (
              <FileIcon className="h-10 w-10 text-muted-foreground" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {file?.name || 'Uploaded file'}
              </p>
              {file && (
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
