import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/apiClient';

interface UseSinglePropertyResult<T> {
  property: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSingleProperty<T = any>(
  propertyId: number | string | null
): UseSinglePropertyResult<T> {
  const [property, setProperty] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = useCallback(async () => {
    if (!propertyId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/portfolio/${propertyId}/`);
      setProperty(response.data);
    } catch (err: any) {
      console.error('Single Property Fetch Error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load property');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  return {
    property,
    loading,
    error,
    refetch: fetchProperty,
  };
}
