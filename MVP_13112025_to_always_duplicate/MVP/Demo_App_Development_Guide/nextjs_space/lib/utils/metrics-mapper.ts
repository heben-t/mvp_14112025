/**
 * Metrics Mapper Utility
 * Maps external HEBED AI Metrics API data to the dashboard's data structure
 */

export interface ExternalMetrics {
  period: string;
  metrics: {
    financial: {
      mrr?: number;
      arr?: number;
      revenue_growth_rate?: number;
      burn_rate?: number;
      runway_months?: number;
      cash_balance?: number;
      cac?: number;
      ltv?: number;
      ltv_cac_ratio?: number;
      gross_margin_pct?: number;
      cogs?: number;
      total_customers?: number;
      active_subscriptions?: number;
      churn_rate?: number;
    };
    metadata?: {
      new_customers_30d?: number;
      churned_customers_30d?: number;
      marketing_spend_30d?: number;
      total_expenses_30d?: number;
      avg_customer_value?: number;
      customer_lifetime_months?: number;
      previous_mrr?: number;
    };
    data_quality?: {
      has_stripe_data?: boolean;
      has_expense_data?: boolean;
      has_bank_data?: boolean;
      has_crm_data?: boolean;
      calculation_confidence?: 'low' | 'medium' | 'high';
    };
  };
  created_at?: string;
  updated_at?: string;
}

export interface DashboardMetrics {
  // Core ROI Metrics
  roi_percentage: number;
  cost_savings: number;
  hours_saved: number;
  employees_freed: number;
  adoption_rate: number;

  // Financial Metrics (from external API)
  mrr: number | null;
  arr: number | null;
  revenue_growth_rate: number | null;
  burn_rate: number | null;
  runway_months: number | null;
  cash_balance: number | null;

  // Customer Metrics
  total_customers: number | null;
  active_subscriptions: number | null;
  churn_rate: number | null;
  new_customers_30d: number | null;
  churned_customers_30d: number | null;

  // Unit Economics
  cac: number | null;
  ltv: number | null;
  ltv_cac_ratio: number | null;
  avg_customer_value: number | null;

  // Operational Metrics
  gross_margin_pct: number | null;
  marketing_spend_30d: number | null;
  total_expenses_30d: number | null;

  // Data Quality
  data_quality_confidence: string | null;

  // Metadata
  period: string;
  source: 'external' | 'internal' | 'hybrid';
}

/**
 * JPATH Mapping Configuration
 * Maps external API paths to dashboard property names
 */
export const JPATH_MAPPINGS = {
  // Financial Metrics
  'metrics.financial.mrr': 'mrr',
  'metrics.financial.arr': 'arr',
  'metrics.financial.revenue_growth_rate': 'revenue_growth_rate',
  'metrics.financial.burn_rate': 'burn_rate',
  'metrics.financial.runway_months': 'runway_months',
  'metrics.financial.cash_balance': 'cash_balance',
  'metrics.financial.cac': 'cac',
  'metrics.financial.ltv': 'ltv',
  'metrics.financial.ltv_cac_ratio': 'ltv_cac_ratio',
  'metrics.financial.gross_margin_pct': 'gross_margin_pct',
  'metrics.financial.cogs': 'N/A', // Not mapped to dashboard
  'metrics.financial.total_customers': 'total_customers',
  'metrics.financial.active_subscriptions': 'active_subscriptions',
  'metrics.financial.churn_rate': 'churn_rate',

  // Metadata
  'metrics.metadata.new_customers_30d': 'new_customers_30d',
  'metrics.metadata.churned_customers_30d': 'churned_customers_30d',
  'metrics.metadata.marketing_spend_30d': 'marketing_spend_30d',
  'metrics.metadata.total_expenses_30d': 'total_expenses_30d',
  'metrics.metadata.avg_customer_value': 'avg_customer_value',
  'metrics.metadata.customer_lifetime_months': 'N/A', // Not directly mapped
  'metrics.metadata.previous_mrr': 'N/A', // Used for calculations only

  // Data Quality
  'metrics.data_quality.calculation_confidence': 'data_quality_confidence',
  'metrics.data_quality.has_stripe_data': 'N/A',
  'metrics.data_quality.has_expense_data': 'N/A',
  'metrics.data_quality.has_bank_data': 'N/A',
  'metrics.data_quality.has_crm_data': 'N/A',

  // Core fields
  'period': 'period',
};

/**
 * Calculate derived ROI metrics from financial data
 */
function calculateROIMetrics(external: ExternalMetrics): Partial<DashboardMetrics> {
  const financial = external.metrics.financial;
  const metadata = external.metrics.metadata;

  // Calculate ROI percentage based on LTV/CAC ratio
  let roi_percentage = 0;
  if (financial.ltv_cac_ratio) {
    // Convert LTV/CAC ratio to ROI percentage
    // A 3:1 ratio means 200% ROI, 4:1 means 300% ROI, etc.
    roi_percentage = (financial.ltv_cac_ratio - 1) * 100;
  }

  // Calculate cost savings from gross margin
  let cost_savings = 0;
  if (financial.mrr && financial.gross_margin_pct) {
    cost_savings = (financial.mrr * (financial.gross_margin_pct / 100)) * 12; // Annual savings
  }

  // Estimate hours saved (placeholder calculation)
  // Based on customer count and automation assumptions
  let hours_saved = 0;
  if (financial.total_customers) {
    hours_saved = financial.total_customers * 10; // Assume 10 hours saved per customer
  }

  // Estimate employees freed (placeholder calculation)
  // Based on hours saved / 160 hours per month
  let employees_freed = 0;
  if (hours_saved > 0) {
    employees_freed = Math.floor(hours_saved / 160);
  }

  // Calculate adoption rate from churn rate
  let adoption_rate = 0;
  if (financial.churn_rate !== undefined) {
    adoption_rate = 100 - financial.churn_rate; // Inverse of churn
  } else if (financial.active_subscriptions && financial.total_customers) {
    adoption_rate = (financial.active_subscriptions / financial.total_customers) * 100;
  }

  return {
    roi_percentage,
    cost_savings,
    hours_saved,
    employees_freed,
    adoption_rate,
  };
}

/**
 * Transform external metrics to dashboard format
 */
export function mapExternalToDashboard(external: ExternalMetrics): DashboardMetrics {
  const financial = external.metrics.financial;
  const metadata = external.metrics.metadata || {};
  const data_quality = external.metrics.data_quality || {};

  // Calculate derived metrics
  const derivedMetrics = calculateROIMetrics(external);

  return {
    // Derived ROI Metrics
    roi_percentage: derivedMetrics.roi_percentage || 0,
    cost_savings: derivedMetrics.cost_savings || 0,
    hours_saved: derivedMetrics.hours_saved || 0,
    employees_freed: derivedMetrics.employees_freed || 0,
    adoption_rate: derivedMetrics.adoption_rate || 0,

    // Financial Metrics
    mrr: financial.mrr || null,
    arr: financial.arr || null,
    revenue_growth_rate: financial.revenue_growth_rate || null,
    burn_rate: financial.burn_rate || null,
    runway_months: financial.runway_months || null,
    cash_balance: financial.cash_balance || null,

    // Customer Metrics
    total_customers: financial.total_customers || null,
    active_subscriptions: financial.active_subscriptions || null,
    churn_rate: financial.churn_rate || null,
    new_customers_30d: metadata.new_customers_30d || null,
    churned_customers_30d: metadata.churned_customers_30d || null,

    // Unit Economics
    cac: financial.cac || null,
    ltv: financial.ltv || null,
    ltv_cac_ratio: financial.ltv_cac_ratio || null,
    avg_customer_value: metadata.avg_customer_value || null,

    // Operational Metrics
    gross_margin_pct: financial.gross_margin_pct || null,
    marketing_spend_30d: metadata.marketing_spend_30d || null,
    total_expenses_30d: metadata.total_expenses_30d || null,

    // Data Quality
    data_quality_confidence: data_quality.calculation_confidence || null,

    // Metadata
    period: external.period,
    source: 'external',
  };
}

/**
 * Merge external metrics with internal dashboard metrics
 */
export function mergeMetrics(
  internal: Partial<DashboardMetrics>,
  external: ExternalMetrics
): DashboardMetrics {
  const externalMapped = mapExternalToDashboard(external);

  return {
    ...externalMapped,
    ...internal, // Internal metrics override external
    source: 'hybrid',
  };
}

/**
 * Get value from nested object using JPATH
 */
export function getValueByJPATH(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Generate JPATH mapping report
 */
export function generateJPATHReport(external: ExternalMetrics): Record<string, any> {
  const report: Record<string, any> = {};

  Object.entries(JPATH_MAPPINGS).forEach(([jpath, dashboardField]) => {
    const value = getValueByJPATH(external, jpath);
    report[jpath] = {
      dashboardField,
      value: value !== undefined ? value : 'N/A',
      mapped: dashboardField !== 'N/A',
    };
  });

  return report;
}
