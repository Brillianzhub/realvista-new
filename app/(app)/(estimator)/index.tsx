import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Linking,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface FormData {
    propertyType: string;
    location: string;
    size: string;
    bedrooms: string;
    condition: string;
    additionalFeatures: string;
}

interface EstimateResult {
    min: number;
    max: number;
}

const propertyTypes = ['Land', 'Residential Building', 'Commercial Building'];
const conditions = ['New', 'Good', 'Needs Renovation'];

const estimateValue = (data: FormData): EstimateResult => {
    const base = 10000000;
    const location = data.location.toLowerCase();

    let multiplier = 1.5;
    if (location.includes('lagos') || location.includes('lekki') || location.includes('vi') || location.includes('victoria island') || location.includes('ikoyi')) {
        multiplier = 3;
    } else if (location.includes('abuja')) {
        multiplier = 2.5;
    } else if (location.includes('port harcourt') || location.includes('ibadan')) {
        multiplier = 2;
    }

    const size = parseFloat(data.size) || 0;
    const sizeMultiplier = size > 0 ? size / 100 : 1;

    let typeMultiplier = 1;
    if (data.propertyType === 'Commercial Building') {
        typeMultiplier = 1.5;
    } else if (data.propertyType === 'Residential Building') {
        typeMultiplier = 1.2;
    }

    let conditionMultiplier = 1;
    if (data.condition === 'New') {
        conditionMultiplier = 1.2;
    } else if (data.condition === 'Needs Renovation') {
        conditionMultiplier = 0.7;
    }

    const bedrooms = parseInt(data.bedrooms) || 0;
    const bedroomMultiplier = bedrooms > 0 ? 1 + (bedrooms * 0.1) : 1;

    const estimatedValue = base * multiplier * sizeMultiplier * typeMultiplier * conditionMultiplier * bedroomMultiplier;

    return {
        min: Math.round(estimatedValue * 0.9),
        max: Math.round(estimatedValue * 1.2),
    };
};

const formatCurrency = (value: number): string => {
    return `₦${value.toLocaleString()}`;
};

export default function PropertyValueEstimatorScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        propertyType: '',
        location: '',
        size: '',
        bedrooms: '',
        condition: '',
        additionalFeatures: '',
    });
    const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] = useState(false);
    const [showConditionDropdown, setShowConditionDropdown] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [estimateResult, setEstimateResult] = useState<EstimateResult | null>(null);

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (estimateResult) {
            setEstimateResult(null);
        }
    };

    const handlePropertyTypeSelect = (type: string) => {
        setFormData({ ...formData, propertyType: type });
        setShowPropertyTypeDropdown(false);
        if (type === 'Land') {
            setFormData({ ...formData, propertyType: type, bedrooms: '' });
        }
    };

    const handleConditionSelect = (condition: string) => {
        setFormData({ ...formData, condition });
        setShowConditionDropdown(false);
    };

    const validateForm = (): boolean => {
        if (!formData.propertyType) {
            Alert.alert('Validation Error', 'Please select a property type');
            return false;
        }
        if (!formData.location.trim()) {
            Alert.alert('Validation Error', 'Please enter a location');
            return false;
        }
        if (!formData.size || parseFloat(formData.size) <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid size');
            return false;
        }
        if (formData.propertyType !== 'Land' && (!formData.bedrooms || parseInt(formData.bedrooms) <= 0)) {
            Alert.alert('Validation Error', 'Please enter number of bedrooms');
            return false;
        }
        if (!formData.condition) {
            Alert.alert('Validation Error', 'Please select a condition');
            return false;
        }
        return true;
    };

    const handleEstimate = () => {
        if (!validateForm()) {
            return;
        }

        setIsCalculating(true);
        setEstimateResult(null);

        setTimeout(() => {
            const result = estimateValue(formData);
            setEstimateResult(result);
            setIsCalculating(false);
        }, 1500);
    };

    const handleContactMethod = (method: 'email' | 'phone') => {
        if (method === 'email') {
            Linking.openURL('mailto:contact@realvistaproperties.com');
        } else {
            Linking.openURL('tel:+2347043065222');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={24} color="#358B8B" />
                    <Text style={styles.infoText}>
                        Get an instant AI-powered estimate of your property's market value in Nigeria
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Property Type <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setShowPropertyTypeDropdown(!showPropertyTypeDropdown)}
                        >
                            <Text
                                style={[
                                    styles.dropdownText,
                                    !formData.propertyType && styles.dropdownPlaceholder,
                                ]}
                            >
                                {formData.propertyType || 'Select property type'}
                            </Text>
                            <Ionicons
                                name={showPropertyTypeDropdown ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#6B7280"
                            />
                        </TouchableOpacity>
                        {showPropertyTypeDropdown && (
                            <View style={styles.dropdownMenu}>
                                {propertyTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={styles.dropdownItem}
                                        onPress={() => handlePropertyTypeSelect(type)}
                                    >
                                        <Text style={styles.dropdownItemText}>{type}</Text>
                                        {formData.propertyType === type && (
                                            <Ionicons name="checkmark" size={20} color="#358B8B" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Location <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Lekki, Lagos"
                            placeholderTextColor="#9CA3AF"
                            value={formData.location}
                            onChangeText={(value) => handleInputChange('location', value)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Size (in square meters) <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 500"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={formData.size}
                            onChangeText={(value) => handleInputChange('size', value)}
                        />
                    </View>

                    {formData.propertyType !== 'Land' && formData.propertyType !== '' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Number of Bedrooms <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 3"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={formData.bedrooms}
                                onChangeText={(value) => handleInputChange('bedrooms', value)}
                            />
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Condition <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setShowConditionDropdown(!showConditionDropdown)}
                        >
                            <Text
                                style={[
                                    styles.dropdownText,
                                    !formData.condition && styles.dropdownPlaceholder,
                                ]}
                            >
                                {formData.condition || 'Select condition'}
                            </Text>
                            <Ionicons
                                name={showConditionDropdown ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#6B7280"
                            />
                        </TouchableOpacity>
                        {showConditionDropdown && (
                            <View style={styles.dropdownMenu}>
                                {conditions.map((condition) => (
                                    <TouchableOpacity
                                        key={condition}
                                        style={styles.dropdownItem}
                                        onPress={() => handleConditionSelect(condition)}
                                    >
                                        <Text style={styles.dropdownItemText}>{condition}</Text>
                                        {formData.condition === condition && (
                                            <Ionicons name="checkmark" size={20} color="#358B8B" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Additional Features (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="e.g. Pool, Gym, Parking spaces, Security..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={formData.additionalFeatures}
                            onChangeText={(value) => handleInputChange('additionalFeatures', value)}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.estimateButton, isCalculating && styles.estimateButtonDisabled]}
                        onPress={handleEstimate}
                        disabled={isCalculating}
                    >
                        {isCalculating ? (
                            <>
                                <ActivityIndicator color="#FFFFFF" size="small" />
                                <Text style={styles.estimateButtonText}>Calculating estimate...</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="calculator" size={20} color="#FFFFFF" />
                                <Text style={styles.estimateButtonText}>Estimate Value</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {estimateResult && (
                    <View style={styles.resultSection}>
                        <View style={styles.resultHeader}>
                            <Ionicons name="checkmark-circle" size={48} color="#358B8B" />
                            <Text style={styles.resultTitle}>Estimated Market Value</Text>
                        </View>
                        <View style={styles.resultCard}>
                            <Text style={styles.resultRange}>
                                {formatCurrency(estimateResult.min)} – {formatCurrency(estimateResult.max)}
                            </Text>
                            <View style={styles.resultDetails}>
                                <View style={styles.resultDetailItem}>
                                    <Text style={styles.resultDetailLabel}>Lower Bound</Text>
                                    <Text style={styles.resultDetailValue}>
                                        {formatCurrency(estimateResult.min)}
                                    </Text>
                                </View>
                                <View style={styles.resultDivider} />
                                <View style={styles.resultDetailItem}>
                                    <Text style={styles.resultDetailLabel}>Upper Bound</Text>
                                    <Text style={styles.resultDetailValue}>
                                        {formatCurrency(estimateResult.max)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.disclaimer}>
                            <Ionicons name="alert-circle-outline" size={20} color="#F59E0B" />
                            <Text style={styles.disclaimerText}>
                                Note: This is an AI-based estimate. Actual value may vary based on market
                                conditions, property specifics, and location factors.
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.consultationSection}>
                    <View style={styles.consultationHeader}>
                        <Ionicons name="people" size={28} color="#358B8B" />
                        <Text style={styles.consultationTitle}>Need Professional Valuation?</Text>
                    </View>
                    <Text style={styles.consultationText}>
                        Get an accurate, certified property valuation from our expert team at RealVista
                    </Text>
                    <View style={styles.contactButtons}>
                        <TouchableOpacity
                            style={styles.contactButton}
                            onPress={() => handleContactMethod('email')}
                        >
                            <Ionicons name="mail" size={20} color="#358B8B" />
                            <View style={styles.contactButtonContent}>
                                <Text style={styles.contactButtonLabel}>Email</Text>
                                <Text style={styles.contactButtonValue}>contact@realvistaproperties.com</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.contactButton}
                            onPress={() => handleContactMethod('phone')}
                        >
                            <Ionicons name="call" size={20} color="#358B8B" />
                            <View style={styles.contactButtonContent}>
                                <Text style={styles.contactButtonLabel}>Phone</Text>
                                <Text style={styles.contactButtonValue}>+234 704 306 5222</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    placeholder: {
        width: 40,
    },
    content: {
        padding: 16,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#ECFDF5',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#065F46',
        lineHeight: 20,
    },
    form: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
    },
    textArea: {
        minHeight: 100,
        paddingTop: 14,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    dropdownText: {
        fontSize: 16,
        color: '#111827',
    },
    dropdownPlaceholder: {
        color: '#9CA3AF',
    },
    dropdownMenu: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#111827',
    },
    estimateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#358B8B',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    estimateButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    estimateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    resultHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 12,
    },
    resultCard: {
        backgroundColor: '#ECFDF5',
        borderRadius: 12,
        padding: 20,
        borderWidth: 2,
        borderColor: '#358B8B',
        marginBottom: 16,
    },
    resultRange: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#358B8B',
        textAlign: 'center',
        marginBottom: 20,
    },
    resultDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    resultDetailItem: {
        flex: 1,
        alignItems: 'center',
    },
    resultDetailLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    resultDetailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    resultDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#D1FAE5',
    },
    disclaimer: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: '#FEF3C7',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FCD34D',
    },
    disclaimerText: {
        flex: 1,
        fontSize: 13,
        color: '#78350F',
        lineHeight: 18,
    },
    consultationSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    consultationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    consultationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    consultationText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 20,
    },
    contactButtons: {
        gap: 12,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    contactButtonContent: {
        flex: 1,
    },
    contactButtonLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    contactButtonValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
});
