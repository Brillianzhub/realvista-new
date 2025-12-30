// hooks/portfolio/useUpdateCoordinate.ts
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        throw new Error('Authentication token missing');
      }

      const response = await fetch(
        `https://www.realvistamanagement.com/portfolio/property/${coordinateId}/update-coordinate/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to update coordinate');
      }

      setSuccess(true);
      return data;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
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
