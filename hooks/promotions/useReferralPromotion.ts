import { useEffect, useState } from 'react';
import api from '@/lib/apiClient';
import {
  ActiveReferralPromotionResponse,
  ReferralPromotion,
} from '@/types/promotions/promotion';

export function useReferralPromotion() {
  const [promotion, setPromotion] = useState<ReferralPromotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotion = async () => {
    try {
      setLoading(true);

      const response = await api.get<ActiveReferralPromotionResponse>(
        '/api/promotions/active-referral-promotion/'
      );
      const data = response.data;

      if (data.active && data.promotion) {
        setPromotion(data.promotion);
      } else {
        setPromotion(null);
      }
    } catch (err: any) {
      console.error('Promotion fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotion();
  }, []);

  return {
    promotion,
    loading,
    error,
    refetch: fetchPromotion,
  };
}
