import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DeleteAccountModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function DeleteAccountModal({ visible, onClose }: DeleteAccountModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [loading, setLoading] = useState(false);

    const handleDeleteAccount = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('authToken');

            if (!token) {
                alert('Authentication token not found. Please log in again.');
                setLoading(false);
                return;
            }

            const deleteAccountUrl = 'https://realvistamanagement.com/accounts/delete-account/';

            const response = await fetch(deleteAccountUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            setLoading(false);

            if (response.ok) {
                alert('Success: ' + data.success);
                onClose();
            } else {
                alert('Error: ' + (data.error || 'Failed to process your request.'));
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            alert('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, styles.dangerIconCircle]}>
                            <Ionicons name="alert-circle" size={40} color="#DC2626" />
                        </View>
                    </View>

                    <Text style={[styles.title, isDark && styles.titleDark]}>
                        Delete Account
                    </Text>

                    <Text style={[styles.message, isDark && styles.messageDark]}>
                        Your account deletion request will be processed within 14 days of submission.
                        You will still have access to your account during this period.
                        We recommend deleting any saved documents, as they will no longer be available once your account is permanently removed.
                    </Text>

                    <View style={styles.warningBox}>
                        <Ionicons name="warning" size={20} color="#F59E0B" />
                        <Text style={styles.warningText}>
                            This action is irreversible. Once deleted, all associated data will be erased.
                            However, you can create a new account anytime in the future.
                        </Text>
                    </View>


                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, isDark && styles.cancelButtonDark]}
                            onPress={onClose}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.buttonText, styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.deleteButton, loading && styles.deleteButtonDisabled]}
                            onPress={handleDeleteAccount}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="trash" size={18} color="#FFFFFF" />
                                    <Text style={[styles.buttonText, styles.deleteButtonText]}>
                                        Delete Account
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    modalContainerDark: {
        backgroundColor: '#1F2937',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dangerIconCircle: {
        backgroundColor: '#FEE2E2',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 16,
    },
    titleDark: {
        color: '#F9FAFB',
    },
    message: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    messageDark: {
        color: '#9CA3AF',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        padding: 12,
        borderRadius: 12,
        marginBottom: 24,
        gap: 8,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: '#92400E',
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cancelButtonDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
    },
    cancelButtonText: {
        color: '#374151',
        fontWeight: '600',
    },
    cancelButtonTextDark: {
        color: '#E5E7EB',
    },
    deleteButton: {
        backgroundColor: '#DC2626',
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    deleteButtonDisabled: {
        opacity: 0.7,
    },
    deleteButtonText: {
        color: '#FFFFFF',
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '700',
    },
});
