import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    useColorScheme,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

type RemovePropertyModalProps = {
    visible: boolean;
    onClose: () => void;
};

export default function RemovePropertyModal({
    visible,
    onClose,
}: RemovePropertyModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [propertyId, setPropertyId] = useState('');
    const [confirmationText, setConfirmationText] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        if (confirmationText.toLowerCase() === 'delete') {
            console.log('Property removed:', {
                propertyId,
                reason,
            });
            setPropertyId('');
            setConfirmationText('');
            setReason('');
            onClose();
        }
    };

    const isValid = confirmationText.toLowerCase() === 'delete';

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                            Remove Property
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons
                                name="close"
                                size={28}
                                color={isDark ? '#E5E7EB' : '#374151'}
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.warningBox}>
                            <Ionicons name="warning" size={32} color="#F59E0B" />
                            <Text style={styles.warningText}>
                                This action cannot be undone. Please proceed with caution.
                            </Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Property to Remove
                            </Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="Select property from dropdown"
                                placeholderTextColor="#9CA3AF"
                                value={propertyId}
                                onChangeText={setPropertyId}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Reason for Removal
                            </Text>
                            <TextInput
                                style={[styles.input, styles.textArea, isDark && styles.inputDark]}
                                placeholder="Optional: Why are you removing this property?"
                                placeholderTextColor="#9CA3AF"
                                value={reason}
                                onChangeText={setReason}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Type "DELETE" to confirm
                            </Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="DELETE"
                                placeholderTextColor="#9CA3AF"
                                value={confirmationText}
                                onChangeText={setConfirmationText}
                                autoCapitalize="characters"
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                !isValid && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={!isValid}
                        >
                            <Ionicons
                                name="trash"
                                size={20}
                                color={isValid ? '#FFFFFF' : '#9CA3AF'}
                            />
                            <Text
                                style={[
                                    styles.submitButtonText,
                                    !isValid && styles.submitButtonTextDisabled,
                                ]}
                            >
                                Remove Property
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
    },
    modalContentDark: {
        backgroundColor: '#1F2937',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    modalTitleDark: {
        color: '#F9FAFB',
    },
    warningBox: {
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    warningText: {
        flex: 1,
        fontSize: 14,
        color: '#92400E',
        fontWeight: '500',
    },
    formGroup: {
        marginBottom: 20,
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
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
    },
    inputDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
        color: '#F9FAFB',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#EF4444',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
        marginBottom: 20,
    },
    submitButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButtonTextDisabled: {
        color: '#9CA3AF',
    },
});
