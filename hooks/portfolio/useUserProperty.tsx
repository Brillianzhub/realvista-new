import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Property {
    id: number;
    title: string;
    group_owner_name: string | null;
    [key: string]: any;
}

interface UseUserPropertiesResult {
    properties: Property[];
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    refetch: () => Promise<void>;
}

const useUserProperties = (): UseUserPropertiesResult => {
    const [loading, setLoading] = useState<boolean>(false);
    const [properties, setProperties] = useState<Property[]>([]);

    const fetchUserProperties = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                console.error('Token is required for this operation');
                return;
            }

            const response = await axios.get<Property[]>(
                'https://www.realvistamanagement.com/portfolio/properties/',
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            setProperties(response.data);
        } catch (error: any) {
            console.error(
                'Error fetching user properties:',
                error.response?.data || error.message
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // Run once on mount
    useEffect(() => {
        fetchUserProperties();
    }, [fetchUserProperties]);

    // Alias for clarity in consuming components
    const refetch = fetchUserProperties;

    return { properties, loading, setLoading, refetch };
};

export default useUserProperties;
