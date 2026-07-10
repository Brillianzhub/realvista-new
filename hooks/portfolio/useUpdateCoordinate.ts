// hooks/portfolio/useUpdateCoordinate.ts
import { useState } from 'react';
import api from '@/lib/apiClient';

export type UpdateCoordinatePayload = {
  latitude?: number;
  longitude?: number;
  utm_x?: number;
  utm_y?: number;
  utm_zone?: number;
};

export function useUpdateCoordinate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateCoordinate = async (
    coordinateId: number,
    payload: UpdateCoordinatePayload
  ) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.patch(
        `/api/portfolio/${coordinateId}/coordinates/`,
        payload
      );

      setSuccess(true);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateCoordinate,
    loading,
    error,
    success,
  };
}
