import React from 'react';
import { View, Text } from 'react-native';

export interface MarketProperty {
    id: string;
    name: string;
    images: string[];
    value: number;
    roi: number;
    description: string;
    state: string;
    city: string;
    country: string;
    units: number;
    type: string;
    amenities: string[];
    yearBought: number;
    latitude: number;
    longitude: number;
    owner: {
        name: string;
        avatar: string;
        joined: string;
        verified: boolean;
        email: string;
    };
    performanceData: {
        labels: string[];
        datasets: Array<{ data: number[] }>;
    };
}

// 👇 default export required by Expo Router
export default function MarketPropertyPage() {
    return (
        <View>
            <Text>Market Property Page</Text>
        </View>
    );
}
