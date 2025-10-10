import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    useColorScheme,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserProperties from '@/hooks/portfolio/useUserProperty';

interface Property {
    id: string;
    title: string;
}

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
    const { properties } = useUserProperties();
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [showPropertyPicker, setShowPropertyPicker] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);



    const handleDeleteProperty = async () => {
        if (!selectedPropertyId) {
            Alert.alert('Error', 'Please select a property to delete.');
            return;
        }

        const token = await AsyncStorage.getItem('authToken');

        if (!token) {
            Alert.alert('Error', 'User token required to complete this operation');
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(
                `https://www.realvistamanagement.com/portfolio/delete-property/${selectedPropertyId}/`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (response.ok) {
                Alert.alert('Success', 'Property has been deleted successfully.');
                setSelectedPropertyId(null);
                setConfirmationText('');
                setReason('');
                onClose();
            } else {
                const error = await response.json();
                Alert.alert('Error', error.error || 'Failed to delete property.');
            }
        } catch (error) {
            console.error('Error deleting property:', error);
            Alert.alert('Error', 'Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = () => {
        if (confirmationText.toLowerCase() === 'delete') {
            handleDeleteProperty();
        }
    };

    const isValid = confirmationText.toLowerCase() === 'delete' && selectedPropertyId;

    const getSelectedPropertyTitle = () => {
        const property = properties.find(
            (p) => p.id === Number(selectedPropertyId)
        );
        return property ? property.title : 'Select a property';
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
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
                                    Property to Remove <Text style={styles.required}>*</Text>
                                </Text>
                                <TouchableOpacity
                                    style={[styles.pickerButton, isDark && styles.pickerButtonDark]}
                                    onPress={() => setShowPropertyPicker(!showPropertyPicker)}
                                >
                                    <Text
                                        style={[
                                            styles.pickerButtonText,
                                            isDark && styles.pickerButtonTextDark,
                                            !selectedPropertyId && styles.placeholderText,
                                        ]}
                                    >
                                        {getSelectedPropertyTitle()}
                                    </Text>
                                    <Ionicons
                                        name="chevron-down"
                                        size={20}
                                        color={isDark ? '#9CA3AF' : '#6B7280'}
                                    />
                                </TouchableOpacity>
                                {showPropertyPicker && (
                                    <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                                        <View style={styles.pickerScroll}>
                                            {properties.map((item) => (
                                                <TouchableOpacity
                                                    key={item.id.toString()}
                                                    style={styles.pickerOption}
                                                    onPress={() => {
                                                        setSelectedPropertyId(item.id.toString());
                                                        setShowPropertyPicker(false);
                                                    }}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.pickerOptionText,
                                                            isDark && styles.pickerOptionTextDark
                                                        ]}
                                                    >
                                                        {item.title}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}
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
                                    (!isValid || isLoading) && styles.submitButtonDisabled,
                                ]}
                                onPress={handleSubmit}
                                disabled={!isValid || isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
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
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                </View>
            </KeyboardAvoidingView>
        </Modal >
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
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
    required: {
        color: '#EF4444',
    },
    pickerButton: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerButtonDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
    },
    pickerButtonText: {
        fontSize: 16,
        color: '#111827',
    },
    pickerButtonTextDark: {
        color: '#F9FAFB',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    pickerContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginTop: 8,
        maxHeight: 200,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    pickerContainerDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
    },
    pickerScroll: {
        maxHeight: 200,
    },
    pickerOption: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    pickerOptionText: {
        fontSize: 16,
        color: '#111827',
    },
    pickerOptionTextDark: {
        color: '#F9FAFB',
    },
});
