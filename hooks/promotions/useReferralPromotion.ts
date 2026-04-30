import { useEffect, useState } from 'react';
import {
  ActiveReferralPromotionResponse,
  ReferralPromotion,
} from '@/types/promotions/promotion';

const API_URL =
  'https://www.realvistamanagement.com/promotions/active-referral-promotion/';

export function useReferralPromotion() {
  const [promotion, setPromotion] = useState<ReferralPromotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotion = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);
      const data: ActiveReferralPromotionResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch promotion');
      }

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
