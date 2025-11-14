'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Table } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';

interface Props {
  onUploadComplete?: (data: any[]) => void;
  campaignId?: string;
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

export function EnhancedCSVUpload({ onUploadComplete, campaignId }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<MetricRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [showMapping, setShowMapping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = `date,revenue,users,mrr,arr,burnRate,cashBalance
2024-01-01,50000,1000,10000,120000,25000,500000
2024-02-01,65000,1500,12000,144000,23000,477000
2024-03-01,80000,2200,15000,180000,22000,455000
2024-04-01,95000,3000,18000,216000,21000,434000
2024-05-01,112000,3800,22000,264000,20000,414000
2024-06-01,135000,4800,27000,324000,19000,395000`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hebed-metrics-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Template downloaded successfully');
  };

  const validateRow = (row: MetricRow, index: number): string[] => {
    const errors: string[] = [];
    const rowPrefix = `Row ${index + 2}`;

    // Validate date
    if (!row.date) {
      errors.push(`${rowPrefix}: Date is required`);
    } else {
      const date = new Date(row.date);
      if (isNaN(date.getTime())) {
        errors.push(`${rowPrefix}: Invalid date format "${row.date}". Use YYYY-MM-DD`);
      }
    }

    // Validate numeric fields
    const numericFields = ['revenue', 'users', 'mrr', 'arr', 'burnRate', 'cashBalance'];
    numericFields.forEach((field) => {
      if (row[field] !== undefined && row[field] !== '') {
        const value = Number(row[field]);
        if (isNaN(value)) {
          errors.push(`${rowPrefix}: ${field} must be a number`);
        } else if (value < 0) {
          errors.push(`${rowPrefix}: ${field} cannot be negative`);
        }
      }
    });

    return errors;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    Papa.parse<MetricRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validationErrors: string[] = [];
        const validRows: MetricRow[] = [];

        // Check if file has data
        if (results.data.length === 0) {
          setErrors(['File is empty or has invalid format']);
          setPreview([]);
          return;
        }

        // Validate each row
        results.data.forEach((row, index) => {
          const rowErrors = validateRow(row, index);
          if (rowErrors.length > 0) {
            validationErrors.push(...rowErrors);
          } else {
            validRows.push(row);
          }
        });

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setPreview([]);
          toast.error(`Found ${validationErrors.length} validation errors`);
        } else {
          setErrors([]);
          setPreview(validRows);
          toast.success(`${validRows.length} rows validated successfully`);
        }
      },
      error: (error) => {
        setErrors([`Parse error: ${error.message}`]);
        toast.error('Failed to parse CSV file');
      },
    });
  };

  const handleUpload = async () => {
    if (preview.length === 0) {
      toast.error('No data to upload');
      return;
    }

    setUploading(true);
    try {
      // Process the data
      const processedData = preview.map((row) => ({
        date: row.date,
        revenue: Number(row.revenue) || 0,
        users: Number(row.users) || 0,
        mrr: Number(row.mrr) || 0,
        arr: Number(row.arr) || 0,
        burn_rate: Number(row.burnRate) || 0,
        cash_balance: Number(row.cashBalance) || 0,
      }));

      // Call the upload API
      const response = await fetch('/api/metrics/csv-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          metrics: processedData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      toast.success(`Successfully imported ${preview.length} metrics`);
      setPreview([]);
      setErrors([]);
      setFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (onUploadComplete) {
        onUploadComplete(processedData);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload metrics');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Enhanced CSV Upload
        </CardTitle>
        <CardDescription>
          Upload your metrics data with validation and preview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            {fileName || 'Select CSV File'}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Errors Display */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  Validation Errors
                </h4>
                <div className="text-sm text-red-800 dark:text-red-200 space-y-1 max-h-40 overflow-y-auto">
                  {errors.slice(0, 10).map((error, i) => (
                    <div key={i}>• {error}</div>
                  ))}
                  {errors.length > 10 && (
                    <div className="font-semibold">
                      ... and {errors.length - 10} more errors
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Display */}
        {preview.length > 0 && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  Ready to Upload
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {preview.length} rows validated successfully
                </p>
              </div>
            </div>

            {/* Data Preview Table */}
            <div className="max-h-64 overflow-auto rounded border border-green-200 dark:border-green-800">
              <table className="w-full text-sm">
                <thead className="bg-green-100 dark:bg-green-900 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Date</th>
                    <th className="px-3 py-2 text-right font-medium">Revenue</th>
                    <th className="px-3 py-2 text-right font-medium">Users</th>
                    <th className="px-3 py-2 text-right font-medium">MRR</th>
                    <th className="px-3 py-2 text-right font-medium">ARR</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((row, i) => (
                    <tr
                      key={i}
                      className="border-t border-green-200 dark:border-green-800 hover:bg-green-100/50 dark:hover:bg-green-900/50"
                    >
                      <td className="px-3 py-2">{row.date}</td>
                      <td className="px-3 py-2 text-right">
                        ${row.revenue?.toLocaleString() || '-'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {row.users?.toLocaleString() || '-'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        ${row.mrr?.toLocaleString() || '-'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        ${row.arr?.toLocaleString() || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 10 && (
                <div className="text-xs text-center py-2 text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900">
                  ... and {preview.length - 10} more rows
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={uploading || preview.length === 0}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            'Uploading...'
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload {preview.length} Metrics
            </>
          )}
        </Button>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">CSV Format Requirements:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>First row must contain column headers</li>
                <li>Date column is required (format: YYYY-MM-DD)</li>
                <li>Numeric columns: revenue, users, mrr, arr, burnRate, cashBalance</li>
                <li>All numeric values must be positive numbers</li>
                <li>Maximum file size: 5MB</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
