// hooks/landing/useHeroCard.ts
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────
// value comes back as a decimal string from DRF e.g. "40650000.00"
export interface ChartPoint {
  month: string;
  value: string;
}

export interface HeroCardData {
  total_current_value: string;
  total_initial_cost: string;
  total_appreciation: string;
  appreciation_percentage: string;
  monthly_income: string;
  total_properties: number;
  occupied_count: number;
  occupancy_rate: string;
  chart_data: ChartPoint[];
  currency: string;
}

interface UseHeroCardReturn {
  data: HeroCardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useHeroCard(): UseHeroCardReturn {
  const [data, setData] = useState<HeroCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeroCard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<HeroCardData>(
        'portfolio/hero-card/',
      );
      setData(response.data);
    } catch (err: any) {
      setError(err.readableMessage ?? 'Failed to load portfolio data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroCard();
  }, [fetchHeroCard]);

  return { data, loading, error, refetch: fetchHeroCard };
}
