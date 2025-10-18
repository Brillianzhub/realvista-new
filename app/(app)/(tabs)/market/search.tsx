import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    useColorScheme,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PropertySearchCard from '@/components/market/PropertySearchCard';
import { useSearchProperties, SearchFilters, PropertySearchResult } from '@/hooks/market/useSearchProperties';

export default function Search() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const [filters, setFilters] = useState<SearchFilters>({
        title: '',
        location: '',
        min_price: '',
        max_price: '',
    });

    const [loadingMore, setLoadingMore] = useState(false);


    const {
        properties,
        loading,
        refreshing,
        error,
        hasSearched,
        fetchProperties,
        clearResults,
    } = useSearchProperties();

    const handleSearch = () => {
        fetchProperties(filters);
    };

    const handleClearFilters = () => {
        setFilters({
            title: '',
            location: '',
            min_price: '',
            max_price: '',
        });
        clearResults()
    };

    // const handleLoadMore = () => {
    //     if (!loadingMore && hasMore) {
    //         fetchProperties(filters, currentPage + 1);
    //     }
    // };


    const handleRefresh = () => {
        if (hasSearched) {
            fetchProperties(filters, true);
        }
    };

    const renderPropertyCard = ({ item }: { item: PropertySearchResult }) => {
        // Convert preview_images from string[] to { image: string }[]
        const mappedProperty = {
            ...item,
            preview_images: Array.isArray(item.preview_images)
                ? item.preview_images.map((img: string) => ({ image: img }))
                : [],
        };
        return <PropertySearchCard property={mappedProperty} />;
    };

    const renderFooter = () => {
        if (!loadingMore) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#358B8B" />
                <Text style={[styles.footerLoaderText, isDark && styles.footerLoaderTextDark]}>
                    Loading more...
                </Text>
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading || !hasSearched) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons
                    name="search-outline"
                    size={80}
                    color={isDark ? '#4B5563' : '#D1D5DB'}
                />
                <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
                    No Properties Found
                </Text>
                <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                    Try adjusting your search filters to find more properties
                </Text>
            </View>
        );
    };

    const renderHeader = useMemo(() => (
        <>
            <View style={[styles.header, isDark && styles.headerDark]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
                    Search Properties
                </Text>
                <Text style={[styles.headerSubtitle, isDark && styles.headerSubtitleDark]}>
                    Find your perfect property
                </Text>
            </View>

            <View style={[styles.filtersContainer, isDark && styles.filtersContainerDark]}>
                <View style={styles.filterGroup}>
                    <Text style={[styles.filterLabel, isDark && styles.filterLabelDark]}>
                        Property Title
                    </Text>
                    <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                        <Ionicons
                            name="home-outline"
                            size={20}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            placeholder="e.g., Luxury Apartment"
                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                            value={filters.title}
                            onChangeText={(text) => setFilters({ ...filters, title: text })}
                        />
                    </View>
                </View>

                <View style={styles.filterGroup}>
                    <Text style={[styles.filterLabel, isDark && styles.filterLabelDark]}>
                        Location
                    </Text>
                    <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                        <Ionicons
                            name="location-outline"
                            size={20}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            placeholder="e.g., Lagos, Victoria Island"
                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                            value={filters.location}
                            onChangeText={(text) => setFilters({ ...filters, location: text })}
                        />
                    </View>
                </View>

                <View style={styles.filterRow}>
                    <View style={[styles.filterGroup, styles.filterHalf]}>
                        <Text style={[styles.filterLabel, isDark && styles.filterLabelDark]}>
                            Min Price
                        </Text>
                        <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                            <Ionicons
                                name="cash-outline"
                                size={20}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="0"
                                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                value={filters.min_price}
                                onChangeText={(text) => setFilters({ ...filters, min_price: text })}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={[styles.filterGroup, styles.filterHalf]}>
                        <Text style={[styles.filterLabel, isDark && styles.filterLabelDark]}>
                            Max Price
                        </Text>
                        <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                            <Ionicons
                                name="cash-outline"
                                size={20}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="∞"
                                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                value={filters.max_price}
                                onChangeText={(text) => setFilters({ ...filters, max_price: text })}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.searchButton, loading && styles.searchButtonDisabled]}
                        onPress={handleSearch}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="search" size={20} color="#FFFFFF" />
                                <Text style={styles.searchButtonText}>Search</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.clearButton, isDark && styles.clearButtonDark]}
                        onPress={handleClearFilters}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="close-circle-outline"
                            size={20}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                        <Text style={[styles.clearButtonText, isDark && styles.clearButtonTextDark]}>
                            Clear
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {error && (
                <View style={[styles.errorContainer, isDark && styles.errorContainerDark]}>
                    <Ionicons name="alert-circle" size={24} color="#EF4444" />
                    <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
                        {error}
                    </Text>
                </View>
            )}

            {loading && !refreshing && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#358B8B" />
                    <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
                        Searching properties...
                    </Text>
                </View>
            )}
        </>
    ), [filters, error, loading, refreshing, isDark]);

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <FlatList
                data={properties}
                renderItem={renderPropertyCard}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                // onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#358B8B"
                        colors={['#358B8B']}
                    />
                }
                contentContainerStyle={[
                    properties.length === 0 && !loading && styles.listContentEmpty,
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                removeClippedSubviews={false}
                keyboardDismissMode="none"
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
        backgroundColor: '#FFFFFF',
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    headerDark: {
        backgroundColor: '#1F2937',
    },
    backButton: {
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    headerTitleDark: {
        color: '#F9FAFB',
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#6B7280',
    },
    headerSubtitleDark: {
        color: '#9CA3AF',
    },
    filtersContainer: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    filtersContainerDark: {
        backgroundColor: '#1F2937',
    },
    filterGroup: {
        marginBottom: 20,
    },
    filterHalf: {
        flex: 1,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 12,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    filterLabelDark: {
        color: '#E5E7EB',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 12,
    },
    inputWrapperDark: {
        backgroundColor: '#111827',
        borderColor: '#374151',
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
        paddingVertical: 12,
    },
    inputDark: {
        color: '#F9FAFB',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    searchButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#358B8B',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#358B8B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    searchButtonDisabled: {
        opacity: 0.7,
    },
    searchButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 6,
    },
    clearButtonDark: {
        backgroundColor: '#374151',
    },
    clearButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6B7280',
    },
    clearButtonTextDark: {
        color: '#9CA3AF',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    errorContainerDark: {
        backgroundColor: '#7F1D1D',
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        color: '#DC2626',
        lineHeight: 20,
    },
    errorTextDark: {
        color: '#FCA5A5',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        color: '#6B7280',
    },
    loadingTextDark: {
        color: '#9CA3AF',
    },
    listContentEmpty: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyTitleDark: {
        color: '#E5E7EB',
    },
    emptyText: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
    },
    emptyTextDark: {
        color: '#9CA3AF',
    },
    footerLoader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 12,
    },
    footerLoaderText: {
        fontSize: 14,
        color: '#6B7280',
    },
    footerLoaderTextDark: {
        color: '#9CA3AF',
    },
    loadMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 16,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    loadMoreButtonDark: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
    },
    loadMoreButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    loadMoreButtonTextDark: {
        color: '#E5E7EB',
    },
});
