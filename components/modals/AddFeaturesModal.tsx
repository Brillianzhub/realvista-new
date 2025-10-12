import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    useColorScheme,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type MarketplaceListing } from '@/data/marketplaceListings';
import CustomPicker from '@/components/forms/CustomPicker';

type PropertyFeatures = {
    negotiable: string;
    furnished: boolean;
    pet_friendly: boolean;
    parking_available: boolean;
    swimming_pool: boolean;
    garden: boolean;
    electricity_proximity: string;
    road_network: string;
    development_level: string;
    water_supply: boolean;
    security: boolean;
};

type AddFeaturesModalProps = {
    visible: boolean;
    listingId: string | null;
    onClose: () => void;
};

export default function AddFeaturesModal({
    visible,
    listingId,
    onClose,
}: AddFeaturesModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<PropertyFeatures>({
        negotiable: 'no',
        furnished: false,
        pet_friendly: false,
        parking_available: false,
        swimming_pool: false,
        garden: false,
        electricity_proximity: 'moderate',
        road_network: 'good',
        development_level: 'moderate',
        water_supply: false,
        security: false,
    });

    useEffect(() => {
        if (visible && listingId) {
            loadFeatures();
        } else if (visible && !listingId) {
            resetForm();
        }
    }, [visible, listingId]);

    const loadFeatures = async () => {
        if (!listingId) return;

        try {
            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            if (storedListings) {
                const listings: MarketplaceListing[] = JSON.parse(storedListings);
                const listing = listings.find((l) => l.id === listingId);

                if (listing?.features) {
                    setFormData(listing.features as PropertyFeatures);
                }
            }
        } catch (error) {
            console.error('Error loading features:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            negotiable: 'no',
            furnished: false,
            pet_friendly: false,
            parking_available: false,
            swimming_pool: false,
            garden: false,
            electricity_proximity: 'moderate',
            road_network: 'good',
            development_level: 'moderate',
            water_supply: false,
            security: false,
        });
    };

    const handleInputChange = (key: keyof PropertyFeatures, value: any) => {
        setFormData({
            ...formData,
            [key]: value,
        });
    };

    const handleSubmit = async () => {
        if (!listingId) return;

        setLoading(true);
        try {
            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            if (!storedListings) {
                Alert.alert('Error', 'Listing not found');
                return;
            }

            const listings: MarketplaceListing[] = JSON.parse(storedListings);
            const index = listings.findIndex((l) => l.id === listingId);

            if (index === -1) {
                Alert.alert('Error', 'Listing not found');
                return;
            }

            listings[index] = {
                ...listings[index],
                features: formData,
                current_step: Math.max(listings[index].current_step, 4),
                completion_percentage: calculateCompletion(listings[index]),
                updated_at: new Date().toISOString(),
            };

            await AsyncStorage.setItem('marketplaceListings', JSON.stringify(listings));

            Alert.alert('Success', 'Features saved successfully');
            onClose();
        } catch (error: any) {
            console.error('Error saving features:', error);
            Alert.alert('Error', error.message || 'Failed to save features');
        } finally {
            setLoading(false);
        }
    };

    const calculateCompletion = (listing: MarketplaceListing) => {
        const steps = {
            basicInfo: !!(listing.property_name && listing.property_type && listing.location && listing.city && listing.state),
            images: !!(listing.images && listing.images.length > 0),
            location: !!(listing.latitude && listing.longitude),
            features: !!listing.features,
            published: listing.status === 'Published',
        };

        const completedSteps = Object.values(steps).filter(Boolean).length;
        return Math.round((completedSteps / 5) * 100);
    };

    const FeatureToggle = ({
        label,
        value,
        onToggle,
        icon,
    }: {
        label: string;
        value: boolean;
        onToggle: () => void;
        icon: string;
    }) => (
        <TouchableOpacity
            style={[
                styles.featureToggle,
                value && styles.featureToggleActive,
                isDark && styles.featureToggleDark,
                isDark && value && styles.featureToggleActiveDark,
            ]}
            onPress={onToggle}
            activeOpacity={0.7}
        >
            <Ionicons
                name={icon as any}
                size={24}
                color={value ? '#FFFFFF' : isDark ? '#9CA3AF' : '#6B7280'}
            />
            <Text
                style={[
                    styles.featureToggleText,
                    value && styles.featureToggleTextActive,
                    isDark && styles.featureToggleTextDark,
                ]}
            >
                {label}
            </Text>
            {value && (
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.checkIcon} />
            )}
        </TouchableOpacity>
    );

    const negotiableOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'Slightly', value: 'slightly' },
        { label: 'No', value: 'no' },
    ];

    const electricityOptions = [
        { label: 'Yes', value: 'available' },
        { label: 'Nearby (Less than 100m)', value: 'nearby' },
        { label: 'Moderate (100m - 500m)', value: 'moderate' },
        { label: 'Far (Above 500m)', value: 'far' },
    ];

    const roadNetworkOptions = [
        { label: 'Excellent', value: 'excellent' },
        { label: 'Good', value: 'good' },
        { label: 'Fair', value: 'fair' },
        { label: 'Poor', value: 'poor' },
    ];

    const developmentLevelOptions = [
        { label: 'Highly Developed', value: 'high' },
        { label: 'Moderately Developed', value: 'moderate' },
        { label: 'Sparsely Developed', value: 'low' },
        { label: 'Undeveloped', value: 'undeveloped' },
    ];

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.container, isDark && styles.containerDark]}>
                    <View style={[styles.header, isDark && styles.headerDark]}>
                        <Text style={[styles.title, isDark && styles.titleDark]}>Property Features</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={isDark ? '#F9FAFB' : '#111827'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                            Select what applies
                        </Text>

                        <CustomPicker
                            label="Is the price negotiable?"
                            options={negotiableOptions}
                            selectedValue={formData.negotiable}
                            onValueChange={(value) => handleInputChange('negotiable', value)}
                        />

                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                            Property Amenities
                        </Text>

                        <View style={styles.featuresGrid}>
                            <FeatureToggle
                                label="Furnished"
                                value={formData.furnished}
                                onToggle={() => handleInputChange('furnished', !formData.furnished)}
                                icon="home-outline"
                            />
                            <FeatureToggle
                                label="Pet Friendly"
                                value={formData.pet_friendly}
                                onToggle={() => handleInputChange('pet_friendly', !formData.pet_friendly)}
                                icon="paw-outline"
                            />
                            <FeatureToggle
                                label="Parking"
                                value={formData.parking_available}
                                onToggle={() => handleInputChange('parking_available', !formData.parking_available)}
                                icon="car-outline"
                            />
                            <FeatureToggle
                                label="Swimming Pool"
                                value={formData.swimming_pool}
                                onToggle={() => handleInputChange('swimming_pool', !formData.swimming_pool)}
                                icon="water-outline"
                            />
                            <FeatureToggle
                                label="Garden"
                                value={formData.garden}
                                onToggle={() => handleInputChange('garden', !formData.garden)}
                                icon="leaf-outline"
                            />
                        </View>

                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                            Utilities & Infrastructure
                        </Text>

                        <CustomPicker
                            label="Electricity Availability"
                            options={electricityOptions}
                            selectedValue={formData.electricity_proximity}
                            onValueChange={(value) => handleInputChange('electricity_proximity', value)}
                        />

                        <CustomPicker
                            label="Road Network"
                            options={roadNetworkOptions}
                            selectedValue={formData.road_network}
                            onValueChange={(value) => handleInputChange('road_network', value)}
                        />

                        <CustomPicker
                            label="Development Level"
                            options={developmentLevelOptions}
                            selectedValue={formData.development_level}
                            onValueChange={(value) => handleInputChange('development_level', value)}
                        />

                        <View style={styles.featuresGrid}>
                            <FeatureToggle
                                label="Water Supply"
                                value={formData.water_supply}
                                onToggle={() => handleInputChange('water_supply', !formData.water_supply)}
                                icon="water"
                            />
                            <FeatureToggle
                                label="Security"
                                value={formData.security}
                                onToggle={() => handleInputChange('security', !formData.security)}
                                icon="shield-checkmark-outline"
                            />
                        </View>

                        <View style={{ height: 100 }} />
                    </ScrollView>

                    <View style={[styles.footer, isDark && styles.footerDark]}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Save Features</Text>
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
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    containerDark: {
        backgroundColor: '#1F2937',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerDark: {
        borderBottomColor: '#374151',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    titleDark: {
        color: '#F9FAFB',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 20,
    },
    subtitleDark: {
        color: '#9CA3AF',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginTop: 24,
        marginBottom: 16,
    },
    sectionTitleDark: {
        color: '#F9FAFB',
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    featureToggle: {
        width: '48%',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        position: 'relative',
    },
    featureToggleDark: {
        backgroundColor: '#374151',
    },
    featureToggleActive: {
        backgroundColor: '#FB902E',
    },
    featureToggleActiveDark: {
        backgroundColor: '#FB902E',
    },
    featureToggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
    },
    featureToggleTextDark: {
        color: '#9CA3AF',
    },
    featureToggleTextActive: {
        color: '#FFFFFF',
    },
    checkIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    footerDark: {
        borderTopColor: '#374151',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    submitButton: {
        backgroundColor: '#FB902E',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
