// hooks/analytics/useAnalytics.ts
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────

export type AnalyticsPeriod = '1Y' | '3Y' | '5Y';

export interface KPIs {
  total_return_pct: string;
  total_return_pct_vs_last: string;
  net_income: string;
  net_income_vs_last: string;
  avg_cap_rate: string;
  market_avg_cap_rate: string;
  vacancy_loss: string;
  vacancy_loss_vs_last: string;
}

export interface MonthlyIncomePoint {
  month: string;
  rental: string;
  other_income: string;
}

export interface PortfolioMixItem {
  property_type: string;
  percentage: string;
  total_value: string;
  count: number;
}

export interface PropertyPerformanceItem {
  id: number;
  title: string;
  current_value: string;
  initial_cost: string;
  return_pct: string;
  property_type: string;
  status: string;
}

export interface AnalyticsData {
  period: AnalyticsPeriod;
  currency: string;
  kpis: KPIs;
  monthly_income_chart: MonthlyIncomePoint[];
  portfolio_mix: PortfolioMixItem[];
  total_portfolio_value: string;
  property_performance: PropertyPerformanceItem[];
}

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  period: AnalyticsPeriod;
  setPeriod: (p: AnalyticsPeriod) => void;
  refetch: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAnalytics(
  initialPeriod: AnalyticsPeriod = '1Y',
): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialPeriod);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<AnalyticsData>(
        'portfolio/analytics/',
        { params: { period } },
      );
      setData(response.data);
    } catch (err: any) {
      setError(err.readableMessage ?? 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  // Re-fetch whenever period changes
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, error, period, setPeriod, refetch: fetchAnalytics };
}
