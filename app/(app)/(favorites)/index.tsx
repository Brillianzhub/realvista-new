import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    useColorScheme,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useUserBookmark, { type Bookmark } from '@/hooks/market/useUserBookmark';
import { formatCurrency } from '@/utils/general/formatCurrency';

export default function BookmarksScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { bookmarks, loading, error, refetch } = useUserBookmark();
    const [refreshing, setRefreshing] = useState(false);
    const [removingId, setRemovingId] = useState<number | null>(null);

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleRemoveBookmark = async (bookmarkId: number) => {
        Alert.alert(
            'Remove Bookmark',
            'Are you sure you want to remove this property from your bookmarks?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        setRemovingId(bookmarkId);

                        try {
                            const token = await AsyncStorage.getItem('authToken');

                            if (!token) {
                                Alert.alert('Error', 'Authentication token not found');
                                setRemovingId(null);
                                return;
                            }

                            const response = await fetch(
                                `https://realvistamanagement.com/market/remove-bookmark/${bookmarkId}/`,
                                {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Token ${token}`,
                                        'Content-Type': 'application/json',
                                    },
                                }
                            );

                            if (response.status === 200 || response.status === 204) {
                                Alert.alert('Success', 'Bookmark removed successfully');
                                await refetch();
                            } else {
                                const errorData = await response.json();
                                Alert.alert('Error', errorData.message || 'Failed to remove bookmark');
                            }
                        } catch (err) {
                            Alert.alert('Error', 'An error occurred while removing the bookmark');
                            console.error('Remove bookmark error:', err);
                        } finally {
                            setRemovingId(null);
                        }
                    },
                },
            ]
        );
    };

    const handleCardPress = (propertyId: number) => {
        router.push({
            pathname: '/market/marketdetails',
            params: { selectedItemId: JSON.stringify(propertyId) },
        });
    };

    const getPropertyIcon = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('house') || lowerType.includes('apartment')) {
            return 'home';
        } else if (lowerType.includes('land')) {
            return 'map';
        } else if (lowerType.includes('commercial')) {
            return 'business';
        }
        return 'location';
    };

    const getPurposeColor = (purpose: string) => {
        return purpose.toLowerCase().includes('sale') ? '#10B981' : '#3B82F6';
    };

    const renderBookmarkCard = ({ item }: { item: Bookmark }) => {
        const isRemoving = removingId === item.bookmark_id;
        const thumbnailUrl = item.images && item.images.length > 0 ? item.images[0] : null;

        return (
            <TouchableOpacity
                style={[styles.card, isDark && styles.cardDark]}
                onPress={() => handleCardPress(item.property_id)}
                activeOpacity={0.7}
                disabled={isRemoving}
            >
                <View style={styles.cardContent}>
                    {thumbnailUrl ? (
                        <Image
                            source={{ uri: thumbnailUrl }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                            <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                        </View>
                    )}

                    <View style={styles.details}>
                        <Text
                            style={[styles.title, isDark && styles.titleDark]}
                            numberOfLines={2}
                        >
                            {item.title}
                        </Text>

                        <View style={styles.locationRow}>
                            <Ionicons
                                name="location-outline"
                                size={14}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                            <Text
                                style={[styles.location, isDark && styles.locationDark]}
                                numberOfLines={1}
                            >
                                {item.address}, {item.city}, {item.state}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.typeContainer}>
                                <Ionicons
                                    name={getPropertyIcon(item.property_type) as any}
                                    size={14}
                                    color="#358B8B"
                                />
                                <Text style={[styles.typeText, isDark && styles.typeTextDark]}>
                                    {item.property_type.charAt(0).toUpperCase() + item.property_type.slice(1)}
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.purposeBadge,
                                    { backgroundColor: getPurposeColor(item.listing_purpose) },
                                ]}
                            >
                                <Text style={styles.purposeText}>
                                    For {item.listing_purpose.charAt(0).toUpperCase() + item.listing_purpose.slice(1)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.priceRow}>
                            <Text style={styles.price}>{formatCurrency(item.price, item.currency)}</Text>

                            <TouchableOpacity
                                style={[styles.removeButton, isDark && styles.removeButtonDark]}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleRemoveBookmark(item.bookmark_id);
                                }}
                                disabled={isRemoving}
                            >
                                {isRemoving ? (
                                    <ActivityIndicator size="small" color="#EF4444" />
                                ) : (
                                    <Ionicons name="trash-outline" size={14} color="#EF4444" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="bookmark-outline"
                size={80}
                color={isDark ? '#4B5563' : '#D1D5DB'}
            />
            <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
                No Bookmarks Yet
            </Text>
            <Text style={[styles.emptySubtitle, isDark && styles.emptySubtitleDark]}>
                Start bookmarking properties you're interested in to see them here.
            </Text>
            <TouchableOpacity
                style={styles.reloadButton}
                onPress={handleRefresh}
                activeOpacity={0.8}
            >
                <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                <Text style={styles.reloadButtonText}>Reload</Text>
            </TouchableOpacity>
        </View>
    );

    const renderErrorState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="alert-circle-outline"
                size={80}
                color={isDark ? '#4B5563' : '#D1D5DB'}
            />
            <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
                Error Loading Bookmarks
            </Text>
            <Text style={[styles.emptySubtitle, isDark && styles.emptySubtitleDark]}>
                {error}
            </Text>
            <TouchableOpacity
                style={styles.reloadButton}
                onPress={handleRefresh}
                activeOpacity={0.8}
            >
                <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                <Text style={styles.reloadButtonText}>Try Again</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, styles.centerContent, isDark && styles.containerDark]}>
                <ActivityIndicator size="large" color="#358B8B" />
                <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
                    Loading saved properties...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <LinearGradient
                colors={isDark ? ['#1F2937', '#111827'] : ['#FFFFFF', '#F9FAFB']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
                            My Saved Properties
                        </Text>
                        <Text style={[styles.headerSubtitle, isDark && styles.headerSubtitleDark]}>
                            {bookmarks.length} {bookmarks.length === 1 ? 'property' : 'properties'} saved
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.headerButton, isDark && styles.headerButtonDark]}
                        onPress={handleRefresh}
                    >
                        <Ionicons
                            name="refresh-outline"
                            size={20}
                            color={isDark ? '#D1D5DB' : '#374151'}
                        />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {error ? (
                renderErrorState()
            ) : (
                <FlatList
                    data={bookmarks}
                    renderItem={renderBookmarkCard}
                    keyExtractor={(item) => item.bookmark_id.toString()}
                    contentContainerStyle={[
                        styles.listContent,
                        bookmarks.length === 0 && styles.listContentEmpty,
                    ]}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#358B8B"
                            colors={['#358B8B']}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
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
        // paddingBottom: 10,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    headerTitleDark: {
        color: '#F9FAFB',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    headerSubtitleDark: {
        color: '#9CA3AF',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerButtonDark: {
        backgroundColor: '#374151',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    loadingTextDark: {
        color: '#9CA3AF',
    },
    listContent: {
        padding: 20,
    },
    listContentEmpty: {
        flex: 1,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardDark: {
        backgroundColor: '#1F2937',
    },
    cardContent: {
        flexDirection: 'row',
        gap: 12,
    },
    thumbnail: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    thumbnailPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    details: {
        flex: 1,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    titleDark: {
        color: '#F9FAFB',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    location: {
        fontSize: 13,
        color: '#6B7280',
        flex: 1,
    },
    locationDark: {
        color: '#9CA3AF',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    typeText: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '500',
    },
    typeTextDark: {
        color: '#D1D5DB',
    },
    purposeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    purposeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#358B8B',
        flex: 1,
    },
    removeButton: {
        width: 24,
        height: 24,
        borderRadius: 16,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    removeButtonDark: {
        backgroundColor: '#7F1D1D',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginTop: 24,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyTitleDark: {
        color: '#F9FAFB',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    emptySubtitleDark: {
        color: '#9CA3AF',
    },
    reloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#358B8B',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    reloadButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
