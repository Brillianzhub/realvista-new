import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { formatCurrency } from '@/utils/general/formatCurrency';


interface PropertySearchResult {
    id: number;
    title: string;
    city: string;
    state: string;
    short_description: string;
    price: string;
    currency: string;
    property_type: string;
    category: string;
    listing_purpose: string;
    preview_images: Array<{ image: string }>;

}

interface PropertySearchCardProps {
    property: PropertySearchResult;
}

export default function PropertySearchCard({ property }: PropertySearchCardProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const getCategoryColor = (category: string) => {
        return category === 'Corporate' ? '#3B82F6' : '#8B5CF6';
    };

    const getListingPurposeBadge = (purpose: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            sale: { bg: '#DBEAFE', text: '#1E40AF' },
            rent: { bg: '#D1FAE5', text: '#065F46' },
            lease: { bg: '#FEF3C7', text: '#92400E' },
        };

        return colors[purpose.toLowerCase()] || { bg: '#F3F4F6', text: '#374151' };
    };

    const handlePropertyPress = (id: number) => {
        router.push({
            pathname: "/market/marketdetails",
            params: { selectedItemId: id },
        });
    };

    const previewImage: string | null =
        property.preview_images && property.preview_images.length > 0
            ? property.preview_images[0].image
            : null;


    const purposeColors = getListingPurposeBadge(property.listing_purpose);

    return (
        <TouchableOpacity
            style={[styles.card, isDark && styles.cardDark]}
            activeOpacity={0.7}
            onPress={() => handlePropertyPress(property.id)}
        >
            <View style={styles.imageContainer}>
                {previewImage ? (
                    <Image
                        source={{ uri: previewImage }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.placeholderImage, isDark && styles.placeholderImageDark]}>
                        <Ionicons
                            name="image-outline"
                            size={48}
                            color={isDark ? '#4B5563' : '#D1D5DB'}
                        />
                    </View>
                )}

                <View style={styles.badges}>
                    <View
                        style={[
                            styles.categoryBadge,
                            { backgroundColor: getCategoryColor(property.category) },
                        ]}
                    >
                        <Text style={styles.badgeText}>{property.category}</Text>
                    </View>

                    <View
                        style={[
                            styles.purposeBadge,
                            { backgroundColor: purposeColors.bg },
                        ]}
                    >
                        <Text style={[styles.purposeBadgeText, { color: purposeColors.text }]}>
                            {property.listing_purpose.charAt(0).toUpperCase() +
                                property.listing_purpose.slice(1)}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, isDark && styles.titleDark]} numberOfLines={1}>
                    {property.title}
                </Text>

                {property.short_description && (
                    <Text
                        style={[styles.description, isDark && styles.descriptionDark]}
                        numberOfLines={2}
                    >
                        {property.short_description}
                    </Text>
                )}

                <View style={styles.detailsRow}>
                    <View style={styles.detail}>
                        <Ionicons
                            name="location"
                            size={16}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                        <Text style={[styles.detailText, isDark && styles.detailTextDark]} numberOfLines={1}>
                            {property.city}, {property.state}
                        </Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.price, isDark && styles.priceDark]}>
                            {formatCurrency(Number(property.price), property.currency)}
                        </Text>
                    </View>

                    <View
                        style={[styles.propertyTypeBadge, isDark && styles.propertyTypeBadgeDark]}
                    >
                        <Ionicons
                            name={
                                property.property_type.toLowerCase() === 'land'
                                    ? 'map-outline'
                                    : property.property_type.toLowerCase() === 'house'
                                        ? 'home-outline'
                                        : 'business-outline'
                            }
                            size={14}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                        <Text style={[styles.propertyTypeText, isDark && styles.propertyTypeTextDark]}>
                            {property.property_type}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardDark: {
        backgroundColor: '#1F2937',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 200,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderImageDark: {
        backgroundColor: '#374151',
    },
    badges: {
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    purposeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    purposeBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    titleDark: {
        color: '#F9FAFB',
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 12,
    },
    descriptionDark: {
        color: '#9CA3AF',
    },
    detailsRow: {
        marginBottom: 12,
    },
    detail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        flex: 1,
        fontSize: 14,
        color: '#6B7280',
    },
    detailTextDark: {
        color: '#9CA3AF',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    priceContainer: {
        flex: 1,
    },
    price: {
        fontSize: 20,
        fontWeight: '700',
        color: '#358B8B',
    },
    priceDark: {
        color: '#6EE7B7',
    },
    propertyTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    propertyTypeBadgeDark: {
        backgroundColor: '#111827',
    },
    propertyTypeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    propertyTypeTextDark: {
        color: '#9CA3AF',
    },
});
