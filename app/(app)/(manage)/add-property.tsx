import React, { useState, useEffect } from 'react';
import {
    View,
    Alert,
    StyleSheet,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import PropertyForm from '@/components/forms/PropertyForm';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';

// Define property shape returned from backend
interface Property {
    id: number;
    title?: string;
    address?: string;
    [key: string]: any;
}

// Define the expected form values
interface PropertyFormValues {
    title: string;
    address: string;
    [key: string]: any;
}

const AddPropertyScreen: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
    const router = useRouter();
    const { colors } = useTheme();

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () =>
            setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () =>
            setKeyboardVisible(false)
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleFormSubmit = async (values: PropertyFormValues): Promise<Property | void> => {
        const token = await AsyncStorage.getItem('authToken');

        if (!token) {
            Alert.alert('Error', 'Authentication token required!');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post<Property>(
                `https://www.realvistamanagement.com/portfolio/properties/add/`,
                values,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            Alert.alert(
                'Success',
                'Property added successfully! Would you like to add coordinates?',
                [
                    {
                        text: 'Yes',
                        onPress: () =>
                            router.push({
                                pathname: '/(app)/(manage)/add-coordinates',
                                params: { property: response.data.id },
                            }),
                    },
                    {
                        text: 'No',
                        onPress: () => {
                            Alert.alert('Add Images', 'Would you like to add images?', [
                                {
                                    text: 'Yes',
                                    onPress: () =>
                                        router.push({
                                            pathname: '/(app)/(manage)/add-files',
                                            params: { property: response.data.id },
                                        }),
                                },
                                {
                                    text: 'No',
                                    onPress: () =>
                                        router.push({
                                            pathname: '/(app)/(manage)/index',
                                        }),
                                },
                            ]);
                        },
                    },
                ]
            );

            return response.data;
        } catch (error: any) {
            console.error('Error adding property:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to add property. Please try again.');
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {isSubmitting ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#358B8B" />
                    <Text style={styles.loadingText}>Wait while we add your data...</Text>
                </View>
            ) : (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
                >
                    <ScrollView
                        contentContainerStyle={[
                            styles.scrollContainer,
                            { paddingBottom: keyboardVisible ? 100 : 20 },
                        ]}
                        keyboardShouldPersistTaps="handled"
                    >
                        <PropertyForm onSubmit={handleFormSubmit} />
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 10,
    },
});

export default AddPropertyScreen;
