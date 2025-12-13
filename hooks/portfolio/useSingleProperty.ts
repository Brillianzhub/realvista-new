import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      // ✅ MUST await (this was your bug)
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        throw new Error('Authentication token missing');
      }

      const response = await fetch(
        `https://www.realvistamanagement.com/portfolio/properties/${propertyId}/`,
        {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`, // ✅ now correct
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to fetch property');
      }

      const data = await response.json();
      setProperty(data);
    } catch (err: any) {
      console.error('Single Property Fetch Error:', err);
      setError(err.message || 'Failed to load property');
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
