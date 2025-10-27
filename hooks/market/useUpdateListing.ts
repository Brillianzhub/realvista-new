import { useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface UseUpdateListingReturn {
    updateListing: (values: any) => Promise<any>;
    isUpdating: boolean;
}

export default function useUpdateListing(): UseUpdateListingReturn {
    const [isUpdating, setIsUpdating] = useState(false);

    const updateListing = async (values: any): Promise<any> => {
        setIsUpdating(true);

        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Error', 'Authentication token required!');
                throw new Error('Missing authentication token');
            }

            // 🧩 Extract backend numeric ID if prefixed with "backend_"
            let backendId = values.id;
            if (typeof backendId === 'string' && backendId.startsWith('backend_')) {
                backendId = Number(backendId.replace('backend_', ''));
            }

            const payload = {
                ...values,
                property_id: backendId, // send the pure backend ID to server
            };

            console.log(`payload: ${JSON.stringify(payload, null, 2)}`)

            const response = await axios.put(
                'https://www.realvistamanagement.com/market/update-property/',
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                Alert.alert('Success', 'Listing updated successfully');
                return response.data;
            } else {
                Alert.alert('Error', 'Failed to update listing');
                throw new Error('Unexpected response status: ' + response.status);
            }
        } catch (error: any) {
            console.error('Error updating listing:', error);
            Alert.alert(
                'Error',
                error.response?.data?.detail || error.message || 'Failed to update listing'
            );
            throw error;
        } finally {
            setIsUpdating(false);
        }
    };

    return { updateListing, isUpdating };
}
