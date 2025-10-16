import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    useColorScheme,
    TouchableOpacity,
    Share,
    Linking,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useLearnVideos, LearnVideo } from '@/hooks/learn/useLearnVideos';



export default function LearnDetail() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const { width } = Dimensions.get('window');

    const [content, setContent] = useState<LearnVideo | null>(null);
    const [relatedVideos, setRelatedVideos] = useState<LearnVideo[]>([]);
    const [isWatched, setIsWatched] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { videos } = useLearnVideos()


    useEffect(() => {
        if (slug) {
            loadContentDetail();
        }
    }, [slug]);

    useEffect(() => {
        if (videos.length > 0 && content) {
            const related = videos
                .filter(
                    (item) => item.category === content.category && item.slug !== content.slug
                )
                .slice(0, 3);

            setRelatedVideos(related);
        }
    }, [videos, content]);


    const loadContentDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`https://www.realvistamanagement.com/learn/${slug}/`);
            if (!response.ok) {
                throw new Error('Failed to fetch video detail');
            }

            const data = await response.json();
            setContent(data);

            // Increment backend view count
            await fetch(`https://www.realvistamanagement.com/learn/${slug}/increment-view/`, {
                method: 'POST',
            });
        } catch (err: any) {
            console.error('Error loading content:', err);
            setError(err.message || 'Failed to load content');
        } finally {
            setLoading(false);
        }
    };


    const toggleWatchedStatus = async () => {
        if (!content) return;

    };


    const handleShare = async () => {
        if (!content) return;

        try {
            await Share.share({
                message: `${content.title}\n\nWatch on YouTube: ${content.youtube_url}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleOpenYouTube = () => {
        if (content?.youtube_url) {
            Linking.openURL(content.youtube_url);
        }
    };

    const handleRelatedVideoPress = (relatedId: string) => {
        router.push(`/learn/${relatedId}`);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getCategoryColor = (cat: string): string => {
        switch (cat) {
            case 'Real Estate':
                return '#FB902E';
            case 'Finance':
                return '#10B981';
            case 'Investment':
                return '#3B82F6';
            default:
                return '#6B7280';
        }
    };

    if (loading) {
        return (
            <View style={[styles.centered, isDark && styles.centeredDark]}>
                <ActivityIndicator size="large" color="#FB902E" />
                <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
                    Loading video...
                </Text>
            </View>
        );
    }

    if (error || !content) {
        return (
            <View style={[styles.centered, isDark && styles.centeredDark]}>
                <Ionicons
                    name="alert-circle-outline"
                    size={64}
                    color={isDark ? '#EF4444' : '#F87171'}
                />
                <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
                    {error || 'Content not found'}
                </Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const youtubeEmbedUrl = `https://www.youtube.com/embed/${content.youtube_id}?rel=0&modestbranding=1`;

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.headerButton, isDark && styles.headerButtonDark]}
                    onPress={handleShare}
                >
                    <Ionicons name="share-outline" size={24} color={isDark ? '#F9FAFB' : '#111827'} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.videoContainer}>
                    <WebView
                        source={{ uri: youtubeEmbedUrl }}
                        style={styles.video}
                        allowsFullscreenVideo
                        mediaPlaybackRequiresUserAction={false}
                    />
                </View>

                <View style={styles.content}>
                    <View
                        style={[
                            styles.categoryBadge,
                            { backgroundColor: `${getCategoryColor(content.category)}15` },
                        ]}
                    >
                        <Text
                            style={[styles.category, { color: getCategoryColor(content.category) }]}
                        >
                            {content.category}
                        </Text>
                    </View>

                    <Text style={[styles.title, isDark && styles.titleDark]}>{content.title}</Text>

                    <View style={styles.metadata}>
                        <View style={styles.metadataItem}>
                            <Ionicons
                                name="calendar-outline"
                                size={16}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                            <Text style={[styles.metadataText, isDark && styles.metadataTextDark]}>
                                {formatDate(content.created_at)}
                            </Text>
                        </View>

                        <View style={styles.metadataItem}>
                            <Ionicons
                                name="time-outline"
                                size={16}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                            <Text style={[styles.metadataText, isDark && styles.metadataTextDark]}>
                                {content.duration}
                            </Text>
                        </View>

                        <View style={styles.metadataItem}>
                            <Ionicons
                                name="eye-outline"
                                size={16}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                            <Text style={[styles.metadataText, isDark && styles.metadataTextDark]}>
                                {content.view_count} views
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                isWatched && styles.actionButtonActive,
                                isDark && styles.actionButtonDark,
                            ]}
                            onPress={toggleWatchedStatus}
                        >
                            <Ionicons
                                name={isWatched ? 'checkmark-circle' : 'checkmark-circle-outline'}
                                size={20}
                                color={isWatched ? '#FFFFFF' : isDark ? '#9CA3AF' : '#6B7280'}
                            />
                            <Text
                                style={[
                                    styles.actionButtonText,
                                    isWatched && styles.actionButtonTextActive,
                                    isDark && !isWatched && styles.actionButtonTextDark,
                                ]}
                            >
                                {isWatched ? 'Liked' : 'Mark as Liked'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.openYouTubeButton]}
                            onPress={handleOpenYouTube}
                        >
                            <Ionicons name="logo-youtube" size={20} color="#FFFFFF" />
                            <Text style={styles.openYouTubeText}>Open in YouTube</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                        About this video
                    </Text>
                    <Text style={[styles.description, isDark && styles.descriptionDark]}>
                        {content.description}
                    </Text>

                    {relatedVideos.length > 0 && (
                        <>
                            <View style={styles.divider} />

                            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                                Related Videos
                            </Text>

                            {relatedVideos.map((video) => (
                                <TouchableOpacity
                                    key={video.id}
                                    style={[styles.relatedCard, isDark && styles.relatedCardDark]}
                                    onPress={() => handleRelatedVideoPress(video.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.relatedInfo}>
                                        <Text
                                            style={[styles.relatedTitle, isDark && styles.relatedTitleDark]}
                                            numberOfLines={2}
                                        >
                                            {video.title}
                                        </Text>
                                        <Text style={[styles.relatedMeta, isDark && styles.relatedMetaDark]}>
                                            {video.category} • {video.duration}
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name="play-circle"
                                        size={32}
                                        color={isDark ? '#FB902E' : '#F97316'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    containerDark: {
        backgroundColor: '#111827',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 32,
    },
    centeredDark: {
        backgroundColor: '#111827',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    },
    loadingTextDark: {
        color: '#9CA3AF',
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#374151',
        textAlign: 'center',
    },
    errorTextDark: {
        color: '#E5E7EB',
    },
    backButton: {
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#FB902E',
        borderRadius: 12,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 16,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerButtonDark: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    videoContainer: {
        width: '100%',
        height: 240,
        backgroundColor: '#000000',
    },
    video: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingTop: 16,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 12,
    },
    category: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        lineHeight: 32,
        marginBottom: 16,
    },
    titleDark: {
        color: '#F9FAFB',
    },
    metadata: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20,
    },
    metadataItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metadataText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    metadataTextDark: {
        color: '#9CA3AF',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonDark: {
        backgroundColor: '#374151',
    },
    actionButtonActive: {
        backgroundColor: '#10B981',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    actionButtonTextDark: {
        color: '#9CA3AF',
    },
    actionButtonTextActive: {
        color: '#FFFFFF',
    },
    openYouTubeButton: {
        backgroundColor: '#FF0000',
    },
    openYouTubeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    sectionTitleDark: {
        color: '#F9FAFB',
    },
    description: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
    },
    descriptionDark: {
        color: '#E5E7EB',
    },
    relatedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
    },
    relatedCardDark: {
        backgroundColor: '#1F2937',
    },
    relatedInfo: {
        flex: 1,
    },
    relatedTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
        lineHeight: 22,
    },
    relatedTitleDark: {
        color: '#F9FAFB',
    },
    relatedMeta: {
        fontSize: 13,
        color: '#6B7280',
    },
    relatedMetaDark: {
        color: '#9CA3AF',
    },
});
