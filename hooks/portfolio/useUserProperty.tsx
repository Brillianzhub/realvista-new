import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Define the shape of a property (update fields as needed)
interface Property {
    id: number;
    title: string;
    group_owner_name: string | null;
    [key: string]: any;
}


const useUserProperties = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [properties, setProperties] = useState<Property[]>([]);

    const fetchUserProperties = async (): Promise<void> => {
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
    };

    useEffect(() => {
        fetchUserProperties();
    }, []);

    return { properties, setLoading, loading, fetchUserProperties };
};

export default useUserProperties;
