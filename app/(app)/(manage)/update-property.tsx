// Define types
import {
    StyleSheet,
    Text,
    View,
    Alert,
    TouchableWithoutFeedback,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import React, { useState } from 'react';
import useUserProperty from '@/hooks/portfolio/useUserProperty';
import PropertyUpdateForm from '@/components/forms/PropertyUpdateForm';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

// Define types - Match the actual data structure from useUserProperty
interface Property {
    id: number; // Changed from string to number
    title: string;
    group_owner_name: string | null;
    address?: string;
    location?: string;
    city?: string;
    zip_code?: string;
    description?: string;
    status?: string;
    property_type?: string;
    year_bought?: number;
    area?: number;
    num_units?: number;
    initial_cost?: number;
    current_value?: number;
    currency?: string;
    virtual_tour_url?: string;
    slot_price?: number | null;
    slot_price_current?: number | null;
    total_slots?: number | null;
    user_slots?: number;
}

interface UpdatePropertyFormData {
    property_id: string;
    title: string;
    address: string;
    location: string;
    city: string;
    zip_code: string;
    description: string;
    status: string;
    property_type: string;
    year_bought: number;
    area: number;
    num_units: number;
    initial_cost: number;
    current_value: number;
    currency: string;
    virtual_tour_url: string;
    slot_price: number | null;
    slot_price_current: number | null;
    total_slots: number | null;
    user_slots: number;
}

const UpdateProperty: React.FC = () => {
    const { properties } = useUserProperty();
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const router = useRouter();

    const handleUpdate = async (values: UpdatePropertyFormData): Promise<any> => {
        const token = await AsyncStorage.getItem('authToken');

        if (!token) {
            Alert.alert('Error', 'Authentication token required!');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(
                `https://www.realvistamanagement.com/portfolio/properties/add/`,
                values,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            Alert.alert('Success', 'Property updated successfully!');
            router.back();
            return response.data;
        } catch (error: any) {
            console.error('Error adding property:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to add property. Please try again.');
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProperties: Property[] = properties.filter(
        (property: Property) => property.group_owner_name === null
    );

    const selectedProperty: Property | undefined = filteredProperties.find(
        (property: Property) => property.id === selectedPropertyId
    );

    const pickerSelectStyles = {
        inputIOS: {
            height: 50,
            paddingHorizontal: 10,
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
            color: '#000',
        },
        inputAndroid: {
            height: 50,
            paddingHorizontal: 10,
            color: '#000',
        },
        placeholder: {
            color: '#888',
        },
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                >
                    {isSubmitting ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#358B8B" />
                            <Text style={styles.loadingText}>Wait while we update your data...</Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    value={selectedPropertyId}
                                    onValueChange={(itemValue: string | null) => {
                                        const numericValue = itemValue ? Number(itemValue) : null;
                                        setSelectedPropertyId(numericValue);
                                    }}
                                    style={pickerSelectStyles}
                                    placeholder={{
                                        label: 'Select a property to update',
                                        value: null,
                                        color: '#888',
                                    }}
                                    items={filteredProperties.map((property: Property) => ({
                                        label: property.title,
                                        value: property.id.toString(), // Convert to string
                                        color: '#000',
                                    }))}
                                    useNativeAndroidPickerStyle={false}
                                />
                            </View>
                            {selectedProperty ? (
                                <PropertyUpdateForm
                                    property={selectedProperty}
                                    onSubmit={handleUpdate}
                                />
                            ) : (
                                <Text style={styles.infoText}>
                                    Select the property for which you'd like to update using the dropdown menu.
                                </Text>
                            )}
                        </>
                    )}
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default UpdateProperty;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 10,
        color: '#555',
    },
    pickerContainer: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    infoText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        marginTop: 16,
    },
});
