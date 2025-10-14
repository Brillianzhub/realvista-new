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
import PublishListingModal from '@/components/modals/PublishListingModal';

type Step = {
    id: number;
    title: string;
    description: string;
    icon: string;
    completed: boolean;
};

export default function ListingWorkflowScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const listingId = params.id as string;
    const isNew = params.new === 'true';
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [loading, setLoading] = useState(true);
    const [listing, setListing] = useState<MarketplaceListing | null>(null);
    const [steps, setSteps] = useState<Step[]>([]);
    const [hasAutoOpened, setHasAutoOpened] = useState(false);

    const [showBasicInfoModal, setShowBasicInfoModal] = useState(false);
    const [showImagesModal, setShowImagesModal] = useState(false);
    const [showCoordinatesModal, setShowCoordinatesModal] = useState(false);
    const [showFeaturesModal, setShowFeaturesModal] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);

    useEffect(() => {
        loadListing();
    }, [listingId]);

    useEffect(() => {
        if (isNew && listing && !hasAutoOpened && !loading) {
            setHasAutoOpened(true);
            setShowBasicInfoModal(true);
        }
    }, [isNew, listing, hasAutoOpened, loading]);

    const loadListing = async () => {
        setLoading(true);
        try {
            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            if (storedListings) {
                const listings: MarketplaceListing[] = JSON.parse(storedListings);
                const foundListing = listings.find((l) => l.id === listingId);

                if (foundListing) {
                    setListing(foundListing);
                    updateSteps(foundListing);
                }
            }
        } catch (error) {
            console.error('Error loading listing:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSteps = (listing: MarketplaceListing) => {
        const updatedSteps: Step[] = [
            {
                id: 1,
                title: 'Basic Information',
                description: 'Property name, type, location, and price',
                icon: 'document-text',
                completed: !!(listing.property_name && listing.property_type && listing.location),
            },
            {
                id: 2,
                title: 'Upload Images',
                description: 'Add photos of your property',
                icon: 'images',
                completed: !!(listing.images && listing.images.length > 0),
            },
            {
                id: 3,
                title: 'Add Location',
                description: 'GPS coordinates of the property',
                icon: 'location',
                completed: !!(listing.latitude && listing.longitude),
            },
            {
                id: 4,
                title: 'Property Features',
                description: 'Utilities, amenities, and features',
                icon: 'checkmark-circle',
                completed: !!listing.features,
            },
            {
                id: 5,
                title: 'Review & Publish',
                description: 'Review details and publish listing',
                icon: 'cloud-upload',
                completed: listing.status === 'Published',
            },
        ];
        setSteps(updatedSteps);
    };

    const handleStepPress = (stepId: number) => {
        switch (stepId) {
            case 1:
                setShowBasicInfoModal(true);
                break;
            case 2:
                setShowImagesModal(true);
                break;
            case 3:
                setShowCoordinatesModal(true);
                break;
            case 4:
                setShowFeaturesModal(true);
                break;
            case 5:
                setShowPublishModal(true);
                break;
        }
    };

    const handleModalClose = () => {
        setShowBasicInfoModal(false);
        setShowImagesModal(false);
        setShowCoordinatesModal(false);
        setShowFeaturesModal(false);
        setShowPublishModal(false);
        loadListing();
    };

    const formatCurrency = (value: number) => {
        return `₦${value.toLocaleString()}`;
    };

    if (loading) {
        return (
            <View style={[styles.container, isDark && styles.containerDark, styles.centerContent]}>
                <ActivityIndicator size="large" color="#FB902E" />
            </View>
        );
    }

    if (!listing) {
        return (
            <View style={[styles.container, isDark && styles.containerDark, styles.centerContent]}>
                <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
                    Listing not found
                </Text>
            </View>
        );
    }

    const completedSteps = steps.filter((s) => s.completed).length;
    const progressPercentage = (completedSteps / steps.length) * 100;

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <LinearGradient
                colors={isDark ? ['#1F2937', '#111827'] : ['#FFFFFF', '#F9FAFB']}
                style={styles.header}
            >
                {/* <View style={styles.headerTop}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={isDark ? '#F9FAFB' : '#111827'}
                        />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
                        Listing Workflow
                    </Text>
                    <View style={{ width: 40 }} />
                </View> */}

                {listing.thumbnail_url && (
                    <View style={styles.propertyPreview}>
                        <Image
                            source={{ uri: listing.thumbnail_url }}
                            style={styles.propertyImage}
                            resizeMode="cover"
                        />
                        <View style={styles.propertyInfo}>
                            <Text style={[styles.propertyName, isDark && styles.propertyNameDark]}>
                                {listing.property_name}
                            </Text>
                            <Text style={[styles.propertyLocation, isDark && styles.propertyLocationDark]}>
                                {listing.location}
                            </Text>
                            <Text style={styles.propertyPrice}>
                                {formatCurrency(listing.property_value)}
                            </Text>
                        </View>
                    </View>
                )}

                <View style={[styles.progressCard, isDark && styles.progressCardDark]}>
                    <View style={styles.progressHeader}>
                        <Text style={[styles.progressTitle, isDark && styles.progressTitleDark]}>
                            Overall Progress
                        </Text>
                        <View style={[styles.progressBadge, { backgroundColor: progressPercentage === 100 ? '#358B8B' : '#FB902E' }]}>
                            <Text style={styles.progressBadgeText}>
                                {completedSteps}/{steps.length}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${progressPercentage}%` },
                            ]}
                        />
                    </View>
                    <Text style={[styles.progressSubtext, isDark && styles.progressSubtextDark]}>
                        {progressPercentage === 100
                            ? 'All steps completed!'
                            : `${steps.length - completedSteps} step${steps.length - completedSteps !== 1 ? 's' : ''} remaining`}
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                    Complete the following steps
                </Text>

                {steps.map((step, index) => (
                    <TouchableOpacity
                        key={step.id}
                        style={[
                            styles.stepCard,
                            isDark && styles.stepCardDark,
                            step.completed && styles.stepCardCompleted,
                        ]}
                        onPress={() => handleStepPress(step.id)}
                        activeOpacity={0.7}
                    >
                        <View
                            style={[
                                styles.stepNumber,
                                step.completed && styles.stepNumberCompleted,
                                isDark && !step.completed && styles.stepNumberDark,
                            ]}
                        >
                            {step.completed ? (
                                <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                            ) : (
                                <Text style={[styles.stepNumberText, isDark && styles.stepNumberTextDark]}>
                                    {step.id}
                                </Text>
                            )}
                        </View>

                        <View style={styles.stepContent}>
                            <View style={styles.stepHeader}>
                                <Text style={[styles.stepTitle, isDark && styles.stepTitleDark]}>
                                    {step.title}
                                </Text>
                                {step.completed && (
                                    <View style={styles.completedBadge}>
                                        <Text style={styles.completedBadgeText}>Completed</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={[styles.stepDescription, isDark && styles.stepDescriptionDark]}>
                                {step.description}
                            </Text>
                        </View>

                        <Ionicons
                            name={step.completed ? 'checkmark-circle' : 'chevron-forward'}
                            size={24}
                            color={step.completed ? '#358B8B' : isDark ? '#6B7280' : '#9CA3AF'}
                        />
                    </TouchableOpacity>
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>

            <AddMarketplaceListingModal
                visible={showBasicInfoModal}
                listingId={listingId}
                onClose={handleModalClose}
            />

            <AddListingImagesModal
                visible={showImagesModal}
                listingId={listingId}
                onClose={handleModalClose}
            />

            <AddListingCoordinatesModal
                visible={showCoordinatesModal}
                listingId={listingId}
                onClose={handleModalClose}
            />

            <AddFeaturesModal
                visible={showFeaturesModal}
                listingId={listingId}
                onClose={handleModalClose}
            />

            <PublishListingModal
                visible={showPublishModal}
                listingId={listingId}
                onClose={handleModalClose}
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
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 20,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    headerTitleDark: {
        color: '#F9FAFB',
    },
    propertyPreview: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    propertyImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#E5E7EB',
    },
    propertyInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    propertyName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    propertyNameDark: {
        color: '#F9FAFB',
    },
    propertyLocation: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    propertyLocationDark: {
        color: '#9CA3AF',
    },
    propertyPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FB902E',
    },
    progressCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    progressCardDark: {
        backgroundColor: 'rgba(31, 41, 55, 0.8)',
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    progressTitleDark: {
        color: '#E5E7EB',
    },
    progressBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    progressBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FB902E',
        borderRadius: 4,
    },
    progressSubtext: {
        fontSize: 12,
        color: '#6B7280',
    },
    progressSubtextDark: {
        color: '#9CA3AF',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    sectionTitleDark: {
        color: '#F9FAFB',
    },
    stepCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    stepCardDark: {
        backgroundColor: '#1F2937',
    },
    stepCardCompleted: {
        borderWidth: 2,
        borderColor: '#358B8B',
    },
    stepNumber: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberDark: {
        backgroundColor: '#374151',
    },
    stepNumberCompleted: {
        backgroundColor: '#358B8B',
    },
    stepNumberText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#6B7280',
    },
    stepNumberTextDark: {
        color: '#9CA3AF',
    },
    stepContent: {
        flex: 1,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
    },
    stepTitleDark: {
        color: '#F9FAFB',
    },
    completedBadge: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    completedBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#358B8B',
    },
    stepDescription: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
    },
    stepDescriptionDark: {
        color: '#9CA3AF',
    },
    errorText: {
        fontSize: 16,
        color: '#6B7280',
    },
    errorTextDark: {
        color: '#9CA3AF',
    },
});