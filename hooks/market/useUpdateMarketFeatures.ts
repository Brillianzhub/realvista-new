import { useState } from 'react';
import api from '@/lib/apiClient';
import { Alert } from 'react-native';

export interface MarketFeatureData {
    negotiable: 'yes' | 'slightly' | 'no';
    furnished?: boolean;
    pet_friendly?: boolean;
    parking_available?: boolean;
    swimming_pool?: boolean;
    garden?: boolean;
    electricity_proximity?: 'close' | 'moderate' | 'far';
    road_network?: 'excellent' | 'good' | 'poor';
    development_level?: 'high' | 'moderate' | 'low';
    water_supply?: boolean;
    security?: boolean;
    additional_features?: string;
}

export const useUpdateMarketFeatures = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateMarketFeatures = async (
        slug: string,
        featuresData: MarketFeatureData
    ) => {
        if (!slug) {
            Alert.alert('Error', 'Property slug is required.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.patch(
                `/api/market/${slug}/features/`,
                featuresData
            );

            Alert.alert('Success', 'Features updated successfully!');
            return response.data;
        } catch (error: any) {
            console.error('❌ Error updating features:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to update features. Please try again.');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateMarketFeatures, isLoading };
};
