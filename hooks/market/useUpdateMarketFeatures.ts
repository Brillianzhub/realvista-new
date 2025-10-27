import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
        propertyId: string | number,
        featuresData: MarketFeatureData
    ) => {
        if (!propertyId) {
            Alert.alert('Error', 'Property ID is required.');
            return;
        }

        setIsLoading(true);

        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Error', 'Authentication token required.');
                return;
            }

            const response = await axios.post(
                `https://realvistamanagement.com/market/property/${propertyId}/features/`,
                featuresData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
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
