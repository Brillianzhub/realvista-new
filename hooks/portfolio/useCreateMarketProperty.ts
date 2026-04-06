// hooks/useCreateMarketProperty.ts
import { useState } from 'react';
import axios from 'axios';
import {
  CreateMarketPropertyPayload,
  CreateMarketPropertyResponse,
} from '@/types/market/marketFeatures';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useCreateMarketProperty() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMarketProperty = async (
    propertyId: number,
    payload: CreateMarketPropertyPayload,
  ): Promise<CreateMarketPropertyResponse | null> => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        throw new Error('Authentication token missing');
      }

      setLoading(true);
      setError(null);

      const response = await axios.post<CreateMarketPropertyResponse>(
        `https://www.realvistamanagement.com/market/from-portfolio/${propertyId}/`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            // 🔐 falls du auth nutzt
            Authorization: `Token ${token}`,
          },
        },
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
