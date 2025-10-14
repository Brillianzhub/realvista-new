import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    useColorScheme,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const ChangePassword: React.FC = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [oldPassword, setOldPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
    const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<string>('');
    const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const getPasswordStrength = (password: string): { strength: string; color: string; percentage: number } => {
        if (!password) return { strength: '', color: '#E5E7EB', percentage: 0 };

        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>_-]/.test(password)) score++;

        if (score <= 2) return { strength: 'Weak', color: '#EF4444', percentage: 33 };
        if (score <= 4) return { strength: 'Medium', color: '#F59E0B', percentage: 66 };
        return { strength: 'Strong', color: '#10B981', percentage: 100 };
    };

    const validateNewPassword = (text: string) => {
        setNewPassword(text);
        if (text.length > 0 && text.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
        } else if (text.length >= 8 && !/[!@#$%^&*(),.?":{}|<>_-]/.test(text)) {
            setPasswordError('Password must contain at least one special character');
        } else {
            setPasswordError('');
        }

        if (confirmNewPassword && text !== confirmNewPassword) {
            setConfirmPasswordError('Passwords do not match');
        } else {
            setConfirmPasswordError('');
        }
    };

    const validateConfirmPassword = (text: string) => {
        setConfirmNewPassword(text);
        if (text !== newPassword) {
            setConfirmPasswordError('Passwords do not match');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleChangePassword = async (): Promise<void> => {
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            Alert.alert('Missing Fields', 'All fields are required.');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('Invalid Password', 'Password must be at least 8 characters long.');
            return;
        }

        if (!/[!@#$%^&*(),.?":{}|<>_-]/.test(newPassword)) {
            Alert.alert('Invalid Password', 'Password must contain at least one special character.');
            return;
        }

        if (passwordError || confirmPasswordError) {
            Alert.alert('Validation Error', 'Please fix password errors before submitting.');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Error', 'Authentication token not found.');
                return;
            }

            const response = await fetch('https://www.realvistamanagement.com/accounts/change-password/', {
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
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error((data as { error?: string }).error || 'Failed to change password.');
            }

            Alert.alert('Success', 'Your password has been changed successfully.', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);

            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const passwordStrength = getPasswordStrength(newPassword);

    return (
        <KeyboardAvoidingView
            style={[styles.container, isDark && styles.containerDark]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <LinearGradient colors={isDark ? ['#111827', '#1F2937'] : ['#F9FAFB', '#FFFFFF']} style={styles.gradient}>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, isDark && styles.iconCircleDark]}>
                            <Ionicons name="lock-closed" size={48} color="#358B8B" />
                        </View>
                        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                            Secure your account with a strong password
                        </Text>
                    </View>

                    <View style={[styles.card, isDark && styles.cardDark]}>
                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={20} color="#358B8B" />
                            <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                                Your password must be at least 8 characters and include a special character
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>Current Password</Text>
                            <View style={[styles.passwordContainer, isDark && styles.passwordContainerDark]}>
                                <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="Enter your current password"
                                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                    secureTextEntry={!showOldPassword}
                                    value={oldPassword}
                                    onChangeText={setOldPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)} style={styles.eyeButton}>
                                    <Ionicons name={showOldPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>New Password</Text>
                            <View
                                style={[
                                    styles.passwordContainer,
                                    isDark && styles.passwordContainerDark,
                                    passwordError && styles.inputError,
                                ]}
                            >
                                <Ionicons name="shield-checkmark-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="Enter your new password"
                                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                    secureTextEntry={!showNewPassword}
                                    value={newPassword}
                                    onChangeText={validateNewPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeButton}>
                                    <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                                </TouchableOpacity>
                            </View>

                            {newPassword.length > 0 && (
                                <View style={styles.strengthContainer}>
                                    <View style={[styles.strengthBar, isDark && styles.strengthBarDark]}>
                                        <View
                                            style={[
                                                styles.strengthFill,
                                                { width: `${passwordStrength.percentage}%`, backgroundColor: passwordStrength.color },
                                            ]}
                                        />
                                    </View>
                                    <Text style={[styles.strengthText, { color: passwordStrength.color }]}>{passwordStrength.strength}</Text>
                                </View>
                            )}

                            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>Confirm New Password</Text>
                            <View
                                style={[
                                    styles.passwordContainer,
                                    isDark && styles.passwordContainerDark,
                                    confirmPasswordError && styles.inputError,
                                ]}
                            >
                                <Ionicons name="checkmark-circle-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="Confirm your new password"
                                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                    secureTextEntry={!showConfirmNewPassword}
                                    value={confirmNewPassword}
                                    onChangeText={validateConfirmPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)} style={styles.eyeButton}>
                                    <Ionicons name={showConfirmNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                                </TouchableOpacity>
                            </View>
                            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
                        </View>

                        <View style={styles.requirementsBox}>
                            <Text style={[styles.requirementsTitle, isDark && styles.requirementsTitleDark]}>Password Requirements:</Text>
                            <View style={styles.requirement}>
                                <Ionicons
                                    name={newPassword.length >= 8 ? 'checkmark-circle' : 'close-circle'}
                                    size={16}
                                    color={newPassword.length >= 8 ? '#10B981' : '#9CA3AF'}
                                />
                                <Text style={[styles.requirementText, isDark && styles.requirementTextDark]}>At least 8 characters</Text>
                            </View>
                            <View style={styles.requirement}>
                                <Ionicons
                                    name={/[!@#$%^&*(),.?":{}|<>_-]/.test(newPassword) ? 'checkmark-circle' : 'close-circle'}
                                    size={16}
                                    color={/[!@#$%^&*(),.?":{}|<>_-]/.test(newPassword) ? '#10B981' : '#9CA3AF'}
                                />
                                <Text style={[styles.requirementText, isDark && styles.requirementTextDark]}>One special character</Text>
                            </View>
                            <View style={styles.requirement}>
                                <Ionicons
                                    name={confirmNewPassword && newPassword === confirmNewPassword ? 'checkmark-circle' : 'close-circle'}
                                    size={16}
                                    color={confirmNewPassword && newPassword === confirmNewPassword ? '#10B981' : '#9CA3AF'}
                                />
                                <Text style={[styles.requirementText, isDark && styles.requirementTextDark]}>Passwords match</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleChangePassword}
                        style={[styles.submitButton, isDark && styles.submitButtonDark]}
                        disabled={isSubmitting}
                    >
                        <LinearGradient colors={['#358B8B', '#2C7070']} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                                    <Text style={styles.submitButtonText}>Update Password</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    containerDark: {
        backgroundColor: '#111827',
    },
    gradient: {
        flex: 1,
    },


    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 16,
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 16,
    },
    iconCircleDark: {
        backgroundColor: '#1F2937',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    subtitleDark: {
        color: '#9CA3AF',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 16,
    },
    cardDark: {
        backgroundColor: '#1F2937',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#F0FDFA',
        borderRadius: 12,
        padding: 12,
        marginBottom: 24,
        gap: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#0F766E',
        lineHeight: 18,
    },
    infoTextDark: {
        color: '#5EEAD4',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    labelDark: {
        color: '#D1D5DB',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 12,
        height: 48,
    },
    passwordContainerDark: {
        backgroundColor: '#111827',
        borderColor: '#374151',
    },
    inputError: {
        borderColor: '#EF4444',
        borderWidth: 1.5,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    inputDark: {
        color: '#F9FAFB',
    },
    eyeButton: {
        padding: 4,
    },
    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        overflow: 'hidden',
    },
    strengthBarDark: {
        backgroundColor: '#374151',
    },
    strengthFill: {
        height: '100%',
        borderRadius: 2,
    },
    strengthText: {
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 20,
    },
    requirementsBox: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
    },
    requirementsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    requirementsTitleDark: {
        color: '#D1D5DB',
    },
    requirement: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 6,
    },
    requirementText: {
        fontSize: 13,
        color: '#6B7280',
    },
    requirementTextDark: {
        color: '#9CA3AF',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
        marginLeft: 4,
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#358B8B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitButtonDark: {
        shadowOpacity: 0.5,
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default ChangePassword;
