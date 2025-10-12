import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Alert,
    useColorScheme,
} from 'react-native';
import CustomForm from './CustomForm';
import CustomPicker from './CustomPicker';
import AvailabilityPicker from './AvailabilityPicker';

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
    { label: 'Industrial Property', value: 'industrial' },
    { label: 'Short Let', value: 'short_let' },
    { label: 'Studio Apartment', value: 'studio' },
];

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

const currencyOptions = [
    { label: '₦ (NGN)', value: 'NGN' },
    { label: '$ (USD)', value: 'USD' },
    { label: '£ (GBP)', value: 'GBP' },
    { label: '€ (EUR)', value: 'EUR' },
];

const listingPurposeChoices = [
    { label: 'For Sale', value: 'sale' },
    { label: 'For Lease', value: 'lease' },
    { label: 'For Rent', value: 'rent' },
];

const listingCategoryChoices = [
    { label: 'Corporate', value: 'Corporate' },
    { label: 'P2P (Peer-to-Peer)', value: 'P2P' },
];

type ListingFormProps = {
    initialData?: any;
    onSubmit: (data: any) => void;
};

export default function ListingForm({ initialData, onSubmit }: ListingFormProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [formData, setFormData] = useState({
        listing_type: initialData?.listing_type || 'Corporate',
        title: initialData?.title || '',
        description: initialData?.description || '',
        property_type: initialData?.property_type || '',
        price: initialData?.property_value?.toString() || '',
        currency: initialData?.currency || 'NGN',
        listing_purpose: initialData?.listing_purpose || '',
        address: initialData?.address || '',
        city: initialData?.city || '',
        state: initialData?.state || '',
        zip_code: initialData?.zip_code || '',
        bedrooms: initialData?.bedrooms?.toString() || '',
        bathrooms: initialData?.bathrooms?.toString() || '',
        square_feet: initialData?.square_feet?.toString() || '',
        lot_size: initialData?.lot_size?.toString() || '',
        year_built: initialData?.year_built?.toString() || '',
        availability: initialData?.availability || 'now',
        availability_date: initialData?.availability_date || '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleInputChange = (field: string, value: any) => {
        setFormData((prevData) => {
            const updatedData = { ...prevData, [field]: value };

            if (field === 'property_type' && value === 'land') {
                updatedData.bedrooms = '';
                updatedData.bathrooms = '';
                updatedData.year_built = '';
                updatedData.square_feet = '';
            }

            if (field === 'availability' && value === 'now') {
                updatedData.availability_date = '';
            }

            return updatedData;
        });

        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateFormData = (data: typeof formData) => {
        const errors: { [key: string]: string } = {};

        if (!data.listing_type) {
            errors.listing_type = 'Listing category is required.';
        }

        if (!data.title.trim()) {
            errors.title = 'Title is required.';
        }

        if (!data.description.trim()) {
            errors.description = 'Description is required.';
        }

        if (!data.property_type) {
            errors.property_type = 'Property type is required.';
        }

        if (!data.price || isNaN(Number(removeCommas(data.price))) || Number(removeCommas(data.price)) <= 0) {
            errors.price = 'Price must be a positive number.';
        }

        if (!data.currency) {
            errors.currency = 'Currency is required.';
        }

        if (!data.listing_purpose) {
            errors.listing_purpose = 'Listing purpose is required.';
        }

        if (!data.address.trim()) {
            errors.address = 'Address is required.';
        }

        if (!data.city.trim()) {
            errors.city = 'City is required.';
        }

        if (!data.state) {
            errors.state = 'State is required.';
        }

        if (data.property_type !== 'land') {
            if (!data.bedrooms || isNaN(Number(data.bedrooms)) || Number(data.bedrooms) < 0) {
                errors.bedrooms = 'Number of bedrooms must be zero or greater.';
            }

            if (!data.bathrooms || isNaN(Number(data.bathrooms)) || Number(data.bathrooms) < 0) {
                errors.bathrooms = 'Number of bathrooms must be zero or greater.';
            }

            if (!data.square_feet || isNaN(Number(data.square_feet)) || Number(data.square_feet) <= 0) {
                errors.square_feet = 'Area must be a positive number.';
            }
        }

        if (!data.lot_size || isNaN(Number(data.lot_size)) || Number(data.lot_size) <= 0) {
            errors.lot_size = 'Plot size must be a positive number.';
        }

        if (data.property_type !== 'land' && data.year_built) {
            if (!/^\d{4}$/.test(data.year_built) || Number(data.year_built) > new Date().getFullYear()) {
                errors.year_built = 'Year built must be a valid year.';
            }
        }

        if (!data.availability) {
            errors.availability = 'Availability is required.';
        }

        if (data.availability === 'specific_date' && !data.availability_date) {
            errors.availability_date = 'Please select an availability date.';
        }

        return errors;
    };

    const formatNumberWithCommas = (value: string) => {
        if (!value) return value;
        const numericValue = value.replace(/[^0-9.]/g, '');
        const [whole, decimal] = numericValue.split('.');
        const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return decimal !== undefined ? `${formattedWhole}.${decimal}` : formattedWhole;
    };

    const removeCommas = (value: string) => value.replace(/,/g, '');

    const handleSubmit = () => {
        const validationErrors = validateFormData(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            const errorMessages = Object.values(validationErrors).join('\n');
            Alert.alert('Validation Error', `Please complete the mandatory fields:\n\n${errorMessages}`);
            return;
        }

        const submissionData = {
            listing_type: formData.listing_type,
            title: formData.title,
            description: formData.description,
            property_type: formData.property_type,
            property_value: Number(removeCommas(formData.price)),
            currency: formData.currency,
            listing_purpose: formData.listing_purpose,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code,
            bedrooms: formData.property_type !== 'land' && formData.bedrooms ? Number(formData.bedrooms) : null,
            bathrooms: formData.property_type !== 'land' && formData.bathrooms ? Number(formData.bathrooms) : null,
            square_feet: formData.property_type !== 'land' && formData.square_feet ? Number(formData.square_feet) : null,
            lot_size: Number(formData.lot_size),
            year_built: formData.property_type !== 'land' && formData.year_built ? Number(formData.year_built) : null,
            availability: formData.availability,
            availability_date: formData.availability === 'specific_date' ? formData.availability_date : null,
        };

        onSubmit(submissionData);
    };

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
        >
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Listing Category
            </Text>
            <View style={styles.radioGroup}>
                {listingCategoryChoices.map((item) => (
                    <TouchableOpacity
                        key={item.value}
                        style={[
                            styles.radioButton,
                            formData.listing_type === item.value && styles.selectedRadioButton,
                            isDark && styles.radioButtonDark,
                        ]}
                        onPress={() => handleInputChange('listing_type', item.value)}
                    >
                        <View
                            style={[
                                styles.dot,
                                formData.listing_type === item.value && styles.selectedDot,
                            ]}
                        />
                        <Text
                            style={[
                                styles.radioButtonText,
                                formData.listing_type === item.value && styles.selectedRadioButtonText,
                                isDark && styles.radioButtonTextDark,
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <CustomForm
                label="Title"
                required
                placeholder="Title of property"
                keyboardType="default"
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                error={errors.title}
            />

            <CustomForm
                label="Description"
                required
                placeholder="Description of property"
                keyboardType="default"
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                error={errors.description}
                multiline
                numberOfLines={4}
            />

            <CustomPicker
                label="Property Type"
                required
                placeholder="Select property type"
                options={propertyTypes}
                selectedValue={formData.property_type}
                onValueChange={(value) => handleInputChange('property_type', value)}
                error={errors.property_type}
            />

            <CustomForm
                label="Price"
                required
                placeholder="Selling price of property"
                keyboardType="numeric"
                value={formatNumberWithCommas(formData.price)}
                onChangeText={(value) => handleInputChange('price', removeCommas(value))}
                error={errors.price}
            />

            <CustomPicker
                label="Currency"
                required
                placeholder="Select a currency"
                options={currencyOptions}
                selectedValue={formData.currency}
                onValueChange={(value) => handleInputChange('currency', value)}
                error={errors.currency}
            />

            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Purpose of Listing <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.radioGroup}>
                {listingPurposeChoices.map((item) => (
                    <TouchableOpacity
                        key={item.value}
                        style={[
                            styles.radioButton,
                            formData.listing_purpose === item.value && styles.selectedRadioButton,
                            isDark && styles.radioButtonDark,
                        ]}
                        onPress={() => handleInputChange('listing_purpose', item.value)}
                    >
                        <View
                            style={[
                                styles.dot,
                                formData.listing_purpose === item.value && styles.selectedDot,
                            ]}
                        />
                        <Text
                            style={[
                                styles.radioButtonText,
                                formData.listing_purpose === item.value && styles.selectedRadioButtonText,
                                isDark && styles.radioButtonTextDark,
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <CustomForm
                label="Address"
                required
                placeholder="Address of property"
                keyboardType="default"
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                error={errors.address}
            />

            <CustomForm
                label="City"
                required
                placeholder="City where property is located"
                keyboardType="default"
                value={formData.city}
                onChangeText={(value) => handleInputChange('city', value)}
                error={errors.city}
            />

            <CustomPicker
                label="State"
                required
                options={statesOfNigeria}
                selectedValue={formData.state}
                placeholder="Choose a state"
                onValueChange={(value) => handleInputChange('state', value)}
                error={errors.state}
            />

            <CustomForm
                label="Postal Code"
                placeholder="e.g. 000000"
                keyboardType="numeric"
                value={formData.zip_code}
                onChangeText={(value) => handleInputChange('zip_code', value)}
                error={errors.zip_code}
            />

            {formData.property_type !== 'land' && (
                <>
                    <CustomForm
                        label="Bedrooms"
                        required
                        placeholder="Number of bedrooms"
                        keyboardType="numeric"
                        value={formData.bedrooms}
                        onChangeText={(value) => handleInputChange('bedrooms', value)}
                        error={errors.bedrooms}
                    />

                    <CustomForm
                        label="Bathrooms"
                        required
                        placeholder="Number of bathrooms"
                        keyboardType="numeric"
                        value={formData.bathrooms}
                        onChangeText={(value) => handleInputChange('bathrooms', value)}
                        error={errors.bathrooms}
                    />

                    <CustomForm
                        label="Area of property (sqm)"
                        required
                        placeholder="The size of the property"
                        keyboardType="numeric"
                        value={formData.square_feet}
                        onChangeText={(value) => handleInputChange('square_feet', value)}
                        error={errors.square_feet}
                    />
                </>
            )}

            <CustomForm
                label="Area of plot (sqm)"
                required
                placeholder="Size of the plot"
                keyboardType="numeric"
                value={formData.lot_size}
                onChangeText={(value) => handleInputChange('lot_size', value)}
                error={errors.lot_size}
            />

            {formData.property_type !== 'land' && (
                <CustomForm
                    label="Year Built"
                    placeholder="e.g. 1998"
                    keyboardType="numeric"
                    value={formData.year_built}
                    onChangeText={(value) => handleInputChange('year_built', value)}
                    error={errors.year_built}
                />
            )}

            <AvailabilityPicker
                formData={formData}
                handleInputChange={handleInputChange}
                errors={errors}
            />

            <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.submitButton, isDark && styles.submitButtonDark]}
            >
                <Text style={styles.submitButtonText}>Add and Continue</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    sectionTitleDark: {
        color: '#E5E7EB',
    },
    required: {
        color: '#EF4444',
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    radioButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        gap: 8,
    },
    radioButtonDark: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
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
    },
    selectedDot: {
        borderColor: '#FB902E',
        backgroundColor: '#FB902E',
    },
    radioButtonText: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
    },
    radioButtonTextDark: {
        color: '#9CA3AF',
    },
    selectedRadioButtonText: {
        color: '#FB902E',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#FB902E',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    submitButtonDark: {
        backgroundColor: '#F97316',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});
