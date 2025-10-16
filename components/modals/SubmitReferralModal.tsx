import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    useColorScheme,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '@/context/GlobalProvider';

interface SubmitReferralModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function SubmitReferralModal({
    visible,
    onClose,
}: SubmitReferralModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [referrerCode, setReferrerCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const { reloadProfile } = useGlobalContext();

    useEffect(() => {
        const getToken = async () => {
            const token = await AsyncStorage.getItem('authToken');
            setAuthToken(token);
        };
        getToken();
    }, []);

    useEffect(() => {
        if (!visible) {
            setReferrerCode('');
        }
    }, [visible]);


    const handleSubmit = async () => {
        if (!referrerCode.trim()) {
            Alert.alert('Required Field', 'Please enter a referrer code to continue.');
            return;
        }

        setLoading(true);
        try {

            const response = await fetch(
                'https://www.realvistamanagement.com/accounts/submit-referral/',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Token ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ referrer_code: referrerCode }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                reloadProfile();
                Alert.alert('Success', 'Referral code submitted successfully!');
                onClose();
            } else {
                Alert.alert('Error', data.message || 'Failed to submit referral code.');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableOpacity
                    style={styles.overlayTouchable}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                        <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
                            <LinearGradient
                                colors={['#358B8B', '#2C7070']}
                                style={styles.header}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <View style={styles.headerContent}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="gift-outline" size={28} color="#FFFFFF" />
                                    </View>
                                    <Text style={styles.headerTitle}>Enter Referral Code</Text>
                                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                        <Ionicons name="close" size={24} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.headerSubtitle}>
                                    Enter the code from the person who referred you
                                </Text>
                            </LinearGradient>

                            <View style={styles.content}>
                                <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
                                    <View style={styles.infoIconContainer}>
                                        <Ionicons name="information-circle" size={20} color="#358B8B" />
                                    </View>
                                    <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                                        By entering a referral code, both you and your referrer will earn rewards
                                    </Text>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={[styles.label, isDark && styles.labelDark]}>
                                        Referral Code
                                    </Text>
                                    <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                                        <Ionicons
                                            name="ticket-outline"
                                            size={20}
                                            color={isDark ? '#9CA3AF' : '#6B7280'}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={[styles.input, isDark && styles.inputDark]}
                                            placeholder="Enter referral code"
                                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                            value={referrerCode}
                                            onChangeText={setReferrerCode}
                                            autoCapitalize="characters"
                                            autoCorrect={false}
                                            editable={!loading}
                                        />
                                    </View>
                                </View>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.submitButton,
                                            loading && styles.submitButtonDisabled,
                                        ]}
                                        onPress={handleSubmit}
                                        disabled={loading}
                                        activeOpacity={0.8}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        ) : (
                                            <>
                                                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                                <Text style={styles.submitButtonText}>Submit Code</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
                                        onPress={onClose}
                                        disabled={loading}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayTouchable: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 440,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
    },
    modalContainerDark: {
        backgroundColor: '#1F2937',
    },
    header: {
        paddingVertical: 24,
        paddingHorizontal: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 20,
        marginLeft: 60,
    },
    content: {
        padding: 24,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#F0FDFA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        gap: 12,
        borderWidth: 1,
        borderColor: '#99F6E4',
    },
    infoCardDark: {
        backgroundColor: '#134E4A',
        borderColor: '#2C7A7B',
    },
    infoIconContainer: {
        marginTop: 2,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        color: '#0F766E',
    },
    infoTextDark: {
        color: '#99F6E4',
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    labelDark: {
        color: '#E5E7EB',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
    },
    inputWrapperDark: {
        backgroundColor: '#111827',
        borderColor: '#374151',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        paddingVertical: 14,
    },
    inputDark: {
        color: '#F9FAFB',
    },
    buttonContainer: {
        gap: 12,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FB902E',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#FB902E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonDark: {
        backgroundColor: '#374151',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    cancelButtonTextDark: {
        color: '#9CA3AF',
    },
});
