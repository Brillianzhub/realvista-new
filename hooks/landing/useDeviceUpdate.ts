import { useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

type DevicePayload = {
  device_id?: string;
  install_id?: string;
};

export default function useDeviceUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateDevice = useCallback(async (payload: DevicePayload) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await apiClient.patch('/users/update-device/', payload);

      setSuccess(true);
    } catch (err: any) {
      setError(err?.readableMessage || 'Failed to update device information');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateDevice,
    loading,
    error,
    success,
  };
}
