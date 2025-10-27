import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    TextInput,
    useColorScheme,
    Platform,
    FlatList,
    KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import useUserProperties from '@/hooks/portfolio/useUserProperty';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Property {
    id: string;
    title: string;
    currency: string;
}

interface PropertyIncomeFormProps {
    onSubmit?: (values: any) => void;
}

const PropertyIncomeForm: React.FC<PropertyIncomeFormProps> = ({ onSubmit }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { properties, loading: propertiesLoading } = useUserProperties();
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [showPropertyPicker, setShowPropertyPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        property: '',
        amount: '',
        currency: 'NGN',
        description: '',
        date_received: '',
    });

    const [date, setDate] = useState(new Date());
    const [errors, setErrors] = useState<Record<string, string>>({});


    const formatNumberWithCommas = (value: string) => {
        if (!value) return value;
        const numericValue = value.replace(/[^0-9.]/g, '');
        const [whole, decimal] = numericValue.split('.');
        const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return decimal !== undefined ? `${formattedWhole}.${decimal}` : formattedWhole;
    };

    const removeCommas = (value: string) => value.replace(/,/g, '');

    const handleInputChange = (field: string, value: string) => {
        setFormData((prevData) => ({ ...prevData, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.property) {
            newErrors.property = 'Property is required.';
        }
        if (!formData.amount || isNaN(Number(removeCommas(formData.amount))) || Number(removeCommas(formData.amount)) <= 0) {
            newErrors.amount = 'Amount must be a valid positive number.';
        }
        if (!formData.currency) {
            newErrors.currency = 'Currency is required.';
        }
        if (!formData.description) {
            newErrors.description = 'Description is required.';
        }
        if (!formData.date_received) {
            newErrors.date_received = 'Date received is required.';
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
                Alert.alert('Authentication Required', 'Authentication token is missing. Please log in again.');
                setIsSubmitting(false);
                return;
            }

            const submissionData = {
                ...formData,
                amount: removeCommas(formData.amount),
            };

            const response = await fetch(
                'https://www.realvistamanagement.com/portfolio/user-property/add-income/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify(submissionData),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to add income. Please try again.');
            }

            Alert.alert('Success', 'Income added successfully!');

            setFormData({
                property: '',
                amount: '',
                currency: 'NGN',
                description: '',
                date_received: '',
            });
            setSelectedPropertyId(null);
            setDate(new Date());

            if (onSubmit) onSubmit(submissionData);
        } catch (error: any) {
            console.error('Error adding income:', error);
            Alert.alert('Error', error.message || 'Failed to add income. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getSelectedPropertyTitle = () => {
        const property = properties.find(
            (p) => p.id === Number(selectedPropertyId)
        );
        return property ? property.title : 'Select a property';
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            style={styles.container}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        Select Property <Text style={styles.required}>*</Text>
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
                                            setFormData((prev) => ({ ...prev, property: item.id.toString() }));
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
                    {errors.property && (
                        <Text style={styles.errorText}>{errors.property}</Text>
                    )}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        Currency <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, styles.disabledInput, isDark && styles.inputDark]}
                        placeholder="Select a currency"
                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                        value={formData.currency}
                        editable={false}
                    />
                    {errors.currency && (
                        <Text style={styles.errorText}>{errors.currency}</Text>
                    )}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        Amount <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, isDark && styles.inputDark, errors.amount && styles.inputError]}
                        placeholder="Amount received"
                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                        keyboardType="decimal-pad"
                        value={formatNumberWithCommas(formData.amount)}
                        onChangeText={(value) =>
                            handleInputChange('amount', removeCommas(value))
                        }
                    />
                    {errors.amount && (
                        <Text style={styles.errorText}>{errors.amount}</Text>
                    )}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        Description <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            styles.textArea,
                            isDark && styles.inputDark,
                            errors.description && styles.inputError
                        ]}
                        placeholder="Rent income ..."
                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                        value={formData.description}
                        onChangeText={(value) => handleInputChange('description', value)}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                    {errors.description && (
                        <Text style={styles.errorText}>{errors.description}</Text>
                    )}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        Date Received <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.dateButton,
                            isDark && styles.dateButtonDark,
                            errors.date_received && styles.inputError
                        ]}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Ionicons
                            name="calendar-outline"
                            size={20}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                        <Text
                            style={[
                                styles.dateButtonText,
                                isDark && styles.dateButtonTextDark,
                                !formData.date_received && styles.placeholderText
                            ]}
                        >
                            {formData.date_received
                                ? `Date: ${formData.date_received}`
                                : 'Select Date Received'}
                        </Text>
                    </TouchableOpacity>
                    {errors.date_received && (
                        <Text style={styles.errorText}>{errors.date_received}</Text>
                    )}
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);

                            if (selectedDate) {
                                const formattedDate = selectedDate.toISOString().split('T')[0];
                                setDate(selectedDate);
                                handleInputChange('date_received', formattedDate);
                            }
                        }}
                    />
                )}

                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (isSubmitting || !selectedPropertyId) && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={isSubmitting || !selectedPropertyId}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                            <Text style={styles.submitButtonText}>Submit Income</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default PropertyIncomeForm;

const styles = StyleSheet.create({
    container: {
        // flex: 1,
    },
    scrollView: {
        // flex: 1,
    },
    scrollContainer: {
        paddingBottom: 20,
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
    inputError: {
        borderColor: '#EF4444',
    },
    disabledInput: {
        opacity: 0.6,
    },
    textArea: {
        minHeight: 100,
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
        fontSize: 16,
        color: '#111827',
    },
    dateButtonTextDark: {
        color: '#F9FAFB',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: '#FB902E',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#D1D5DB',
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
