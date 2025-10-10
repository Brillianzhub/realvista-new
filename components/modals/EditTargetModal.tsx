import React, { useState, useEffect } from 'react';
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
    Platform,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const currencies = [
    { label: '₦ (NGN)', value: 'NGN' },
    { label: '$ (USD)', value: 'USD' },
    { label: '€ (EUR)', value: 'EUR' },
    { label: '£ (GBP)', value: 'GBP' },
    { label: '¥ (JPY)', value: 'JPY' },
    { label: '$ (CAD)', value: 'CAD' },
    { label: '$ (AUD)', value: 'AUD' },
    { label: 'Fr (CHF)', value: 'CHF' },
];

interface SavingsTarget {
    id: number;
    target_name: string;
    target_amount: string;
    current_savings: string;
    currency: string;
    timeframe: number;
    start_date: string;
    end_date: string;
    achieved_at: string | null;
    created_at: string;
    updated_at: string;
    user: number;
    minimum_monthly_contribution: number;
    months_remaining: number;
    progress_percentage: number;
    remaining_amount: number;
    contributions: any[];
}

type EditTargetModalProps = {
    visible: boolean;
    target: SavingsTarget;
    onClose: () => void;
};

export default function EditTargetModal({ visible, target, onClose }: EditTargetModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [targetName, setTargetName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentSavings, setCurrentSavings] = useState('');
    const [timeFrameMonths, setTimeFrameMonths] = useState('');
    const [currency, setCurrency] = useState('NGN');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
    const [monthlySavingsNeeded, setMonthlySavingsNeeded] = useState(0);

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (target) {
            setTargetName(target.target_name);
            setTargetAmount(target.target_amount);
            setCurrentSavings(target.current_savings);
            setTimeFrameMonths(target.timeframe.toString());
            setCurrency(target.currency);
        }
    }, [target]);

    useEffect(() => {
        if (targetAmount && currentSavings && timeFrameMonths) {
            const targetVal = parseFloat(removeCommas(targetAmount));
            const current = parseFloat(removeCommas(currentSavings));
            const months = parseInt(timeFrameMonths);

            if (!isNaN(targetVal) && !isNaN(current) && !isNaN(months) && months > 0) {
                const remaining = targetVal - current;
                const monthly = remaining / months;
                setMonthlySavingsNeeded(Math.max(monthly, 0));
            } else {
                setMonthlySavingsNeeded(0);
            }
        } else {
            setMonthlySavingsNeeded(0);
        }
    }, [targetAmount, currentSavings, timeFrameMonths]);

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

    const getSelectedCurrencyLabel = () => {
        const item = currencies.find((c) => c.value === currency);
        return item ? item.label : 'Select currency';
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!targetName.trim()) {
            newErrors.targetName = 'Target name is required';
        }

        const targetVal = parseFloat(removeCommas(targetAmount));
        if (!targetAmount || isNaN(targetVal) || targetVal <= 0) {
            newErrors.targetAmount = 'Please enter a valid target amount';
        }

        const current = parseFloat(removeCommas(currentSavings));
        if (!currentSavings || isNaN(current) || current < 0) {
            newErrors.currentSavings = 'Please enter a valid current savings amount';
        }

        if (current > targetVal) {
            newErrors.currentSavings = 'Current savings cannot exceed target amount';
        }

        const months = parseInt(timeFrameMonths);
        if (!timeFrameMonths || isNaN(months) || months <= 0) {
            newErrors.timeFrameMonths = 'Please enter a valid time frame (in months)';
        }

        if (!currency) {
            newErrors.currency = 'Please select a currency';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please correct the highlighted fields.');
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

            const targetVal = parseFloat(removeCommas(targetAmount));
            const current = parseFloat(removeCommas(currentSavings));
            const months = parseInt(timeFrameMonths);

            const payload = {
                target_name: targetName.trim(),
                target_amount: targetVal,
                current_savings: current,
                currency,
                timeframe: months,
            };

            const response = await fetch(
                `https://www.realvistamanagement.com/analyser/financial-targets/${target.id}/`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Token ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update savings target');
            }

            Alert.alert('Success', 'Savings target updated successfully!');
            onClose();
        } catch (error: any) {
            console.error('Error updating target:', error);
            Alert.alert('Error', error.message || 'Failed to update savings target. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                                Edit Savings Target
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={28} color={isDark ? '#E5E7EB' : '#374151'} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Target Name <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWithIcon}>
                                    <Ionicons name="flag-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                                    <TextInput
                                        style={[
                                            styles.input,
                                            isDark && styles.inputDark,
                                            errors.targetName && styles.inputError,
                                        ]}
                                        placeholder="e.g., New Apartment"
                                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                        value={targetName}
                                        onChangeText={(text) => {
                                            setTargetName(text);
                                            if (errors.targetName) {
                                                setErrors((prev) => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.targetName;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                    />
                                </View>
                                {errors.targetName && <Text style={styles.errorText}>{errors.targetName}</Text>}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Target Amount <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWithIcon}>
                                    <Text style={[styles.currencySymbol, isDark && styles.currencySymbolDark]}>
                                        {getCurrencySymbol(currency)}
                                    </Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            isDark && styles.inputDark,
                                            errors.targetAmount && styles.inputError,
                                        ]}
                                        placeholder="500,000"
                                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                        keyboardType="decimal-pad"
                                        value={formatNumberWithCommas(targetAmount)}
                                        onChangeText={(text) => {
                                            setTargetAmount(removeCommas(text));
                                            if (errors.targetAmount) {
                                                setErrors((prev) => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.targetAmount;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                    />
                                </View>
                                {errors.targetAmount && <Text style={styles.errorText}>{errors.targetAmount}</Text>}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Current Savings <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWithIcon}>
                                    <Text style={[styles.currencySymbol, isDark && styles.currencySymbolDark]}>
                                        {getCurrencySymbol(currency)}
                                    </Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            isDark && styles.inputDark,
                                            errors.currentSavings && styles.inputError,
                                        ]}
                                        placeholder="50,000"
                                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                        keyboardType="decimal-pad"
                                        value={formatNumberWithCommas(currentSavings)}
                                        onChangeText={(text) => {
                                            setCurrentSavings(removeCommas(text));
                                            if (errors.currentSavings) {
                                                setErrors((prev) => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.currentSavings;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                    />
                                </View>
                                {errors.currentSavings && (
                                    <Text style={styles.errorText}>{errors.currentSavings}</Text>
                                )}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Time Frame (Months) <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWithIcon}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={20}
                                        color={isDark ? '#9CA3AF' : '#6B7280'}
                                    />
                                    <TextInput
                                        style={[
                                            styles.input,
                                            isDark && styles.inputDark,
                                            errors.timeFrameMonths && styles.inputError,
                                        ]}
                                        placeholder="12"
                                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                        keyboardType="number-pad"
                                        value={timeFrameMonths}
                                        onChangeText={(text) => {
                                            setTimeFrameMonths(text);
                                            if (errors.timeFrameMonths) {
                                                setErrors((prev) => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.timeFrameMonths;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                    />
                                </View>
                                {errors.timeFrameMonths && (
                                    <Text style={styles.errorText}>{errors.timeFrameMonths}</Text>
                                )}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Currency <Text style={styles.required}>*</Text>
                                </Text>
                                <TouchableOpacity
                                    style={[styles.pickerButton, isDark && styles.pickerButtonDark]}
                                    onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                                >
                                    <Text style={[styles.pickerButtonText, isDark && styles.pickerButtonTextDark]}>
                                        {getSelectedCurrencyLabel()}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                                </TouchableOpacity>
                                {showCurrencyPicker && (
                                    <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                                        <FlatList
                                            data={currencies}
                                            keyExtractor={(item) => item.value}
                                            style={styles.pickerScroll}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    style={styles.pickerOption}
                                                    onPress={() => {
                                                        setCurrency(item.value);
                                                        setShowCurrencyPicker(false);
                                                    }}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.pickerOptionText,
                                                            isDark && styles.pickerOptionTextDark,
                                                        ]}
                                                    >
                                                        {item.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                )}
                            </View>

                            {monthlySavingsNeeded > 0 && (
                                <LinearGradient
                                    colors={isDark ? ['#1F2937', '#374151'] : ['#EFF6FF', '#DBEAFE']}
                                    style={styles.summaryCard}
                                >
                                    <Ionicons name="bulb-outline" size={24} color="#FB902E" />
                                    <View style={styles.summaryContent}>
                                        <Text style={[styles.summaryLabel, isDark && styles.summaryLabelDark]}>
                                            You need to save
                                        </Text>
                                        <Text style={[styles.summaryAmount, isDark && styles.summaryAmountDark]}>
                                            {getCurrencySymbol(currency)}
                                            {monthlySavingsNeeded.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </Text>
                                        <Text style={[styles.summarySubtext, isDark && styles.summarySubtextDark]}>
                                            per month to reach your goal
                                        </Text>
                                    </View>
                                </LinearGradient>
                            )}

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
                                            <Text style={styles.submitButtonText}>Update Target</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
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
    currencySymbol: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    currencySymbolDark: {
        color: '#E5E7EB',
    },
    input: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: '#111827',
    },
    inputDark: {
        color: '#F9FAFB',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
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
    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        gap: 16,
    },
    summaryContent: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    summaryLabelDark: {
        color: '#9CA3AF',
    },
    summaryAmount: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FB902E',
        marginBottom: 4,
    },
    summaryAmountDark: {
        color: '#FB902E',
    },
    summarySubtext: {
        fontSize: 12,
        color: '#6B7280',
    },
    summarySubtextDark: {
        color: '#9CA3AF',
    },
    submitButton: {
        marginTop: 8,
        marginBottom: 20,
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
