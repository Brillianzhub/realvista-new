import { useState } from 'react';
import { Alert } from 'react-native';
import api from '@/lib/apiClient';

interface UseUpdateListingReturn {
    updateListing: (slug: string, values: any) => Promise<any>;
    isUpdating: boolean;
}

export default function useUpdateListing(): UseUpdateListingReturn {
    const [isUpdating, setIsUpdating] = useState(false);

    const updateListing = async (slug: string, values: any): Promise<any> => {
        setIsUpdating(true);

        try {
            const { id, ...payload } = values;

            console.log(`payload: ${JSON.stringify(payload, null, 2)}`)

            const response = await api.patch(
                `/api/market/${slug}/`,
                payload
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
