import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import PostCard from '@/components/trends/PostCard';
import { Ionicons } from '@expo/vector-icons';



type TrendPost = {
    id: number;
    title: string;
    slug: string;
    body: string;
    attachment: string | null;
    date_created: string;
    category: string;
    views: number;
    publish: boolean;
};

type ApiResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: TrendPost[];
};

export default function Trends() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const [posts, setPosts] = useState<TrendPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = async () => {
        try {
            setError(null);

            const response = await fetch(
                'https://www.realvistamanagement.com/trends/reports/',
                {
                    method: 'GET',
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch trends');
            }

            const data: ApiResponse = await response.json();
            setPosts(data.results || []);
        } catch (err: any) {
            console.error('Error fetching posts:', err);
            setError('Failed to load trends. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const extractExcerpt = (html: string): string => {
        const text = html.replace(/<[^>]*>/g, '');
        return text.length > 150 ? text.substring(0, 150) + '...' : text;
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPosts();
    }, []);

    const handlePostPress = (slug: string) => {
        router.push({
            pathname: '/(app)/(trends)/[slug]',
            params: { slug },
        });
    };

    const renderSkeleton = () => (
        <View style={styles.skeletonContainer}>
            {[1, 2, 3].map((item) => (
                <View key={item} style={[styles.skeletonCard, isDark && styles.skeletonCardDark]}>
                    <View style={styles.skeletonImage} />
                    <View style={styles.skeletonContent}>
                        <View style={styles.skeletonCategory} />
                        <View style={styles.skeletonTitle} />
                        <View style={styles.skeletonExcerpt} />
                        <View style={styles.skeletonExcerptShort} />
                    </View>
                </View>
            ))}
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons
                name="newspaper-outline"
                size={64}
                color={isDark ? '#4B5563' : '#D1D5DB'}
            />
            <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
                No trends available yet
            </Text>
            <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
                Check back soon for the latest market insights and trends.
            </Text>
        </View>
    );

    const renderErrorState = () => (
        <View style={styles.emptyState}>
            <Ionicons
                name="alert-circle-outline"
                size={64}
                color={isDark ? '#EF4444' : '#F87171'}
            />
            <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
                {error}
            </Text>
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
                <Text style={styles.headerTitle}>Market Trends & Insights</Text>
                <Text style={styles.headerSubtitle}>
                    Stay informed with the latest real estate market insights
                </Text>
            </LinearGradient>

            {loading ? (
                renderSkeleton()
            ) : error ? (
                renderErrorState()
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <PostCard
                            id={item.id.toString()}
                            title={item.title}
                            excerpt={extractExcerpt(item.body)}
                            thumbnail={item.attachment || undefined}
                            publishedDate={item.date_created}
                            category={item.category}
                            onPress={() => handlePostPress(item.slug)}
                        />
                    )}
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
        paddingTop: 60,
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
    listContent: {
        padding: 16,
        paddingTop: 24,
    },
    skeletonContainer: {
        padding: 16,
        paddingTop: 24,
    },
    skeletonCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
    },
    skeletonCardDark: {
        backgroundColor: '#1F2937',
    },
    skeletonImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#E5E7EB',
    },
    skeletonContent: {
        padding: 16,
    },
    skeletonCategory: {
        width: 100,
        height: 20,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        marginBottom: 12,
    },
    skeletonTitle: {
        width: '100%',
        height: 24,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        marginBottom: 8,
    },
    skeletonExcerpt: {
        width: '100%',
        height: 16,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        marginBottom: 6,
    },
    skeletonExcerptShort: {
        width: '80%',
        height: 16,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
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
