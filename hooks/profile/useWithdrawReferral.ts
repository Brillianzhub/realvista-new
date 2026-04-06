import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PaymentMethod = 'bank';

interface WithdrawRequest {
  amount: number;
  payment_method: PaymentMethod;
  account_details: string;
}

interface WithdrawResponse {
  id: number;
  amount: string;
  payment_method: PaymentMethod;
  account_details: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  created_at: string;
  processed_at?: string | null;
  admin_notes?: string | null;
}

interface WithdrawError {
  error?: string;
  [key: string]: any;
}

export default function useWithdrawReferral() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<WithdrawError | null>(null);
  const [data, setData] = useState<WithdrawResponse | null>(null);

  const withdrawReferralEarnings = async (
    payload: WithdrawRequest
  ): Promise<WithdrawResponse> => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');

      const response = await axios.post<WithdrawResponse>(
        'https://www.realvistamanagement.com/accounts/referrals/payout/',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
        }
      );

      setData(response.data);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError<WithdrawError>;
      const errorData = axiosError.response?.data || {
        error: axiosError.message,
      };

      setError(errorData);
      throw errorData;
    } finally {
      setLoading(false);
    }
  };

  return {
    withdrawReferralEarnings,
    loading,
    error,
    data,
  };
}
