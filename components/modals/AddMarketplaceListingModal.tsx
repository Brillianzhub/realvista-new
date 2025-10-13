import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    useColorScheme,
    Alert,
    ActivityIndicator,
    Text,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type MarketplaceListing } from '@/data/marketplaceListings';
import ListingForm from '@/components/forms/ListingForm';

type AddMarketplaceListingModalProps = {
    visible: boolean;
    listingId?: string | null;
    onClose: () => void;
    onSuccess?: (listingId: string) => void;
};

export default function AddMarketplaceListingModal({
    visible,
    listingId,
    onClose,
    onSuccess,
}: AddMarketplaceListingModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);

    useEffect(() => {
        if (visible && listingId) {
            loadListing();
        } else if (visible && !listingId) {
            setInitialData(null);
        }
    }, [visible, listingId]);

    const loadListing = async () => {
        if (!listingId) return;

        setLoading(true);
        try {
            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            if (storedListings) {
                const listings: MarketplaceListing[] = JSON.parse(storedListings);
                const listing = listings.find((l) => l.id === listingId);

                if (listing) {
                    setInitialData(listing);
                }
            }
        } catch (error) {
            console.error('Error loading listing:', error);
            Alert.alert('Error', 'Failed to load listing');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData: any) => {
        setLoading(true);
        try {
            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            let listings: MarketplaceListing[] = storedListings
                ? JSON.parse(storedListings)
                : [];

            const listingData = {
                ...formData,
                property_name: formData.title,
                location: `${formData.city}, ${formData.state}`,
                updated_at: new Date().toISOString(),
            };

            if (listingId) {
                const index = listings.findIndex((l) => l.id === listingId);
                if (index !== -1) {
                    listings[index] = {
                        ...listings[index],
                        ...listingData,
                        current_step: Math.max(listings[index].current_step, 1),
                        completion_percentage: calculateCompletionPercentage({
                            ...listings[index],
                            ...listingData,
                        }),
                    };
                    Alert.alert('Success', 'Listing updated successfully');
                }
                await AsyncStorage.setItem('marketplaceListings', JSON.stringify(listings));
                onClose();
            } else {
                const newListingId = Date.now().toString();
                const newListing: MarketplaceListing = {
                    id: newListingId,
                    user_id: 'user-1',
                    created_at: new Date().toISOString(),
                    current_step: 1,
                    status: 'Draft',
                    completion_percentage: calculateCompletionPercentage(listingData),
                    ...listingData,
                } as any;
                listings.push(newListing);
                await AsyncStorage.setItem('marketplaceListings', JSON.stringify(listings));

                onClose();

                if (onSuccess) {
                    onSuccess(newListingId);
                }
            }
        } catch (error: any) {
            console.error('Error saving listing:', error);
            Alert.alert('Error', error.message || 'Failed to save listing');
        } finally {
            setLoading(false);
        }
    };

    const calculateCompletionPercentage = (data: any) => {
        const steps = {
            basicInfo: !!(data.title && data.property_type && data.address && data.city && data.state),
            images: !!(data.images && data.images.length > 0),
            location: !!(data.latitude && data.longitude),
            features: !!data.features,
            published: data.status === 'Published',
        };

        const completedSteps = Object.values(steps).filter(Boolean).length;
        return Math.round((completedSteps / 5) * 100);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle='formSheet'
            // transparent={true}
            // presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, isDark && styles.containerDark]}>
                <View style={[styles.header, isDark && styles.headerDark]}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeButton}
                    >
                        <Ionicons
                            name="close"
                            size={28}
                            color={isDark ? '#F9FAFB' : '#111827'}
                        />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
                        {listingId ? 'Update Listing' : 'Create Listing'}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                {loading && !initialData ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FB902E" />
                    </View>
                ) : (
                    <ListingForm
                        initialData={initialData}
                        onSubmit={handleSubmit}
                    />
                )}
            </View>
        </Modal>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerDark: {
        backgroundColor: '#1F2937',
        borderBottomColor: '#374151',
    },
    closeButton: {
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
