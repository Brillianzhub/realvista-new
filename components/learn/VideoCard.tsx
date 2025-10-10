import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type VideoCardProps = {
    id: string;
    title: string;
    description: string;
    category: string;
    thumbnailUrl: string;
    duration: string;
    isWatched: boolean;
    onPress: () => void;
    onToggleWatched: () => void;
};

export default function VideoCard({
    title,
    description,
    category,
    thumbnailUrl,
    duration,
    isWatched,
    onPress,
    onToggleWatched,
}: VideoCardProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

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

    return (
        <TouchableOpacity
            style={[styles.card, isDark && styles.cardDark]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.thumbnailContainer}>
                <Image
                    source={{ uri: thumbnailUrl }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />

                <View style={styles.durationBadge}>
                    <Ionicons name="time-outline" size={12} color="#FFFFFF" />
                    <Text style={styles.durationText}>{duration}</Text>
                </View>

                {isWatched && (
                    <View style={styles.watchedOverlay}>
                        <View style={styles.watchedBadge}>
                            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                            <Text style={styles.watchedText}>Watched</Text>
                        </View>
                    </View>
                )}

                <View style={styles.playButton}>
                    <Ionicons name="play" size={24} color="#FFFFFF" />
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <View
                        style={[
                            styles.categoryBadge,
                            { backgroundColor: `${getCategoryColor(category)}15` },
                        ]}
                    >
                        <Text style={[styles.category, { color: getCategoryColor(category) }]}>
                            {category}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={onToggleWatched}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.watchButton}
                    >
                        <Ionicons
                            name={isWatched ? 'checkmark-circle' : 'checkmark-circle-outline'}
                            size={24}
                            color={isWatched ? '#10B981' : (isDark ? '#9CA3AF' : '#6B7280')}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.title, isDark && styles.titleDark]} numberOfLines={2}>
                    {title}
                </Text>

                <Text style={[styles.description, isDark && styles.descriptionDark]} numberOfLines={2}>
                    {description}
                </Text>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.watchNowButton} onPress={onPress}>
                        <Text style={styles.watchNowText}>Watch Now</Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
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
    thumbnailContainer: {
        position: 'relative',
        width: '100%',
        height: 200,
        backgroundColor: '#F3F4F6',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    durationText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    watchedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    watchedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    watchedText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10B981',
    },
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -28 }, { translateY: -28 }],
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(251, 144, 46, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    category: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    watchButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        lineHeight: 24,
    },
    titleDark: {
        color: '#F9FAFB',
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 16,
    },
    descriptionDark: {
        color: '#9CA3AF',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    watchNowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FB902E',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    watchNowText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
