import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export default function useFetchVendorProperties(email: string | null) {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProperties = async () => {
        if (!email) {
            setProperties([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(
                `https://www.realvistamanagement.com/market/fetch-properties-by-email/?email=${email}`,
                {
                    headers: { Authorization: `Token ${token}` },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch properties');
            }

            const data = await response.json();
            setProperties(data);
        } catch (err: any) {
            console.error('Error fetching vendor properties:', err);
            setError(err.message || 'Failed to fetch properties');
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [email]);

    const refetch = async () => {
        await fetchProperties();
    };

    return {
        properties,
        loading,
        error,
        refetch,
    };
}

