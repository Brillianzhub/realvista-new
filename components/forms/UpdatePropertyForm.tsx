import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    useColorScheme,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useUserProperties from '@/hooks/portfolio/useUserProperty';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface Property {
    id: string;
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
}

interface UpdatePropertyFormProps {
    onSubmit?: (values: any) => void;
}

const UpdatePropertyForm: React.FC<UpdatePropertyFormProps> = ({ onSubmit }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { properties, loading: propertiesLoading } = useUserProperties();
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [showPropertyPicker, setShowPropertyPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        property_id: '',
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
        num_units: '',
        initial_cost: '',
        current_value: '',
        currency: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showStatePicker, setShowStatePicker] = useState(false);
    const [showPropertyTypePicker, setShowPropertyTypePicker] = useState(false);
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

    useEffect(() => {
        if (selectedPropertyId) {
            loadPropertyData(selectedPropertyId);
        }
    }, [selectedPropertyId]);

    const loadPropertyData = async (propertyId: string) => {
        setIsLoading(true);
        try {
            // Wait until properties are loaded (if your hook loads asynchronously)
            if (propertiesLoading) return;

            // Find the matching property from your existing list
            const property = properties.find(p => p.id.toString() === propertyId);

            if (!property) {
                Alert.alert('Error', 'Property not found.');
                return;
            }

            // Populate your form data
            setFormData({
                property_id: property.id?.toString() || '',
                title: property.title || '',
                address: property.address || '',
                location: property.location || '',
                city: property.city || '',
                zip_code: property.zip_code || '',
                description: property.description || '',
                status: property.status || '',
                property_type: property.property_type || '',
                year_bought: property.year_bought?.toString() || '',
                area: property.area?.toString() || '',
                num_units: property.num_units?.toString() || '',
                initial_cost: property.initial_cost?.toString() || '',
                current_value: property.current_value?.toString() || '',
                currency: property.currency || '',
            });
        } catch (error) {
            console.error('Error loading property data:', error);
            Alert.alert('Error', 'Failed to load property data.');
        } finally {
            setIsLoading(false);
        }
    };


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

    const formatNumberWithCommas = (value: string) => {
        if (!value) return value;
        const numericValue = value.replace(/[^0-9.]/g, '');
        const [whole, decimal] = numericValue.split('.');
        const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return decimal !== undefined ? `${formattedWhole}.${decimal}` : formattedWhole;
    };

    const removeCommas = (value: string) => value.replace(/,/g, '');

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title || formData.title.trim() === '') {
            newErrors.title = 'Title is required';
        }

        if (!formData.address || formData.address.trim() === '') {
            newErrors.address = 'Address is required';
        }

        if (!formData.location || formData.location.trim() === '') {
            newErrors.location = 'Location is required';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'City is required.';
        }

        if (!['available', 'occupied', 'under_maintenance'].includes(formData.status)) {
            newErrors.status = 'Invalid status';
        }

        if (!formData.status || formData.status.trim() === '') {
            newErrors.status = 'Status is required';
        }

        if (!formData.property_type || formData.property_type.trim() === '') {
            newErrors.property_type = 'Property type is required';
        }

        if (
            formData.year_bought &&
            (isNaN(Number(formData.year_bought)) ||
                Number(formData.year_bought) < 1900 ||
                Number(formData.year_bought) > new Date().getFullYear())
        ) {
            newErrors.year_bought = `Year must be between 1900 and ${new Date().getFullYear()}`;
        }

        if (formData.area && Number(formData.area) <= 0) {
            newErrors.area = 'Area must be positive';
        }

        if (!formData.num_units || isNaN(Number(formData.num_units)) || Number(formData.num_units) < 1) {
            newErrors.num_units = 'Number of units must be at least 1';
        }

        if (
            !formData.initial_cost ||
            isNaN(Number(removeCommas(formData.initial_cost))) ||
            Number(removeCommas(formData.initial_cost)) <= 0
        ) {
            newErrors.initial_cost = 'Initial cost must be a positive number';
        }

        if (
            !formData.current_value ||
            isNaN(Number(removeCommas(formData.current_value))) ||
            Number(removeCommas(formData.current_value)) <= 0
        ) {
            newErrors.current_value = 'Current value must be a positive number';
        }

        if (!formData.currency || formData.currency.trim() === '') {
            newErrors.currency = 'Currency is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!selectedPropertyId) {
            Alert.alert('Error', 'Please select a property to update.');
            return;
        }

        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please correct the highlighted fields.');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = await AsyncStorage.getItem('authToken');

            if (!token) {
                Alert.alert('Error', 'Authentication token required!');
                setIsSubmitting(false);
                return;
            }

            const submissionData = {
                ...formData,
                initial_cost: removeCommas(formData.initial_cost),
                current_value: removeCommas(formData.current_value),
            };

            const response = await fetch(
                'https://www.realvistamanagement.com/portfolio/properties/add/',
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
                throw new Error(errorData.message || 'Failed to update property. Please try again.');
            }

            Alert.alert('Success', 'Property updated successfully!');

            setFormData({
                property_id: '',
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
                num_units: '',
                initial_cost: '',
                current_value: '',
                currency: '',
            });
            setSelectedPropertyId(null);

            if (onSubmit) onSubmit(submissionData);
        } catch (error: any) {
            console.error('Error updating property:', error);
            Alert.alert('Error', error.message || 'Failed to update property. Please try again.');
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

    const getSelectedLabel = (list: any[], value: string) => {
        const item = list.find((i) => i.value === value);
        return item ? item.label : 'Select';
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
            <ScrollView
                contentContainerStyle={{ paddingBottom: 60 }}
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

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FB902E" />
                        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
                            Loading property data...
                        </Text>
                    </View>
                ) : selectedPropertyId ? (
                    <>
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Title <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark, errors.title && styles.inputError]}
                                placeholder="Title of property"
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
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
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                value={formData.address}
                                onChangeText={(value) => handleInputChange('address', value)}
                            />
                            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                State <Text style={styles.required}>*</Text>
                            </Text>
                            <TouchableOpacity
                                style={[styles.pickerButton, isDark && styles.pickerButtonDark]}
                                onPress={() => setShowStatePicker(!showStatePicker)}
                            >
                                <Text
                                    style={[
                                        styles.pickerButtonText,
                                        isDark && styles.pickerButtonTextDark,
                                        !formData.location && styles.placeholderText,
                                    ]}
                                >
                                    {getSelectedLabel(statesOfNigeria, formData.location) || 'Choose a state'}
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
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
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
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                keyboardType="numeric"
                                value={formData.zip_code}
                                onChangeText={(value) => handleInputChange('zip_code', value)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, isDark && styles.inputDark]}
                                placeholder="Description of property"
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                value={formData.description}
                                onChangeText={(value) => handleInputChange('description', value)}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Property Type <Text style={styles.required}>*</Text>
                            </Text>
                            <TouchableOpacity
                                style={[styles.pickerButton, isDark && styles.pickerButtonDark]}
                                onPress={() => setShowPropertyTypePicker(!showPropertyTypePicker)}
                            >
                                <Text
                                    style={[
                                        styles.pickerButtonText,
                                        isDark && styles.pickerButtonTextDark,
                                        !formData.property_type && styles.placeholderText,
                                    ]}
                                >
                                    {getSelectedLabel(propertyTypes, formData.property_type) || 'Select property type'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                            </TouchableOpacity>
                            {showPropertyTypePicker && (
                                <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                                    <View style={styles.pickerScroll}>
                                        {propertyTypes.map((item) => (
                                            <TouchableOpacity
                                                key={item.value}
                                                style={styles.pickerOption}
                                                onPress={() => {
                                                    handleInputChange('property_type', item.value);
                                                    setShowPropertyTypePicker(false);
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
                                        ))}
                                    </View>
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
                                        style={[
                                            styles.radioButton,
                                            formData.status === item.value && styles.selectedRadioButton,
                                        ]}
                                        onPress={() => handleInputChange('status', item.value)}
                                    >
                                        <View
                                            style={[styles.dot, formData.status === item.value && styles.selectedDot]}
                                        />
                                        <Text
                                            style={[
                                                styles.radioButtonText,
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
                            <Text style={[styles.label, isDark && styles.labelDark]}>Year Bought</Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark, errors.year_bought && styles.inputError]}
                                placeholder="2020"
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                keyboardType="numeric"
                                value={formData.year_bought}
                                onChangeText={(value) => handleInputChange('year_bought', value)}
                            />
                            {errors.year_bought && <Text style={styles.errorText}>{errors.year_bought}</Text>}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>Area (sqm)</Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark, errors.area && styles.inputError]}
                                placeholder="450"
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                keyboardType="numeric"
                                value={formData.area}
                                onChangeText={(value) => handleInputChange('area', value)}
                            />
                            {errors.area && <Text style={styles.errorText}>{errors.area}</Text>}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Number of Units <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark, errors.num_units && styles.inputError]}
                                placeholder="1"
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                keyboardType="numeric"
                                value={formData.num_units}
                                onChangeText={(value) => handleInputChange('num_units', value)}
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
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                keyboardType="decimal-pad"
                                value={formatNumberWithCommas(formData.initial_cost)}
                                onChangeText={(value) => handleInputChange('initial_cost', removeCommas(value))}
                            />
                            {errors.initial_cost && <Text style={styles.errorText}>{errors.initial_cost}</Text>}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Current Value <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    isDark && styles.inputDark,
                                    errors.current_value && styles.inputError,
                                ]}
                                placeholder="Current value of property"
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                keyboardType="decimal-pad"
                                value={formatNumberWithCommas(formData.current_value)}
                                onChangeText={(value) => handleInputChange('current_value', removeCommas(value))}
                            />
                            {errors.current_value && <Text style={styles.errorText}>{errors.current_value}</Text>}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Currency <Text style={styles.required}>*</Text>
                            </Text>
                            <TouchableOpacity
                                style={[styles.pickerButton, isDark && styles.pickerButtonDark]}
                                onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                            >
                                <Text
                                    style={[
                                        styles.pickerButtonText,
                                        isDark && styles.pickerButtonTextDark,
                                        !formData.currency && styles.placeholderText,
                                    ]}
                                >
                                    {getSelectedLabel(currencies, formData.currency) || 'Select a currency'}
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
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                isSubmitting && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                    <Text style={styles.submitButtonText}>Update Property</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </>
                ) : null}
            </ScrollView>
        </KeyboardAvoidingView >
    );
};

export default UpdatePropertyForm;

const styles = StyleSheet.create({
    container: {
        // flex: 1,
    },
    scrollView: {
        // flex: 1,
        paddingBottom: 60,
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
    radioGroup: {
        flexDirection: 'column',
        gap: 12,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
    },
    selectedRadioButton: {
        borderColor: '#FB902E',
        backgroundColor: '#FFF7ED',
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        marginRight: 12,
    },
    selectedDot: {
        borderColor: '#FB902E',
        backgroundColor: '#FB902E',
    },
    radioButtonText: {
        fontSize: 16,
        color: '#6B7280',
    },
    selectedRadioButtonText: {
        color: '#FB902E',
        fontWeight: '600',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    loadingTextDark: {
        color: '#9CA3AF',
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
