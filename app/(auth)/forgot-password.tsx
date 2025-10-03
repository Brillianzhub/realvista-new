import React, { useState } from 'react';
import {
    TextInput,
    Pressable,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
    View,
    Image,
} from 'react-native';
import images from '../../constants/images';
import { router } from 'expo-router';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleResetRequest = async (): Promise<void> => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(
                'https://www.realvistamanagement.com/accounts/request-password-reset/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                }
            );

            if (!response.ok) {
                const errorData: { error?: string } = await response.json();
                throw new Error(errorData.error || 'Failed to send reset email');
            }

            router.replace({
                pathname: '/verify-otp',
                params: { email },
            });
        } catch (error: any) {
            console.error('Forgot Password Error:', error);
            Alert.alert('Error', error.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.safeArea}>
            <View style={styles.logoContainer}>
                <Image source={images.logo} style={styles.logo} />
            </View>

            <TextInput
                style={styles.input}
                placeholder="Enter your registered email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <Pressable
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={handleResetRequest}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Send</Text>
                )}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    button: {
        height: 50,
        backgroundColor: '#FB902E',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        fontFamily: 'Abel-Regular',
        color: '#fff',
        fontSize: 18,
        fontWeight: '400',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 214,
        height: 48,
        resizeMode: 'contain',
    },
});

export default ForgotPassword;
