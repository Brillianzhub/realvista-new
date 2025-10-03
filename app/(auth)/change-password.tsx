import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Pressable,
    Alert,
    TextStyle,
    ViewStyle,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const ChangePassword: React.FC = () => {
    const [oldPassword, setOldPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
    const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<string>('');
    const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const validateNewPassword = (text: string) => {
        setNewPassword(text);
        if (text.length < 8) {
            setPasswordError('Password must be at least 8 characters long.');
        } else if (!/[!@#$%^&*(),.?":{}|<>_-]/.test(text)) {
            setPasswordError('Password must contain at least one special character.');
        } else {
            setPasswordError('');
        }
    };

    const validateConfirmPassword = (text: string) => {
        setConfirmNewPassword(text);
        if (text !== newPassword) {
            setConfirmPasswordError('Passwords do not match.');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleChangePassword = async (): Promise<void> => {
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters long.');
            return;
        }

        if (!/[!@#$%^&*(),.?":{}|<>_-]/.test(newPassword)) {
            Alert.alert('Error', 'Password must contain at least one special character.');
            return;
        }

        if (passwordError || confirmPasswordError) {
            Alert.alert('Error', 'Please fix password errors before submitting.');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token not found.');
            }

            const response = await fetch(
                'https://www.realvistamanagement.com/accounts/change-password/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify({
                        old_password: oldPassword,
                        new_password: newPassword,
                        confirm_password: confirmNewPassword,
                    }),
                }
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error((data as { error?: string }).error || 'Failed to change password.');
            }

            Alert.alert('Success', 'Your password has been changed successfully.');

            router.replace('/(app)/(tabs)');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Something went wrong.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Old Password"
                    secureTextEntry={!showOldPassword}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                />
                <Pressable onPress={() => setShowOldPassword(!showOldPassword)}>
                    <Ionicons name={showOldPassword ? 'eye-off' : 'eye'} size={24} color="#666" />
                </Pressable>
            </View>

            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={validateNewPassword}
                />
                <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                    <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={24} color="#666" />
                </Pressable>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm New Password"
                    secureTextEntry={!showConfirmNewPassword}
                    value={confirmNewPassword}
                    onChangeText={validateConfirmPassword}
                />
                <Pressable onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                    <Ionicons name={showConfirmNewPassword ? 'eye-off' : 'eye'} size={24} color="#666" />
                </Pressable>
            </View>
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

            <Pressable
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={handleChangePassword}
                disabled={isSubmitting}
            >
                <Text style={styles.buttonText}>Change Password</Text>
            </Pressable>
        </View>
    );
};

export default ChangePassword;

type Styles = {
    container: ViewStyle;
    title: TextStyle;
    passwordContainer: ViewStyle;
    input: TextStyle;
    errorText: TextStyle;
    button: ViewStyle;
    buttonDisabled: ViewStyle;
    buttonText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: '#f9f9f9',
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginBottom: 10,
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
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
