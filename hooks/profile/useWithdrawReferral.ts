import { useState } from 'react';
import { AxiosError } from 'axios';
import api from '@/lib/apiClient';

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
      const response = await api.post<WithdrawResponse>(
        '/api/referrals/me/payout/',
        payload
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
