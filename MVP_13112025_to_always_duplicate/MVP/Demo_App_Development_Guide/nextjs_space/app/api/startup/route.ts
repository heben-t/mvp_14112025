
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { mapExternalToDashboard, ExternalMetrics } from '@/lib/utils/metrics-mapper';

export const dynamic = 'force-dynamic';

const METRICS_API_URL = process.env.METRICS_API_URL || 'https://hebedai.onrender.com';
const METRICS_API_KEY = process.env.METRICS_API_KEY;

async function fetchExternalMetrics(): Promise<any | null> {
  if (!METRICS_API_KEY) {
    console.warn('Metrics API key not configured, skipping external data fetch');
    return null;
  }

  try {
    const response = await fetch(`${METRICS_API_URL}/api/v1/metrics`, {
      method: 'GET',
      headers: {
        'X-API-Key': METRICS_API_KEY,
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error('External API returned error:', response.status);
      return null;
    }

    const data = await response.json();

    // Handle different response formats
    if (data.success !== false) {
      if (Array.isArray(data.data) && data.data.length > 0) {
        return data.data[0]; // Get most recent
      } else if (data.data) {
        return data.data;
      } else if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching external metrics (non-fatal):', error instanceof Error ? error.message : error);
    return null;
  }
}

export async function GET() {
  try {
    // Fetch internal database metrics
    const metrics = await prisma.startup_metrics.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    });

    const timeSeriesAdoption = await prisma.time_series_data.findMany({
      where: {
        entityType: 'startup',
        metricName: 'adoption',
      },
      orderBy: {
        week: 'asc',
      },
    });

    const timeSeriesROI = await prisma.time_series_data.findMany({
      where: {
        entityType: 'startup',
        metricName: 'roi',
      },
      orderBy: {
        week: 'asc',
      },
    });

    // Fetch external metrics (non-blocking)
    const externalMetrics = await fetchExternalMetrics();

    // Prepare response
    let enhancedMetrics: any = metrics;

    if (externalMetrics) {
      try {
        // Transform external metrics to dashboard format
        const transformedExternal = mapExternalToDashboard(externalMetrics as ExternalMetrics);

        // Merge with internal metrics (internal takes precedence)
        enhancedMetrics = {
          ...metrics,
          // Add external financial metrics
          mrr: transformedExternal.mrr,
          arr: transformedExternal.arr,
          revenue_growth_rate: transformedExternal.revenue_growth_rate,
          burn_rate: transformedExternal.burn_rate,
          runway_months: transformedExternal.runway_months,
          cash_balance: transformedExternal.cash_balance,
          total_customers: transformedExternal.total_customers,
          churn_rate: transformedExternal.churn_rate,
          cac: transformedExternal.cac,
          ltv: transformedExternal.ltv,
          ltv_cac_ratio: transformedExternal.ltv_cac_ratio,
          gross_margin_pct: transformedExternal.gross_margin_pct,
          marketing_spend_30d: transformedExternal.marketing_spend_30d,
          // Override ROI if not set or use external calculation
          currentROI: metrics?.currentROI || transformedExternal.roi_percentage,
          // Add data source indicator
          _externalDataAvailable: true,
          _dataSources: {
            internal: !!metrics,
            external: true,
          },
        };
      } catch (error) {
        console.error('Error transforming external metrics:', error);
      }
    } else {
      // Mark that external data is not available
      enhancedMetrics = {
        ...metrics,
        _externalDataAvailable: false,
      };
    }

    return NextResponse.json({
      metrics: enhancedMetrics,
      timeSeriesAdoption,
      timeSeriesROI,
    });
  } catch (error) {
    console.error('Error fetching startup data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
