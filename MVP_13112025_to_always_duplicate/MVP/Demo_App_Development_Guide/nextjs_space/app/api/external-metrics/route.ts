import { NextResponse } from 'next/server';
import { metricsCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

const METRICS_API_URL = process.env.METRICS_API_URL || 'https://hebedai.onrender.com';
const METRICS_API_KEY = process.env.METRICS_API_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const fetchAll = searchParams.get('all') === 'true';
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

    const cacheKey = `external-metrics-${period || 'all'}-${fetchSummary}`;
    
    const cached = metricsCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-API-Key': METRICS_API_KEY,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('External API error:', response.status, errorData);
      return NextResponse.json(
        {
          error: 'Failed to fetch from external metrics API',
          status: response.status,
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    metricsCache.set(cacheKey, data);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching external metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch external metrics data' },
      { status: 500 }
    );
  }
}


/**
 * POST /api/external-metrics
 * Creates new metrics data in the external HEBED AI Metrics API
 *
 * Body:
 * {
 *   "period": "YYYY-MM",
 *   "metrics": { ... }
 * }
 */
export async function POST(request: Request) {
  try {
    if (!METRICS_API_KEY) {
      return NextResponse.json(
        { error: 'Metrics API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${METRICS_API_URL}/api/v1/metrics`, {
      method: 'POST',
      headers: {
        'X-API-Key': METRICS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('External API error:', response.status, errorData);
      return NextResponse.json(
        {
          error: 'Failed to create metrics in external API',
          status: response.status,
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error creating external metrics:', error);
    return NextResponse.json(
      { error: 'Failed to create external metrics data' },
      { status: 500 }
    );
  }
}
