import api from '@/lib/apiClient';
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
            // NOTE: /api/market/my/ only returns the AUTHENTICATED user's own
            // listings — it ignores `email` entirely. This is a real behavior
            // change from the legacy "look up any vendor's listings by email"
            // endpoint, which has no new equivalent. If this hook is used to
            // view a different vendor's storefront (not just "my own"
            // listings), it will silently return the wrong data.
            const response = await api.get('/api/market/my/');
            setProperties(response.data);
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

