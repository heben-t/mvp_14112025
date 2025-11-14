'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

interface CSVUploadProps {
  campaignId: string;
  onUploadComplete?: () => void;
}

interface MetricRow {
  date: string;
  revenue?: number;
  users?: number;
  mrr?: number;
  arr?: number;
  burnRate?: number;
  cashBalance?: number;
  [key: string]: string | number | undefined;
}

export function CSVUpload({ campaignId, onUploadComplete }: CSVUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<MetricRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const template = `date,revenue,users,mrr,arr,burnRate,cashBalance
2024-01-01,50000,1000,10000,120000,25000,500000
2024-02-01,65000,1500,12000,144000,23000,477000
2024-03-01,80000,2200,15000,180000,22000,455000`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metrics-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Template downloaded',
      description: 'Fill in your metrics and upload the file',
    });
  };

  const validateRow = (row: MetricRow): string[] => {
    const errors: string[] = [];

    if (!row.date) {
      errors.push('Date is required');
    } else {
      const date = new Date(row.date);
      if (isNaN(date.getTime())) {
        errors.push(`Invalid date format: ${row.date}`);
      }
    }

    const numericFields = ['revenue', 'users', 'mrr', 'arr', 'burnRate', 'cashBalance'];
    numericFields.forEach(field => {
      if (row[field] !== undefined && row[field] !== '') {
        const value = Number(row[field]);
        if (isNaN(value) || value < 0) {
          errors.push(`${field} must be a positive number`);
        }
      }
    });

    return errors;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    Papa.parse<MetricRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validationErrors: string[] = [];
        const validRows: MetricRow[] = [];

        results.data.forEach((row, index) => {
          const rowErrors = validateRow(row);
          if (rowErrors.length > 0) {
            validationErrors.push(`Row ${index + 2}: ${rowErrors.join(', ')}`);
          } else {
            validRows.push(row);
          }
        });

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setPreview([]);
        } else {
          setErrors([]);
          setPreview(validRows);
          toast({
            title: 'File validated',
            description: `${validRows.length} rows ready to upload`,
          });
        }
      },
      error: (error) => {
        toast({
          title: 'Parse error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const handleUpload = async () => {
    if (preview.length === 0) {
      toast({
        title: 'No data to upload',
        description: 'Please select a valid CSV file first',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const response = await fetch('/api/metrics/csv-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          metrics: preview,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      toast({
        title: 'Upload successful',
        description: `${preview.length} metrics imported`,
      });

      setPreview([]);
      setErrors([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadComplete?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload metrics',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          CSV Metrics Upload
        </CardTitle>
        <CardDescription>
          Upload historical metrics data from a CSV file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Select CSV File
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  Validation Errors
                </h4>
                <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                  {errors.slice(0, 5).map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                  {errors.length > 5 && (
                    <li>• ... and {errors.length - 5} more errors</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {preview.length > 0 && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  Ready to Upload
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {preview.length} rows validated successfully
                </p>
              </div>
            </div>
            <div className="max-h-48 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-green-100 dark:bg-green-900">
                  <tr>
                    <th className="px-2 py-1 text-left">Date</th>
                    <th className="px-2 py-1 text-right">Revenue</th>
                    <th className="px-2 py-1 text-right">Users</th>
                    <th className="px-2 py-1 text-right">MRR</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t border-green-200 dark:border-green-800">
                      <td className="px-2 py-1">{row.date}</td>
                      <td className="px-2 py-1 text-right">{row.revenue?.toLocaleString() || '-'}</td>
                      <td className="px-2 py-1 text-right">{row.users?.toLocaleString() || '-'}</td>
                      <td className="px-2 py-1 text-right">{row.mrr?.toLocaleString() || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 5 && (
                <p className="text-xs text-green-700 dark:text-green-300 mt-2 text-center">
                  ... and {preview.length - 5} more rows
                </p>
              )}
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={uploading || preview.length === 0}
          className="w-full"
        >
          {uploading ? 'Uploading...' : `Upload ${preview.length} Metrics`}
        </Button>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">CSV Format Requirements:</p>
              <ul className="space-y-1">
                <li>• First row must contain column headers</li>
                <li>• Date column is required (format: YYYY-MM-DD)</li>
                <li>• Numeric columns: revenue, users, mrr, arr, burnRate, cashBalance</li>
                <li>• All numeric values must be positive numbers</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
