import { NextResponse } from 'next/server';
import {
  mapExternalToDashboard,
  generateJPATHReport,
  ExternalMetrics,
  JPATH_MAPPINGS,
} from '@/lib/utils/metrics-mapper';

export const dynamic = 'force-dynamic';

const METRICS_API_URL = process.env.METRICS_API_URL || 'https://hebedai.onrender.com';
const METRICS_API_KEY = process.env.METRICS_API_KEY;

/**
 * GET /api/external-metrics/transform
 * Fetches external metrics and transforms them to dashboard format
 *
 * Query Parameters:
 * - period: Optional. Fetch metrics for a specific period (YYYY-MM format)
 * - showMapping: Optional. If 'true', includes JPATH mapping report
 * - summary: Optional. If 'true', fetches analytics summary
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const showMapping = searchParams.get('showMapping') === 'true';
    const fetchSummary = searchParams.get('summary') === 'true';

    if (!METRICS_API_KEY) {
      return NextResponse.json(
        { error: 'Metrics API key not configured' },
        { status: 500 }
      );
    }

    let endpoint = `${METRICS_API_URL}/api/v1/metrics`;

    if (fetchSummary) {
      endpoint = `${METRICS_API_URL}/api/v1/metrics/analytics/summary`;
    } else if (period) {
      endpoint = `${METRICS_API_URL}/api/v1/metrics/${period}`;
    }

    // Fetch from external API
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-API-Key': METRICS_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('External API error:', response.status, errorData);
      return NextResponse.json(
        {
          error: 'Failed to fetch from external metrics API',
          status: response.status,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const externalData = await response.json();

    // Handle different response formats
    let metricsToTransform: ExternalMetrics[] = [];

    if (externalData.success !== false) {
      if (Array.isArray(externalData.data)) {
        metricsToTransform = externalData.data;
      } else if (externalData.data) {
        metricsToTransform = [externalData.data];
      } else if (Array.isArray(externalData)) {
        metricsToTransform = externalData;
      } else {
        metricsToTransform = [externalData];
      }
    }

    // Transform each metric
    const transformedMetrics = metricsToTransform.map((metric) =>
      mapExternalToDashboard(metric)
    );

    const result: any = {
      success: true,
      data: transformedMetrics.length === 1 ? transformedMetrics[0] : transformedMetrics,
      count: transformedMetrics.length,
      source: 'external-api',
      transformed: true,
    };

    // Add JPATH mapping report if requested
    if (showMapping && metricsToTransform.length > 0) {
      result.jpathReport = generateJPATHReport(metricsToTransform[0]);
      result.jpathMappings = JPATH_MAPPINGS;
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching and transforming external metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch and transform external metrics data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
