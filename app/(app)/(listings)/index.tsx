import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ProgressTracker from '@/components/marketplace/ProgressTracker';
import ListingPerformanceModal from '@/components/modals/ListingPerformanceModal';
import ListingCard from '@/components/marketplace/ListingCard';
import { type MarketplaceListing } from '@/data/marketplaceListings';
import RemoveListingModal from '@/components/modals/RemoveListingModal';
import useFetchVendorProperties from '@/hooks/market/useVendorListing';
import { useGlobalContext } from '@/context/GlobalProvider';
import { mapBackendToFrontend, isBackendListing } from '@/utils/market/marketplaceMapper';


type ListingType = 'All' | 'Corporate' | 'P2P';
type StatusFilter = 'All' | 'Draft' | 'Published';

const listingSteps = [
    { id: 1, label: 'Add Property', completed: false },
    { id: 2, label: 'Upload Images', completed: false },
    { id: 3, label: 'Add Coordinates', completed: false },
    { id: 4, label: 'Market Features', completed: false },
    { id: 5, label: 'Review & Publish', completed: false },
];

export default function ManageListings() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const { user } = useGlobalContext();

    const { properties, loading: backendLoading, refetch } = useFetchVendorProperties(user?.email || null);

    const [listings, setListings] = useState<MarketplaceListing[]>([]);
    const [filteredListings, setFilteredListings] = useState<MarketplaceListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedListingType, setSelectedListingType] = useState<ListingType>('All');
    const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('All');

    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
    const [showPerformanceModal, setShowPerformanceModal] = useState(false);
    const [performanceData, setPerformanceData] = useState<{
        propertyName: string;
        dateListed: string;
        totalViews: number;
        totalEnquiries: number;
        totalBookmarks: number;
    } | null>(null);

    useEffect(() => {
        loadListings();
    }, [properties]);

    useEffect(() => {
        filterListings();
    }, [searchQuery, selectedListingType, selectedStatus, listings]);

    const loadListings = async () => {
        try {
            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            let draftListings: MarketplaceListing[] = storedListings ? JSON.parse(storedListings) : [];

            const backendListings = properties ? properties.map(mapBackendToFrontend) : [];

            const combinedListings = [...draftListings, ...backendListings];

            setListings(combinedListings);
        } catch (error) {
            console.error('Error loading listings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filterListings = () => {
        let filtered = listings;

        if (selectedListingType !== 'All') {
            filtered = filtered.filter((item) => item.listing_type === selectedListingType);
        }

        if (selectedStatus !== 'All') {
            filtered = filtered.filter((item) => item.status === selectedStatus);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.property_name.toLowerCase().includes(query) ||
                    item.location?.toLowerCase().includes(query)
            );
        }

        setFilteredListings(filtered);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        await loadListings();
    };

    const handleAddProperty = async () => {
        try {
            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            let listings: MarketplaceListing[] = storedListings
                ? JSON.parse(storedListings)
                : [];

            const newListingId = Date.now().toString();
            const newListing: MarketplaceListing = {
                id: newListingId,
                user_id: user?.email || 'user-1',
                listing_type: 'Corporate',
                property_name: '',
                property_type: '',
                location: '',
                city: '',
                state: '',
                description: '',
                property_value: 0,
                roi_percentage: 0,
                estimated_yield: 0,
                completion_percentage: 0,
                current_step: 0,
                status: 'Draft',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            listings.push(newListing);
            await AsyncStorage.setItem('marketplaceListings', JSON.stringify(listings));

            router.push({
                pathname: '/(app)/(listings)/listing-workflow',
                params: { id: newListingId, new: 'true' },
            });
        } catch (error) {
            console.error('Error creating listing:', error);
            Alert.alert('Error', 'Failed to create listing');
        }
    };

    const handleUpdateListing = (listingId: string) => {
        router.push({
            pathname: '/(app)/(listings)/listing-workflow',
            params: { id: listingId },
        });
    };

    const handleRemoveListing = (listingId: string) => {
        setSelectedListingId(listingId);
        setShowRemoveModal(true);
    };

    const handleViewPerformance = (listing: MarketplaceListing) => {
        const backendListing = properties?.find(p => String(p.id) === listing.id);

        if (backendListing) {
            setPerformanceData({
                propertyName: backendListing.title || listing.property_name,
                dateListed: backendListing.listed_date || listing.created_at,
                totalViews: backendListing.views || 0,
                totalEnquiries: backendListing.inquiries || 0,
                totalBookmarks: backendListing.bookmarked || 0,
            });
        } else {
            setPerformanceData({
                propertyName: listing.property_name,
                dateListed: listing.created_at,
                totalViews: 0,
                totalEnquiries: 0,
                totalBookmarks: 0,
            });
        }
        setShowPerformanceModal(true);
    };

    const calculateSteps = (listing: MarketplaceListing) => {
        const steps = [...listingSteps];
        steps[0].completed = !!listing.property_name;
        steps[1].completed = !!listing.thumbnail_url || !!(listing.images && listing.images.length > 0);
        steps[2].completed = !!listing.latitude && !!listing.longitude;
        steps[3].completed = !!listing.features;
        steps[4].completed = listing.status === 'Published';
        return steps;
    };

    const selectedListing = listings.find((l) => l.id === selectedListingId);
    const currentSteps = selectedListing ? calculateSteps(selectedListing) : listingSteps;

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons
                name="briefcase-outline"
                size={64}
                color={isDark ? '#4B5563' : '#D1D5DB'}
            />
            <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
                No listings yet
            </Text>
            <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
                Start by creating your first property listing
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddProperty}>
                <Text style={styles.emptyStateButtonText}>Create Listing</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <LinearGradient
                colors={['#efa968', '#358B8B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Marketplace Listings</Text>
                    <View style={{ width: 24 }} />
                </View>

                <Text style={styles.headerSubtitle}>
                    Manage your corporate and P2P property listings
                </Text>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FB902E"
                        colors={['#FB902E']}
                    />
                }
            >
                {/* {selectedListingId && selectedListing && (
                    <ProgressTracker
                        steps={currentSteps}
                        currentStep={currentSteps.findIndex((s) => !s.completed)}
                        completionPercentage={selectedListing.completion_percentage}
                    />
                )} */}

                <View style={styles.filters}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterList}
                    >
                        {(['All', 'Corporate', 'P2P'] as ListingType[]).map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.filterPill,
                                    selectedListingType === type && styles.filterPillActive,
                                    isDark && selectedListingType !== type && styles.filterPillDark,
                                ]}
                                onPress={() => setSelectedListingType(type)}
                            >
                                <Text
                                    style={[
                                        styles.filterPillText,
                                        selectedListingType === type && styles.filterPillTextActive,
                                        isDark && selectedListingType !== type && styles.filterPillTextDark,
                                    ]}
                                >
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterList}
                    >
                        {(['All', 'Draft', 'Published'] as StatusFilter[]).map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.filterPill,
                                    selectedStatus === status && styles.filterPillActive,
                                    isDark && selectedStatus !== status && styles.filterPillDark,
                                ]}
                                onPress={() => setSelectedStatus(status)}
                            >
                                <Text
                                    style={[
                                        styles.filterPillText,
                                        selectedStatus === status && styles.filterPillTextActive,
                                        isDark && selectedStatus !== status && styles.filterPillTextDark,
                                    ]}
                                >
                                    {status}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.listingsContainer}>
                    {loading || backendLoading ? (
                        <ActivityIndicator size="large" color="#FB902E" style={{ marginTop: 40 }} />
                    ) : filteredListings.length === 0 ? (
                        renderEmptyState()
                    ) : (
                        filteredListings.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                id={listing.id}
                                thumbnailUrl={listing.thumbnail_url}
                                propertyName={listing.property_name}
                                listingType={listing.listing_type}
                                status={listing.status}
                                completionPercentage={listing.completion_percentage}
                                location={listing.location}
                                propertyValue={listing.property_value}
                                onUpdate={() => handleUpdateListing(listing.id)}
                                onRemove={() => handleRemoveListing(listing.id)}
                                onPress={() => handleUpdateListing(listing.id)}
                                onViewPerformance={
                                    listing.status === 'Published'
                                        ? () => handleViewPerformance(listing)
                                        : undefined
                                }
                            />
                        ))
                    )}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={handleAddProperty}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <RemoveListingModal
                visible={showRemoveModal}
                listingId={selectedListingId}
                onClose={() => {
                    setShowRemoveModal(false);
                    setSelectedListingId(null);
                    loadListings();
                }}
            />

            <ListingPerformanceModal
                visible={showPerformanceModal}
                performanceData={performanceData}
                onClose={() => {
                    setShowPerformanceModal(false);
                    setPerformanceData(null);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    containerDark: {
        backgroundColor: '#111827',
    },
    header: {
        paddingTop: 35,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 4,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 16,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchContainerDark: {
        backgroundColor: '#1F2937',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    searchInputDark: {
        color: '#F9FAFB',
    },
    filters: {
        marginBottom: 16,
        gap: 12,
    },
    filterList: {
        gap: 8,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    filterPillDark: {
        backgroundColor: '#1F2937',
    },
    filterPillActive: {
        backgroundColor: '#358B8B',
    },
    filterPillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterPillTextDark: {
        color: '#9CA3AF',
    },
    filterPillTextActive: {
        color: '#FFFFFF',
    },
    listingsContainer: {
        marginBottom: 80,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateTitleDark: {
        color: '#E5E7EB',
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    emptyStateTextDark: {
        color: '#9CA3AF',
    },
    emptyStateButton: {
        backgroundColor: '#358B8B',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyStateButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#358B8B',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
