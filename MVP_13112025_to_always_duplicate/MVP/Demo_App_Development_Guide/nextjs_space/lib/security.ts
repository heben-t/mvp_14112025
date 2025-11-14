import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export function validateRequestBody<T>(
  schema: z.ZodSchema<T>
) {
  return async (
    request: NextRequest,
    handler: (data: T) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const validated = schema.parse(body);
      return handler(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  };
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateFileType(
  filename: string,
  allowedTypes: string[]
): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? allowedTypes.includes(ext) : false;
}

export function validateFileSize(size: number, maxSizeMB: number): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return size <= maxBytes;
}

export const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
export const ALLOWED_DOCUMENT_TYPES = ['pdf', 'doc', 'docx'];
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_DOCUMENT_SIZE_MB = 10;

export function preventSqlInjection(input: string): string {
  return input.replace(/['";\\]/g, '');
}

export function preventXss(input: string): string {
  return sanitizeHtml(input);
}

export function validatePagination(page: number, limit: number): {
  valid: boolean;
  page: number;
  limit: number;
} {
  const validPage = Math.max(1, Math.min(page, 1000));
  const validLimit = Math.max(1, Math.min(limit, 100));
  
  return {
    valid: validPage === page && validLimit === limit,
    page: validPage,
    limit: validLimit,
  };
}
