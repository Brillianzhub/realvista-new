import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { type MarketplaceListing } from '@/data/marketplaceListings';
import AddMarketplaceListingModal from '@/components/modals/AddMarketplaceListingModal';
import AddListingImagesModal from '@/components/modals/AddListingImagesModal';
import AddListingCoordinatesModal from '@/components/modals/AddListingCoordinatesModal';
import AddFeaturesModal from '@/components/modals/AddFeaturesModal';
import { useGlobalContext } from '@/context/GlobalProvider';
import useFetchVendorProperties from '@/hooks/market/useVendorListing';
import { mapBackendToFrontend } from '@/utils/market/marketplaceMapper';
import { formatCurrency } from '@/utils/general/formatCurrency';

export default function ListingUpdateScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const listingId = params.id as string;
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { user } = useGlobalContext();
    const { properties } = useFetchVendorProperties(user?.email || null);

    const [loading, setLoading] = useState(true);
    const [listing, setListing] = useState<MarketplaceListing | null>(null);

    // modal states
    const [showBasicInfoModal, setShowBasicInfoModal] = useState(false);
    const [showImagesModal, setShowImagesModal] = useState(false);
    const [showCoordinatesModal, setShowCoordinatesModal] = useState(false);
    const [showFeaturesModal, setShowFeaturesModal] = useState(false);

    useEffect(() => {
        if (listingId) loadListing();
    }, [listingId, properties]);

    const loadListing = async () => {
        setLoading(true);
        try {
            // 1️⃣ Try to find locally (in case it's still a draft)
            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            const draftListings: MarketplaceListing[] = storedListings
                ? JSON.parse(storedListings)
                : [];

            let foundListing = draftListings.find((l) => l.id === listingId);

            // 2️⃣ Otherwise, check backend listings
            if (!foundListing && properties?.length) {
                const backendListing = properties.find((p) => `backend_${p.id}` === listingId);
                if (backendListing) {
                    foundListing = mapBackendToFrontend(backendListing);
                }
            }

            if (foundListing) {
               setListing(foundListing);
            } else {
                console.warn('Listing not found:', listingId);
            }
        } catch (error) {
            console.error('Error loading listing:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = async () => {
        setShowBasicInfoModal(false);
        setShowImagesModal(false);
        setShowCoordinatesModal(false);
        setShowFeaturesModal(false);
        await loadListing();
    };



    if (loading) {
        return (
            <View style={[styles.container, isDark && styles.containerDark, styles.centerContent]}>
                <ActivityIndicator size="large" color="#358B8B" />
            </View>
        );
    }

    if (!listing) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
                    Listing not found
                </Text>
            </View>
        );
    }

    const steps = [
        {
            id: 1,
            title: 'Basic Information',
            description: 'Edit property name, type, price, and details',
            icon: 'document-text',
            onPress: () => setShowBasicInfoModal(true),
        },
        {
            id: 2,
            title: 'Property Images',
            description: 'Upload or remove property images',
            icon: 'images',
            onPress: () => setShowImagesModal(true),
        },
        {
            id: 3,
            title: 'Location Coordinates',
            description: 'Update GPS coordinates of the property',
            icon: 'location',
            onPress: () => setShowCoordinatesModal(true),
        },
        {
            id: 4,
            title: 'Property Features',
            description: 'Update amenities and property features',
            icon: 'checkmark-circle',
            onPress: () => setShowFeaturesModal(true),
        },
    ];

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <LinearGradient
                colors={isDark ? ['#1F2937', '#111827'] : ['#FFFFFF', '#F9FAFB']}
                style={styles.header}
            >
                {listing?.thumbnail_url && (
                    <View style={styles.propertyPreview}>
                        <Image
                            source={{ uri: listing?.thumbnail_url }}
                            style={styles.propertyImage}
                            resizeMode="cover"
                        />
                        <View style={styles.propertyInfo}>
                            <Text style={[styles.propertyName, isDark && styles.propertyNameDark]}>
                                {listing?.property_name}
                            </Text>
                            <Text style={[styles.propertyLocation, isDark && styles.propertyLocationDark]}>
                                {listing?.location}
                            </Text>
                            <Text style={styles.propertyPrice}>
                                {formatCurrency(listing.property_value, listing.currency)}
                            </Text>
                        </View>
                    </View>
                )}
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                    Update any section independently
                </Text>

                {steps.map((step) => (
                    <TouchableOpacity
                        key={step.id}
                        style={[styles.stepCard, isDark && styles.stepCardDark]}
                        onPress={step.onPress}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.stepNumber, isDark && styles.stepNumberDark]}>
                            <Ionicons name={step.icon as any} size={22} color="#fff" />
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={[styles.stepTitle, isDark && styles.stepTitleDark]}>
                                {step.title}
                            </Text>
                            <Text style={[styles.stepDescription, isDark && styles.stepDescriptionDark]}>
                                {step.description}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
                    </TouchableOpacity>
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Independent Modals */}
            <AddMarketplaceListingModal
                visible={showBasicInfoModal}
                listingId={listingId}
                onClose={handleModalClose}
                mode="update"
            />

            <AddListingImagesModal
                visible={showImagesModal}
                listingId={listingId}
                onClose={handleModalClose}
                mode="update"
            />

            <AddListingCoordinatesModal
                visible={showCoordinatesModal}
                listingId={listingId}
                onClose={handleModalClose}
                mode="update"
            />

            <AddFeaturesModal
                visible={showFeaturesModal}
                listingId={listingId}
                onClose={handleModalClose}
                mode="update"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    containerDark: { backgroundColor: '#111827' },
    centerContent: { justifyContent: 'center', alignItems: 'center' },
    header: { padding: 16 },
    propertyPreview: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    propertyImage: { width: 80, height: 80, borderRadius: 12 },
    propertyInfo: { marginLeft: 12, flexShrink: 1 },
    propertyName: { fontSize: 18, fontWeight: '600', color: '#111' },
    propertyNameDark: { color: '#fff' },
    propertyLocation: { fontSize: 14, color: '#6B7280' },
    propertyLocationDark: { color: '#D1D5DB' },
    propertyPrice: { marginTop: 4, color: '#358B8B', fontWeight: '600' },
    content: { flex: 1 },
    contentContainer: { padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16, color: '#111' },
    sectionTitleDark: { color: '#fff' },
    stepCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    stepCardDark: { backgroundColor: '#1F2937' },
    stepNumber: {
        backgroundColor: '#358B8B',
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    stepNumberDark: { backgroundColor: '#4B5563' },
    stepContent: { flex: 1 },
    stepTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
    stepTitleDark: { color: '#fff' },
    stepDescription: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    stepDescriptionDark: { color: '#9CA3AF' },
    errorText: { color: '#111', fontSize: 16 },
    errorTextDark: { color: '#D1D5DB' },
});
