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
    Image,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type MarketplaceListing } from '@/data/marketplaceListings';
import { submitListingToServer } from '@/hooks/market/submitListingToServer';

type PublishListingModalProps = {
    visible: boolean;
    listingId: string | null;
    onClose: () => void;
};

export default function PublishListingModal({
    visible,
    listingId,
    onClose,
}: PublishListingModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [loading, setLoading] = useState(false);
    const [listing, setListing] = useState<MarketplaceListing | null>(null);

    // console.log('Listing in PublishListingModal:', listing);

    useEffect(() => {
        if (visible && listingId) {
            loadListing();
        }
    }, [visible, listingId]);

    const loadListing = async () => {
        if (!listingId) return;

        try {
            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            if (storedListings) {
                const listings: MarketplaceListing[] = JSON.parse(storedListings);
                const foundListing = listings.find((l) => l.id === listingId);
                setListing(foundListing || null);
            }
        } catch (error) {
            console.error('Error loading listing:', error);
        }
    };

    const formatCurrency = (value: number) => {
        return `₦${value.toLocaleString()}`;
    };

    const handlePublish = async () => {
        if (!listingId || !listing) return;

        if (listing.completion_percentage < 80) {
            Alert.alert(
                "Incomplete Listing",
                "Please complete at least 80% of the listing before publishing.",
                [{ text: "OK" }]
            );
            return;
        }

        setLoading(true);
        try {
            const storedListings = await AsyncStorage.getItem("marketplaceListings");
            if (!storedListings) {
                Alert.alert("Error", "Listing not found");
                return;
            }

            const listings: MarketplaceListing[] = JSON.parse(storedListings);
            const index = listings.findIndex((l) => l.id === listingId);

            if (index === -1) {
                Alert.alert("Error", "Listing not found");
                return;
            }

            // ✅ Get auth token (you can adjust based on your auth logic)
            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                Alert.alert("Authentication Error", "Please log in again to publish your listing.");
                return;
            }

            // 🚀 Send data to the backend
            const propertyId = await submitListingToServer(listingId, token);

            // ✅ Update AsyncStorage after successful upload
            listings[index] = {
                ...listings[index],
                status: "Published",
                current_step: 5,
                completion_percentage: 100,
                published_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                property_id: propertyId, // store backend property ID
            };

            await AsyncStorage.setItem("marketplaceListings", JSON.stringify(listings));

            Alert.alert("✅ Success", "Listing published successfully!", [
                { text: "OK", onPress: onClose },
            ]);
        } catch (error: any) {
            console.error("❌ Error publishing listing:", error);
            Alert.alert(
                "Error",
                error.response?.data?.detail || error.message || "Failed to publish listing."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!listing) {
        return (
            <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
                <View style={styles.overlay}>
                    <View style={[styles.container, isDark && styles.containerDark]}>
                        <ActivityIndicator size="large" color="#FB902E" style={{ margin: 40 }} />
                    </View>
                </View>
            </Modal>
        );
    }

    const isComplete = listing.completion_percentage >= 80;

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.container, isDark && styles.containerDark]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, isDark && styles.titleDark]}>Review & Publish</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={isDark ? '#F9FAFB' : '#111827'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={[styles.completionCard, isDark && styles.completionCardDark]}>
                            <View style={styles.completionHeader}>
                                <Text style={[styles.completionTitle, isDark && styles.completionTitleDark]}>
                                    Listing Completion
                                </Text>
                                <View
                                    style={[
                                        styles.completionBadge,
                                        { backgroundColor: isComplete ? '#10B981' : '#F59E0B' },
                                    ]}
                                >
                                    <Text style={styles.completionBadgeText}>
                                        {listing.completion_percentage}%
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${listing.completion_percentage}%` },
                                    ]}
                                />
                            </View>
                            {!isComplete && (
                                <Text style={[styles.warningText, isDark && styles.warningTextDark]}>
                                    Complete at least 80% to publish this listing
                                </Text>
                            )}
                        </View>

                        {listing.thumbnail_url && (
                            <View style={styles.imagePreview}>
                                <Image
                                    source={{ uri: listing.thumbnail_url }}
                                    style={styles.previewImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.imageBadge}>
                                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                                </View>
                            </View>
                        )}

                        <View style={[styles.section, isDark && styles.sectionDark]}>
                            <View style={styles.row}>
                                <Ionicons
                                    name="home"
                                    size={20}
                                    color={isDark ? '#9CA3AF' : '#6B7280'}
                                />
                                <View style={styles.rowContent}>
                                    <Text style={[styles.label, isDark && styles.labelDark]}>Property Name</Text>
                                    <Text style={[styles.value, isDark && styles.valueDark]}>
                                        {listing.property_name}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.row}>
                                <Ionicons
                                    name="business"
                                    size={20}
                                    color={isDark ? '#9CA3AF' : '#6B7280'}
                                />
                                <View style={styles.rowContent}>
                                    <Text style={[styles.label, isDark && styles.labelDark]}>Listing Type</Text>
                                    <View
                                        style={[
                                            styles.typeBadge,
                                            {
                                                backgroundColor:
                                                    listing.listing_type === 'Corporate' ? '#3B82F6' : '#8B5CF6',
                                            },
                                        ]}
                                    >
                                        <Text style={styles.typeBadgeText}>{listing.listing_type}</Text>
                                    </View>
                                </View>
                            </View>

                            {listing.location && (
                                <View style={styles.row}>
                                    <Ionicons
                                        name="location"
                                        size={20}
                                        color={isDark ? '#9CA3AF' : '#6B7280'}
                                    />
                                    <View style={styles.rowContent}>
                                        <Text style={[styles.label, isDark && styles.labelDark]}>Location</Text>
                                        <Text style={[styles.value, isDark && styles.valueDark]}>
                                            {listing.location}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            <View style={styles.row}>
                                <Ionicons
                                    name="cash"
                                    size={20}
                                    color={isDark ? '#9CA3AF' : '#6B7280'}
                                />
                                <View style={styles.rowContent}>
                                    <Text style={[styles.label, isDark && styles.labelDark]}>
                                        Property Value
                                    </Text>
                                    <Text style={[styles.value, styles.valuePrice]}>
                                        {formatCurrency(listing.property_value)}
                                    </Text>
                                </View>
                            </View>

                            {listing.market_type && (
                                <View style={styles.row}>
                                    <Ionicons
                                        name="pricetag"
                                        size={20}
                                        color={isDark ? '#9CA3AF' : '#6B7280'}
                                    />
                                    <View style={styles.rowContent}>
                                        <Text style={[styles.label, isDark && styles.labelDark]}>Market Type</Text>
                                        <Text style={[styles.value, isDark && styles.valueDark]}>
                                            For {listing.market_type}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* {listing.features && (
                            <View style={[styles.section, isDark && styles.sectionDark]}>
                                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                                    Property Features
                                </Text>
                                <View style={styles.featuresList}>
                                    {listing.features.electricity_proximity && (
                                        <View style={styles.featureItem}>
                                            <Ionicons name="flash" size={16} color="#10B981" />
                                            <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
                                                Electricity
                                            </Text>
                                        </View>
                                    )}
                                    {listing.features.hasWaterSupply && (
                                        <View style={styles.featureItem}>
                                            <Ionicons name="water" size={16} color="#10B981" />
                                            <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
                                                Water Supply
                                            </Text>
                                        </View>
                                    )}
                                    {listing.features.hasGarden && (
                                        <View style={styles.featureItem}>
                                            <Ionicons name="leaf" size={16} color="#10B981" />
                                            <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
                                                Garden
                                            </Text>
                                        </View>
                                    )}
                                    {listing.features.hasSecurity && (
                                        <View style={styles.featureItem}>
                                            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                                            <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
                                                Security
                                            </Text>
                                        </View>
                                    )}
                                    {listing.features.hasParking && (
                                        <View style={styles.featureItem}>
                                            <Ionicons name="car" size={16} color="#10B981" />
                                            <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
                                                Parking
                                            </Text>
                                        </View>
                                    )}
                                    {listing.features.isFenced && (
                                        <View style={styles.featureItem}>
                                            <Ionicons name="grid" size={16} color="#10B981" />
                                            <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
                                                Fenced
                                            </Text>
                                        </View>
                                    )}
                                    {listing.features.proximityToRoad && (
                                        <View style={styles.featureItem}>
                                            <Ionicons name="car-sport" size={16} color="#10B981" />
                                            <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
                                                Road Access: {listing.features.proximityToRoad}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {listing.features.nearbyAmenities && listing.features.nearbyAmenities.length > 0 && (
                                    <>
                                        <Text style={[styles.subsectionTitle, isDark && styles.subsectionTitleDark]}>
                                            Nearby Amenities
                                        </Text>
                                        <View style={styles.amenitiesList}>
                                            {listing.features.nearbyAmenities.map((amenity, index) => (
                                                <View
                                                    key={index}
                                                    style={[styles.amenityChip, isDark && styles.amenityChipDark]}
                                                >
                                                    <Text
                                                        style={[styles.amenityChipText, isDark && styles.amenityChipTextDark]}
                                                    >
                                                        {amenity}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </>
                                )}
                            </View>
                        )} */}

                        {(listing.latitude && listing.longitude) && (
                            <View style={[styles.section, isDark && styles.sectionDark]}>
                                <View style={styles.row}>
                                    <Ionicons
                                        name="navigate"
                                        size={20}
                                        color={isDark ? '#9CA3AF' : '#6B7280'}
                                    />
                                    <View style={styles.rowContent}>
                                        <Text style={[styles.label, isDark && styles.labelDark]}>Coordinates</Text>
                                        <Text style={[styles.value, isDark && styles.valueDark]}>
                                            {listing.latitude.toFixed(4)}, {listing.longitude.toFixed(4)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        <View style={{ height: 100 }} />
                    </ScrollView>

                    <View style={[styles.footer, isDark && styles.footerDark]}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Back</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.publishButton, !isComplete && styles.buttonDisabled]}
                            onPress={handlePublish}
                            disabled={loading || !isComplete}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
                                    <Text style={styles.publishButtonText}>Publish Listing</Text>
                                </>
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
    completionCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    completionCardDark: {
        backgroundColor: '#374151',
    },
    completionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    completionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    completionTitleDark: {
        color: '#E5E7EB',
    },
    completionBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    completionBadgeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FB902E',
        borderRadius: 4,
    },
    warningText: {
        fontSize: 12,
        color: '#DC2626',
        marginTop: 8,
    },
    warningTextDark: {
        color: '#FCA5A5',
    },
    imagePreview: {
        position: 'relative',
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    imageBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 4,
    },
    section: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionDark: {
        backgroundColor: '#374151',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    sectionTitleDark: {
        color: '#F9FAFB',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: 12,
    },
    rowContent: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    labelDark: {
        color: '#9CA3AF',
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    valueDark: {
        color: '#F9FAFB',
    },
    valuePrice: {
        color: '#FB902E',
        fontSize: 18,
    },
    typeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    featuresList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    featureText: {
        fontSize: 14,
        color: '#374151',
    },
    featureTextDark: {
        color: '#E5E7EB',
    },
    subsectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginTop: 12,
        marginBottom: 8,
    },
    subsectionTitleDark: {
        color: '#E5E7EB',
    },
    amenitiesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    amenityChip: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    amenityChipDark: {
        backgroundColor: '#4B5563',
    },
    amenityChipText: {
        fontSize: 12,
        color: '#4F46E5',
        fontWeight: '500',
    },
    amenityChipTextDark: {
        color: '#A5B4FC',
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
        flexDirection: 'row',
        gap: 8,
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    publishButton: {
        backgroundColor: '#10B981',
    },
    publishButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    buttonDisabled: {
        backgroundColor: '#9CA3AF',
        opacity: 0.5,
    },
});
