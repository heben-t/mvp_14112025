import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const METRICS_API_URL = process.env.METRICS_API_URL || 'https://hebedai.onrender.com';
const METRICS_API_KEY = process.env.METRICS_API_KEY;

/**
 * GET /api/test-integration
 * Tests the connection to the external HEBED AI Metrics API
 * and returns diagnostic information
 */
export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    configuration: {
      apiUrl: METRICS_API_URL,
      apiKeyConfigured: !!METRICS_API_KEY,
      apiKeyPrefix: METRICS_API_KEY ? METRICS_API_KEY.substring(0, 10) + '...' : 'NOT SET',
    },
    tests: [],
  };

  try {
    // Test 1: Health Check
    try {
      const healthResponse = await fetch(`${METRICS_API_URL}/health`, {
        method: 'GET',
      });
      diagnostics.tests.push({
        name: 'Health Check',
        endpoint: `${METRICS_API_URL}/health`,
        status: healthResponse.status,
        success: healthResponse.ok,
        response: await healthResponse.json().catch(async () => ({ text: await healthResponse.text() })),
      });

    } catch (error) {
      diagnostics.tests.push({
        name: 'Health Check',
        endpoint: `${METRICS_API_URL}/health`,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 2: Get All Metrics (requires API key)
    if (METRICS_API_KEY) {
      try {
        const metricsResponse = await fetch(`${METRICS_API_URL}/api/v1/metrics`, {
          method: 'GET',
          headers: {
            'X-API-Key': METRICS_API_KEY,
            'Content-Type': 'application/json',
          },
        });

        const metricsData = await metricsResponse.json().catch(async () => ({ text: await metricsResponse.text() }));

        diagnostics.tests.push({
          name: 'Get All Metrics',
          endpoint: `${METRICS_API_URL}/api/v1/metrics`,
          status: metricsResponse.status,
          success: metricsResponse.ok,
          response: metricsData,
          dataCount: Array.isArray(metricsData?.data) ? metricsData.data.length : 0,
        });
      } catch (error) {
        diagnostics.tests.push({
          name: 'Get All Metrics',
          endpoint: `${METRICS_API_URL}/api/v1/metrics`,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Test 3: Get Analytics Summary
      try {
        const summaryResponse = await fetch(`${METRICS_API_URL}/api/v1/metrics/analytics/summary`, {
          method: 'GET',
          headers: {
            'X-API-Key': METRICS_API_KEY,
            'Content-Type': 'application/json',
          },
        });

        const summaryData = await summaryResponse.json().catch(async () => ({ text: await summaryResponse.text() }));

        diagnostics.tests.push({
          name: 'Get Analytics Summary',
          endpoint: `${METRICS_API_URL}/api/v1/metrics/analytics/summary`,
          status: summaryResponse.status,
          success: summaryResponse.ok,
          response: summaryData,
        });

      } catch (error) {
        diagnostics.tests.push({
          name: 'Get Analytics Summary',
          endpoint: `${METRICS_API_URL}/api/v1/metrics/analytics/summary`,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

    } else {
      diagnostics.tests.push({
        name: 'API Key Check',
        success: false,
        error: 'API Key not configured - cannot test authenticated endpoints',
      });
    }

    // Summary
    const successfulTests = diagnostics.tests.filter((t: any) => t.success).length;
    const totalTests = diagnostics.tests.length;

    diagnostics.summary = {
      totalTests,
      successfulTests,
      failedTests: totalTests - successfulTests,
      overallStatus: successfulTests === totalTests ? 'PASS' : 'PARTIAL',
      ready: successfulTests > 0,
    };

    return NextResponse.json(diagnostics);

  } catch (error) {
    return NextResponse.json(
      {
        ...diagnostics,
        error: 'Test suite failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
