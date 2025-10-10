import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    useColorScheme,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import VideoCard from '@/components/learn/VideoCard';
import { learnContentData, type LearnContent } from '@/data/learnContent';

type Category = 'All' | 'Real Estate' | 'Finance' | 'Investment';

const categories: Category[] = ['All', 'Real Estate', 'Finance', 'Investment'];

export default function Learn() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const [contents, setContents] = useState<LearnContent[]>([]);
    const [filteredContents, setFilteredContents] = useState<LearnContent[]>([]);
    const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterContent();
    }, [selectedCategory, searchQuery, contents]);

    const loadData = async () => {
        try {
            setContents(learnContentData);

            const watchedData = await AsyncStorage.getItem('watchedVideos');
            if (watchedData) {
                const watched = JSON.parse(watchedData);
                setWatchedVideos(new Set(watched));
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filterContent = () => {
        let filtered = contents;

        if (selectedCategory !== 'All') {
            filtered = filtered.filter((item) => item.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.title.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query)
            );
        }

        setFilteredContents(filtered);
    };

    const toggleWatchedStatus = async (contentId: string) => {
        const isWatched = watchedVideos.has(contentId);

        try {
            let newWatchedSet: Set<string>;

            if (isWatched) {
                newWatchedSet = new Set(watchedVideos);
                newWatchedSet.delete(contentId);
            } else {
                newWatchedSet = new Set(watchedVideos);
                newWatchedSet.add(contentId);
            }

            setWatchedVideos(newWatchedSet);

            await AsyncStorage.setItem(
                'watchedVideos',
                JSON.stringify(Array.from(newWatchedSet))
            );
        } catch (error) {
            console.error('Error toggling watched status:', error);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, []);



    const handleVideoPress = (content: LearnContent) => {
        router.push({
            pathname: '/(app)/(learn)/[id]',
            params: { id: String(content.id) }, // 👈 must match the dynamic segment name
        });
    };


    const renderCategoryPill = (category: Category) => {
        const isSelected = category === selectedCategory;
        return (
            <TouchableOpacity
                key={category}
                style={[
                    styles.categoryPill,
                    isSelected && styles.categoryPillActive,
                    isDark && !isSelected && styles.categoryPillDark,
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.categoryPillText,
                        isSelected && styles.categoryPillTextActive,
                        isDark && !isSelected && styles.categoryPillTextDark,
                    ]}
                >
                    {category}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons
                name="videocam-outline"
                size={64}
                color={isDark ? '#4B5563' : '#D1D5DB'}
            />
            <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
                No videos found
            </Text>
            <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
                {searchQuery
                    ? 'Try adjusting your search or filter'
                    : 'Check back soon for new educational content'}
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <LinearGradient
                colors={['#efa968', '#358B8B']}
                // colors={['#FB902E', '#F97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Learn</Text>
                <Text style={styles.headerSubtitle}>
                    Master real estate, finance, and investment
                </Text>
            </LinearGradient>

            <View style={styles.contentContainer}>
                {/* <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
                    <Ionicons
                        name="search"
                        size={20}
                        color={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                    <TextInput
                        style={[styles.searchInput, isDark && styles.searchInputDark]}
                        placeholder="Search videos..."
                        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons
                                name="close-circle"
                                size={20}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                        </TouchableOpacity>
                    )}
                </View> */}

                <FlatList
                    horizontal
                    data={categories}
                    renderItem={({ item }) => renderCategoryPill(item)}
                    keyExtractor={(item) => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                />

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FB902E" />
                    </View>
                ) : (
                    <FlatList
                        data={filteredContents}
                        renderItem={({ item }) => (
                            <VideoCard
                                id={item.id}
                                title={item.title}
                                description={item.description}
                                category={item.category}
                                thumbnailUrl={item.thumbnail_url}
                                duration={item.duration}
                                isWatched={watchedVideos.has(item.id)}
                                onPress={() => handleVideoPress(item)}
                                onToggleWatched={() => toggleWatchedStatus(item.id)}
                            />
                        )}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#FB902E"
                                colors={['#FB902E']}
                            />
                        }
                        ListEmptyComponent={renderEmptyState}
                    />
                )}
            </View>
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
        paddingTop: 40,
        paddingBottom: 32,
        paddingHorizontal: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 20,
    },
    contentContainer: {
        flex: 1,
        paddingTop: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        gap: 12,
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
    categoryList: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8,
    },
    categoryPill: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        marginRight: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    categoryPillDark: {
        backgroundColor: '#1F2937',
    },
    categoryPillActive: {
        backgroundColor: '#FB902E',
    },
    categoryPillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    categoryPillTextDark: {
        color: '#9CA3AF',
    },
    categoryPillTextActive: {
        color: '#FFFFFF',
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateTitleDark: {
        color: '#E5E7EB',
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    emptyStateTextDark: {
        color: '#9CA3AF',
    },
});
