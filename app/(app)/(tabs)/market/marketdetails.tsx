import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageCarousel from '@/components/market/ImageCarousel';
import { formatCurrency } from '@/utils/general/formatCurrency';
import FeaturesComponent from '@/components/market/FeaturesComponent';
import DescriptionComponent from '@/components/market/DescriptionComponent';
import ContactComponent from '@/components/market/ContactComponent';
import DetailsComponent from '@/components/market/DetailsComponent';
import { useGlobalContext } from '@/context/GlobalProvider';
import { handleAddBookmark } from '@/utils/market/handleAddBookmarks';
import { MaterialIcons } from "@expo/vector-icons";
import MapViewer from '@/components/market/MapViewer';
import useUserBookmarks from '@/hooks/market/useUserBookmark';
import PaymentPlans from '@/components/market/PaymentPlans';
import { FeatureData } from '@/components/market/FeaturesComponent';

// 🟢 Define types for property
interface Property {
    id: number;
    address: string;
    availability: string;
    availability_date: string | null;
    bathrooms: number;
    bedrooms: number;
    city: string;
    coordinate_url?: string;
    currency: string;
    description: string;
    // features: FeatureData[];
    features: Array<FeatureData & { verified_user?: boolean }>;
    market_coordinates?: { latitude: number; longitude: number }[];
    images?: string[];
    image_files?: Array<{ file?: string; image_url?: string }>;
    videos?: string[];
    documents?: string[];
    listed_date: string;
    listing_purpose: string;
    lot_size: number;
    owner: any; // refine if you know the shape of owner
    price: number;
    property_type: string;
    square_feet: number;
    state: string;
    title: string;
    payment_plans: any[]; // refine if needed
    updated_date: string;
    year_built: number;
    zip_code: string;
}

const MarketListingDetails: React.FC = () => {
    const { selectedItemId } = useLocalSearchParams<{ selectedItemId: string }>();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [isRecordingInquiry, setIsRecordingInquiry] = useState<boolean>(false);
    const { user } = useGlobalContext();
    const { bookmarks, fetchBookmarks } = useUserBookmarks();
    const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const onAddBookmark = async () => {
        if (!property) return;
        try {
            const bookmarkStatus = await handleAddBookmark(property.id);
            setIsBookmarked(bookmarkStatus);
            await fetchBookmarks();
        } catch (error) {
            console.error("Bookmark update failed:", error);
        }
    };

    const fetchProperty = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) throw new Error("Authentication token not found!");

            const response = await axios.get<Property>(
                `https://realvistamanagement.com/market/properties/${selectedItemId}/`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            setProperty(response.data);
            setError(null);
        } catch (error: any) {
            console.error("Error fetching property:", error);
            setError(error.message || "Failed to fetch property.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedItemId]);

    useEffect(() => {
        if (selectedItemId) fetchProperty();
    }, [selectedItemId]);

    useEffect(() => {
        if (bookmarks?.length > 0 && property) {
            setIsBookmarked(bookmarks.some((bookmark) => bookmark.property_id === property.id));
        } else {
            setIsBookmarked(false);
        }
    }, [bookmarks, property]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProperty();
    }, [fetchProperty]);

    if (loading) {
        return (
            <View style={[styles.container, { alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#358B8B" />
                <Text>Loading property details...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!property) {
        return (
            <View style={styles.container}>
                <Text>No property details available.</Text>
            </View>
        );
    }

    const {
        id,
        address,
        availability,
        availability_date,
        bathrooms,
        bedrooms,
        city,
        currency,
        description,
        features,
        market_coordinates,
        image_files,
        listed_date,
        listing_purpose,
        lot_size,
        owner,
        price,
        property_type,
        square_feet,
        state,
        title,
        payment_plans,
        year_built,
    } = property;

    const details = {
        bedrooms,
        bathrooms,
        lot_size,
        square_feet,
        availability,
        availability_date,
        year_built,
    };

    const validImages = Array.isArray(image_files)
        ? image_files
            .map(img => ({ file: img.file ?? img.image_url }))
            .filter((img): img is { file: string } => !!img.file)
        : [];



    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.imageWrapper}>
                <ImageCarousel images={validImages} listed_date={listed_date} />
            </View>

            <Text style={styles.title}>{title}</Text>

            <Text style={styles.subtitle}>
                {address.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())},{' '}
                {state.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())},{' '}
                {city.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
            </Text>

            <View style={styles.bookmarkSection}>
                <View style={styles.textContainer}>
                    <Text style={styles.price}>
                        {formatCurrency(price, currency)}
                    </Text>
                    <Text style={styles.detailText}>
                        {property_type.charAt(0).toUpperCase() + property_type.slice(1)} •{' '}
                        {listing_purpose.charAt(0).toUpperCase() + listing_purpose.slice(1)}
                    </Text>
                </View>

                <TouchableOpacity onPress={onAddBookmark} >
                    <MaterialIcons
                        name={isBookmarked ? "favorite" : "favorite-border"}
                        size={24}
                        color="#FF5A5F"
                    />
                </TouchableOpacity>
            </View>

            {payment_plans?.length > 0 && (
                <View style={[styles.featuresContainer, { marginBottom: 10 }]}>
                    <Text style={styles.sectionTitle}>Payment Plans</Text>
                    <View style={{ flex: 1 }}>
                        <PaymentPlans actual_price={price} currency={currency} />
                    </View>
                </View>
            )}

            <View style={[styles.featuresContainer, { marginBottom: 10 }]}>
                <DetailsComponent {...details} />
            </View>

            <View style={styles.featuresContainer}>
                <Text style={styles.sectionTitle}>Property Info.</Text>
                <DescriptionComponent description={description} />
            </View>

            <View style={styles.featuresContainer}>
                <Text style={styles.sectionTitle}>Features</Text>
                <View style={{ flex: 1, marginBottom: 10 }}>
                    <FeaturesComponent features={features} />
                </View>
            </View>

            <View style={{ marginBottom: 20 }}>
                <Text style={styles.sectionTitle}>Map Location</Text>
                {(() => {
                    const firstCoordinate = market_coordinates?.[0];
                    return firstCoordinate ? (
                        <MapViewer
                            latitude={firstCoordinate.latitude}
                            longitude={firstCoordinate.longitude}
                            title={title}
                        />
                    ) : null;
                })()}
            </View>

            <View style={[styles.ownerContainer, { marginBottom: 20 }]}>
                <Text style={styles.sectionTitle}>Contact Vendor</Text>
                <ContactComponent
                    owner={owner}
                    property={property}
                    user={user!}
                    setIsRecordingInquiry={setIsRecordingInquiry}
                />
            </View>
        </ScrollView>
    );
};

export default MarketListingDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        paddingHorizontal: 16,
    },
    imageWrapper: {
        marginBottom: 20,
        marginTop: 12
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        marginBottom: 8,
    },
    price: {
        fontSize: 22,
        fontWeight: '600',
        color: '#FB902E',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
    },
    featuresContainer: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
    bookmarkSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
    },
    textContainer: {
        flexDirection: "column",
    },
    ownerContainer: {
        marginBottom: 16,
    },
});
