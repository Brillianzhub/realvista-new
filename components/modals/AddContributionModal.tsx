import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    useColorScheme,
    Alert,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AddContributionModalProps = {
    visible: boolean;
    targetId: number;
    targetName: string;
    currency: string;
    onClose: () => void;
};

export default function AddContributionModal({
    visible,
    targetId,
    targetName,
    currency,
    onClose,
}: AddContributionModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [amount, setAmount] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const formatNumberWithCommas = (value: string) => {
        if (!value) return value;
        const numericValue = value.replace(/[^0-9.]/g, '');
        const [whole, decimal] = numericValue.split('.');
        const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return decimal !== undefined ? `${formattedWhole}.${decimal}` : formattedWhole;
    };

    const removeCommas = (value: string) => value.replace(/,/g, '');

    const getCurrencySymbol = (curr: string): string => {
        const symbols: Record<string, string> = {
            NGN: '₦',
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            CAD: '$',
            AUD: '$',
            CHF: 'Fr',
        };
        return symbols[curr] || curr;
    };

    const formatDate = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleDateChange = (event: any, date?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (date) {
            setSelectedDate(date);
        }
    };

    const validateForm = () => {
        if (!amount || amount.trim() === '') {
            setError('Please enter an amount');
            return false;
        }

        const numAmount = parseFloat(removeCommas(amount));
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid amount');
            return false;
        }

        setError('');
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {

            const token = await AsyncStorage.getItem('authToken');

            if (!token) {
                Alert.alert('Error', 'Authentication required');
                setIsSubmitting(false);
                return;
            }

            const formattedDate = selectedDate.toISOString().split('T')[0];
            const cleanAmount = removeCommas(amount);

            const payload = {
                amount: cleanAmount,
                date: formattedDate,
            };

            const response = await fetch(
                `https://www.realvistamanagement.com/analyser/add-contribution/${targetId}/`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Token ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to add contribution');
            }

            Alert.alert('Success', 'Contribution added successfully!');
            setAmount('');
            setSelectedDate(new Date());
            setError('');
            onClose();
        } catch (error: any) {
            console.error('Error adding contribution:', error);
            Alert.alert('Error', error.message || 'Failed to add contribution. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setAmount('');
        setSelectedDate(new Date());
        setError('');
        setShowDatePicker(false);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardAvoidingView}
                    >
                        <TouchableWithoutFeedback>
                            <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                                <View style={styles.modalHeader}>
                                    <View style={styles.headerContent}>
                                        <Ionicons name="add-circle" size={28} color="#FB902E" />
                                        <View style={styles.headerText}>
                                            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                                                Add Contribution
                                            </Text>
                                            <Text style={[styles.modalSubtitle, isDark && styles.modalSubtitleDark]}>
                                                {targetName}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={handleClose}>
                                        <Ionicons name="close" size={28} color={isDark ? '#E5E7EB' : '#374151'} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView
                                    style={styles.scrollView}
                                    contentContainerStyle={styles.scrollContent}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    <View style={styles.formContainer}>
                                        <View style={styles.formGroup}>
                                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                                Amount <Text style={styles.required}>*</Text>
                                            </Text>
                                            <View style={[styles.inputWithIcon, error && styles.inputError]}>
                                                <Text style={[styles.currencySymbol, isDark && styles.currencySymbolDark]}>
                                                    {getCurrencySymbol(currency)}
                                                </Text>
                                                <TextInput
                                                    style={[styles.input, isDark && styles.inputDark]}
                                                    placeholder="50,000"
                                                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                                    keyboardType="decimal-pad"
                                                    value={formatNumberWithCommas(amount)}
                                                    onChangeText={(text) => {
                                                        setAmount(removeCommas(text));
                                                        if (error) setError('');
                                                    }}
                                                />
                                            </View>
                                            {error && <Text style={styles.errorText}>{error}</Text>}
                                        </View>

                                        <View style={styles.formGroup}>
                                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                                Date <Text style={styles.required}>*</Text>
                                            </Text>
                                            <TouchableOpacity
                                                style={[styles.dateButton, isDark && styles.dateButtonDark]}
                                                onPress={() => setShowDatePicker(true)}
                                            >
                                                <Ionicons
                                                    name="calendar-outline"
                                                    size={20}
                                                    color={isDark ? '#9CA3AF' : '#6B7280'}
                                                />
                                                <Text style={[styles.dateButtonText, isDark && styles.dateButtonTextDark]}>
                                                    {formatDate(selectedDate)}
                                                </Text>
                                                <Ionicons name="chevron-down" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                                            </TouchableOpacity>
                                        </View>

                                        {showDatePicker && (
                                            <DateTimePicker
                                                value={selectedDate}
                                                mode="date"
                                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                onChange={handleDateChange}
                                                maximumDate={new Date()}
                                            />
                                        )}

                                        <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
                                            <Ionicons name="information-circle-outline" size={20} color="#FB902E" />
                                            <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                                                This contribution will be added to your current savings balance.
                                            </Text>
                                        </View>

                                        <View style={styles.buttonContainer}>
                                            <TouchableOpacity
                                                style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
                                                onPress={handleClose}
                                                disabled={isSubmitting}
                                            >
                                                <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>
                                                    Cancel
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                                                onPress={handleSubmit}
                                                disabled={isSubmitting}
                                            >
                                                <LinearGradient
                                                    colors={isSubmitting ? ['#D1D5DB', '#9CA3AF'] : ['#FB902E', '#F97316']}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                    style={styles.submitButtonGradient}
                                                >
                                                    {isSubmitting ? (
                                                        <ActivityIndicator color="#FFFFFF" />
                                                    ) : (
                                                        <>
                                                            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                                            <Text style={styles.submitButtonText}>Add Contribution</Text>
                                                        </>
                                                    )}
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        width: '100%',
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
        minHeight: '90%',
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
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    headerText: {
        flex: 1,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    modalTitleDark: {
        color: '#F9FAFB',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    modalSubtitleDark: {
        color: '#9CA3AF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    formContainer: {
        gap: 20,
    },
    formGroup: {
        marginBottom: 0,
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
    required: {
        color: '#EF4444',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        gap: 12,
    },
    inputError: {
        borderColor: '#EF4444',
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
    },
    currencySymbolDark: {
        color: '#E5E7EB',
    },
    input: {
        flex: 1,
        padding: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    inputDark: {
        color: '#F9FAFB',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    dateButton: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dateButtonDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
    },
    dateButtonText: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    dateButtonTextDark: {
        color: '#F9FAFB',
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#FFF7ED',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FEEBC8',
    },
    infoCardDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#92400E',
        lineHeight: 20,
    },
    infoTextDark: {
        color: '#D1D5DB',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
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
        color: '#D1D5DB',
    },
    submitButton: {
        flex: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonGradient: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
