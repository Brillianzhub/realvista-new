// hooks/useCreateMarketProperty.ts
import { useState } from 'react';
import api from '@/lib/apiClient';
import {
  CreateMarketPropertyPayload,
  CreateMarketPropertyResponse,
} from '@/types/market/marketFeatures';

export function useCreateMarketProperty() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMarketProperty = async (
    propertyId: number,
    payload: CreateMarketPropertyPayload,
  ): Promise<CreateMarketPropertyResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      // TODO: no /api/ equivalent for promote-to-market yet
      const response = await api.post<CreateMarketPropertyResponse>(
        `/market/from-portfolio/${propertyId}/`,
        payload,
      );

      return response.data;
    } catch (err: any) {
      console.error('Create Market Property Error:', err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          'Something went wrong',
      );

      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createMarketProperty,
    loading,
    error,
  };
}
