import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VendorProperty {
    id: string;
    name: string;
    description: string;
    value: number;
    // Add more fields depending on your backend model
}

interface UseFetchVendorPropertiesResult {
    properties: VendorProperty[];
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useFetchVendorProperties = (email: string | null): UseFetchVendorPropertiesResult => {
    const [properties, setProperties] = useState<VendorProperty[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProperties = useCallback(async () => {
        if (!email) return;

        setLoading(true);
        setError(null);

        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await axios.get<VendorProperty[]>(
                `https://www.realvistamanagement.com/market/fetch-properties-by-email/?email=${email}`,
                {
                    headers: { Authorization: `Token ${token}` },
                }
            );

            setProperties(response.data);
        } catch (err: unknown) {
            const axiosError = err as AxiosError<any>;
            if (axiosError.response?.data) {
                setError(JSON.stringify(axiosError.response.data));
            } else {
                setError(axiosError.message || 'An error occurred');
            }
        } finally {
            setLoading(false);
        }
    }, [email]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    return { properties, loading, setLoading, error, refetch: fetchProperties };
};

export default useFetchVendorProperties;
