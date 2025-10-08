import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    useColorScheme,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const statesOfNigeria = [
    { label: 'Abia', value: 'abia' },
    { label: 'Adamawa', value: 'adamawa' },
    { label: 'Akwa Ibom', value: 'akwa_ibom' },
    { label: 'Anambra', value: 'anambra' },
    { label: 'Bauchi', value: 'bauchi' },
    { label: 'Bayelsa', value: 'bayelsa' },
    { label: 'Benue', value: 'benue' },
    { label: 'Borno', value: 'borno' },
    { label: 'Cross River', value: 'cross_river' },
    { label: 'Delta', value: 'delta' },
    { label: 'Ebonyi', value: 'ebonyi' },
    { label: 'Edo', value: 'edo' },
    { label: 'Ekiti', value: 'ekiti' },
    { label: 'Enugu', value: 'enugu' },
    { label: 'Gombe', value: 'gombe' },
    { label: 'Imo', value: 'imo' },
    { label: 'Jigawa', value: 'jigawa' },
    { label: 'Kaduna', value: 'kaduna' },
    { label: 'Kano', value: 'kano' },
    { label: 'Katsina', value: 'katsina' },
    { label: 'Kebbi', value: 'kebbi' },
    { label: 'Kogi', value: 'kogi' },
    { label: 'Kwara', value: 'kwara' },
    { label: 'Lagos', value: 'lagos' },
    { label: 'Nasarawa', value: 'nasarawa' },
    { label: 'Niger', value: 'niger' },
    { label: 'Ogun', value: 'ogun' },
    { label: 'Ondo', value: 'ondo' },
    { label: 'Osun', value: 'osun' },
    { label: 'Oyo', value: 'oyo' },
    { label: 'Plateau', value: 'plateau' },
    { label: 'Rivers', value: 'rivers' },
    { label: 'Sokoto', value: 'sokoto' },
    { label: 'Taraba', value: 'taraba' },
    { label: 'Yobe', value: 'yobe' },
    { label: 'Zamfara', value: 'zamfara' },
    { label: 'Federal Capital Territory', value: 'fct' },
];

const propertyTypes = [
    { label: 'House', value: 'house' },
    { label: 'Apartment', value: 'apartment' },
    { label: 'Land', value: 'land' },
    { label: 'Commercial Property', value: 'commercial' },
    { label: 'Office Space', value: 'office' },
    { label: 'Warehouse', value: 'warehouse' },
    { label: 'Shop/Store', value: 'shop' },
    { label: 'Duplex', value: 'duplex' },
    { label: 'Bungalow', value: 'bungalow' },
    { label: 'Terrace', value: 'terrace' },
    { label: 'Semi-Detached House', value: 'semi_detached' },
    { label: 'Detached House', value: 'detached' },
    { label: 'Farm Land', value: 'farm_land' },
    { label: 'Industrial Property', value: 'industrial' },
    { label: 'Short Let', value: 'short_let' },
    { label: 'Studio Apartment', value: 'studio' },
];

const statusTypes = [
    { label: 'Available', value: 'available' },
    { label: 'Occupied', value: 'occupied' },
    { label: 'Under Maintenance', value: 'under_maintenance' },
];

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

export interface PropertyFormData {
    title: string;
    address: string;
    location: string;
    city: string;
    zip_code: string;
    description: string;
    status: string;
    property_type: string;
    year_bought: string;
    area: string;
    num_units: number;
    initial_cost: string;
    current_value: string;
    currency: string;
    virtual_tour_url: string;
    slot_price: number | null;
    slot_price_current: number | null;
    total_slots: number | null;
    user_slots: number;
}

type PropertyFormErrors = Partial<Record<keyof PropertyFormData, string>>;

interface PropertyFormProps {
    onSubmit: (data: PropertyFormData) => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ onSubmit }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [formData, setFormData] = useState<PropertyFormData>({
        title: '',
        address: '',
        location: '',
        city: '',
        zip_code: '',
        description: '',
        status: '',
        property_type: '',
        year_bought: '',
        area: '',
        num_units: 1,
        initial_cost: '',
        current_value: '',
        currency: 'NGN',
        virtual_tour_url: '',
        slot_price: null,
        slot_price_current: null,
        total_slots: null,
        user_slots: 0,
    });

    const [errors, setErrors] = useState<PropertyFormErrors>({});
    const [showStatePicker, setShowStatePicker] = useState(false);
    const [showPropertyTypePicker, setShowPropertyTypePicker] = useState(false);
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

    const formatNumberWithCommas = (value: string): string => {
        if (!value) return value;
        const numericValue = value.replace(/[^0-9.]/g, '');
        const [whole, decimal] = numericValue.split('.');
        const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return decimal !== undefined ? `${formattedWhole}.${decimal}` : formattedWhole;
    };

    const removeCommas = (value: string): string => value.replace(/,/g, '');

    const handleInputChange = (field: keyof PropertyFormData, value: string | number | null) => {
        setFormData((prevData) => ({ ...prevData, [field]: value as never }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (data: PropertyFormData): PropertyFormErrors => {
        const errors: PropertyFormErrors = {};

        if (!data.title.trim()) errors.title = 'Title is required';
        if (!data.address.trim()) errors.address = 'Address is required';
        if (!data.location.trim()) errors.location = 'Location is required';
        if (!data.city.trim()) errors.city = 'City is required';

        if (!['available', 'occupied', 'under_maintenance'].includes(data.status)) {
            errors.status = 'Status is required';
        }

        if (!data.property_type.trim()) errors.property_type = 'Property type is required';

        if (
            data.year_bought &&
            (isNaN(Number(data.year_bought)) ||
                Number(data.year_bought) < 1900 ||
                Number(data.year_bought) > new Date().getFullYear())
        ) {
            errors.year_bought = `Year must be between 1900 and ${new Date().getFullYear()}`;
        }

        if (data.area && Number(data.area) <= 0) errors.area = 'Area must be positive';

        if (!data.num_units || isNaN(Number(data.num_units)) || data.num_units < 1) {
            errors.num_units = 'Number of units must be at least 1';
        }

        if (!data.initial_cost || isNaN(Number(removeCommas(data.initial_cost))) || Number(removeCommas(data.initial_cost)) <= 0) {
            errors.initial_cost = 'Initial cost must be a positive number';
        }

        if (!data.current_value || isNaN(Number(removeCommas(data.current_value))) || Number(removeCommas(data.current_value)) <= 0) {
            errors.current_value = 'Current value must be a positive number';
        }

        if (!data.currency.trim()) errors.currency = 'Currency is required';

        return errors;
    };

    const handleSubmit = () => {
        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            setErrors({});
            onSubmit(formData);
        }
    };

    const getSelectedLabel = (value: string, options: { label: string; value: string }[]) => {
        const option = options.find((opt) => opt.value === value);
        return option ? option.label : '';
    };

    return (
        <KeyboardAvoidingView
            // style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
            >
                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        Title <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, isDark && styles.inputDark, errors.title && styles.inputError]}
                        placeholder="Title of property"
                        placeholderTextColor="#9CA3AF"
                        value={formData.title}
                        onChangeText={(value) => handleInputChange('title', value)}
                    />
                    {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        Address <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, isDark && styles.inputDark, errors.address && styles.inputError]}
                        placeholder="Address of property"
                        placeholderTextColor="#9CA3AF"
                        value={formData.address}
                        onChangeText={(value) => handleInputChange('address', value)}
                        multiline
                    />
                    {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        State <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={[styles.pickerButton, isDark && styles.pickerButtonDark, errors.location && styles.inputError]}
                        onPress={() => setShowStatePicker(!showStatePicker)}
                    >
                        <Text style={[styles.pickerButtonText, isDark && styles.pickerButtonTextDark, !formData.location && styles.placeholderText]}>
                            {getSelectedLabel(formData.location, statesOfNigeria) || 'Choose a state'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    </TouchableOpacity>
                    {showStatePicker && (
                        <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                            <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                                {statesOfNigeria.map((state) => (
                                    <TouchableOpacity
                                        key={state.value}
                                        style={styles.pickerOption}
                                        onPress={() => {
                                            handleInputChange('location', state.value);
                                            setShowStatePicker(false);
                                        }}
                                    >
                                        <Text style={[styles.pickerOptionText, isDark && styles.pickerOptionTextDark]}>
                                            {state.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                    {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        City <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, isDark && styles.inputDark, errors.city && styles.inputError]}
                        placeholder="City where property is located"
                        placeholderTextColor="#9CA3AF"
                        value={formData.city}
                        onChangeText={(value) => handleInputChange('city', value)}
                    />
                    {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>Postal Code</Text>
                    <TextInput
                        style={[styles.input, isDark && styles.inputDark]}
                        placeholder="000000"
                        placeholderTextColor="#9CA3AF"
                        value={formData.zip_code}
                        onChangeText={(value) => handleInputChange('zip_code', value)}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea, isDark && styles.inputDark]}
                        placeholder="Description of property"
                        placeholderTextColor="#9CA3AF"
                        value={formData.description}
                        onChangeText={(value) => handleInputChange('description', value)}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        Property Type <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={[styles.pickerButton, isDark && styles.pickerButtonDark, errors.property_type && styles.inputError]}
                        onPress={() => setShowPropertyTypePicker(!showPropertyTypePicker)}
                    >
                        <Text style={[styles.pickerButtonText, isDark && styles.pickerButtonTextDark, !formData.property_type && styles.placeholderText]}>
                            {getSelectedLabel(formData.property_type, propertyTypes) || 'Select property type'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    </TouchableOpacity>
                    {showPropertyTypePicker && (
                        <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                            <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                                {propertyTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={styles.pickerOption}
                                        onPress={() => {
                                            handleInputChange('property_type', type.value);
                                            setShowPropertyTypePicker(false);
                                        }}
                                    >
                                        <Text style={[styles.pickerOptionText, isDark && styles.pickerOptionTextDark]}>
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                    {errors.property_type && <Text style={styles.errorText}>{errors.property_type}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        Status <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.radioGroup}>
                        {statusTypes.map((item) => (
                            <TouchableOpacity
                                key={item.value}
                                style={styles.radioButton}
                                onPress={() => handleInputChange('status', item.value)}
                            >
                                <View style={[styles.dot, formData.status === item.value && styles.selectedDot]} />
                                <Text
                                    style={[
                                        styles.radioButtonText,
                                        isDark && styles.radioButtonTextDark,
                                        formData.status === item.value && styles.selectedRadioButtonText,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.status && <Text style={styles.errorText}>{errors.status}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        Year Bought <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, isDark && styles.inputDark, errors.year_bought && styles.inputError]}
                        placeholder="Year property was bought (e.g. 2021)"
                        placeholderTextColor="#9CA3AF"
                        value={formData.year_bought}
                        onChangeText={(value) => handleInputChange('year_bought', value)}
                        keyboardType="numeric"
                    />
                    {errors.year_bought && <Text style={styles.errorText}>{errors.year_bought}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        Area (sqm) <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, isDark && styles.inputDark, errors.area && styles.inputError]}
                        placeholder="Area of the property (e.g. 450)"
                        placeholderTextColor="#9CA3AF"
                        value={formData.area}
                        onChangeText={(value) => handleInputChange('area', value)}
                        keyboardType="numeric"
                    />
                    {errors.area && <Text style={styles.errorText}>{errors.area}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        Number of Units <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, isDark && styles.inputDark, errors.num_units && styles.inputError]}
                        placeholder="No. of plots for land (e.g. 2)"
                        placeholderTextColor="#9CA3AF"
                        value={formData.num_units.toString()}
                        onChangeText={(value) => handleInputChange('num_units', Number(value) || 0)}
                        keyboardType="numeric"
                    />
                    {errors.num_units && <Text style={styles.errorText}>{errors.num_units}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        Initial Cost <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, isDark && styles.inputDark, errors.initial_cost && styles.inputError]}
                        placeholder="Initial cost of property"
                        placeholderTextColor="#9CA3AF"
                        value={formatNumberWithCommas(formData.initial_cost)}
                        onChangeText={(value) => handleInputChange('initial_cost', removeCommas(value))}
                        keyboardType="numeric"
                    />
                    {errors.initial_cost && <Text style={styles.errorText}>{errors.initial_cost}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        Current Value <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, isDark && styles.inputDark, errors.current_value && styles.inputError]}
                        placeholder="Current value of property"
                        placeholderTextColor="#9CA3AF"
                        value={formatNumberWithCommas(formData.current_value)}
                        onChangeText={(value) => handleInputChange('current_value', removeCommas(value))}
                        keyboardType="numeric"
                    />
                    {errors.current_value && <Text style={styles.errorText}>{errors.current_value}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        Currency <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={[styles.pickerButton, isDark && styles.pickerButtonDark, errors.currency && styles.inputError]}
                        onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                    >
                        <Text style={[styles.pickerButtonText, isDark && styles.pickerButtonTextDark]}>
                            {getSelectedLabel(formData.currency, currencies) || 'Select currency'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    </TouchableOpacity>
                    {showCurrencyPicker && (
                        <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                            <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                                {currencies.map((curr) => (
                                    <TouchableOpacity
                                        key={curr.value}
                                        style={styles.pickerOption}
                                        onPress={() => {
                                            handleInputChange('currency', curr.value);
                                            setShowCurrencyPicker(false);
                                        }}
                                    >
                                        <Text style={[styles.pickerOptionText, isDark && styles.pickerOptionTextDark]}>
                                            {curr.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                    {errors.currency && <Text style={styles.errorText}>{errors.currency}</Text>}
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Save and Continue</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default PropertyForm;

const styles = StyleSheet.create({
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
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
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
    radioGroup: {
        flexDirection: 'column',
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        marginRight: 10,
    },
    selectedDot: {
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6',
    },
    radioButtonText: {
        fontSize: 15,
        color: '#374151',
    },
    radioButtonTextDark: {
        color: '#E5E7EB',
    },
    selectedRadioButtonText: {
        color: '#358B8B',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#358B8B',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});
