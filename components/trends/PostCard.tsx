import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type PostCardProps = {
    id: string;
    title: string;
    excerpt: string;
    thumbnail?: string;
    publishedDate: string;
    category?: string;
    onPress: () => void;
};

export default function PostCard({
    title,
    excerpt,
    thumbnail,
    publishedDate,
    category,
    onPress,
}: PostCardProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <TouchableOpacity
            style={[styles.card, isDark && styles.cardDark]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {thumbnail && (
                <Image
                    source={{ uri: thumbnail }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />
            )}

            <View style={styles.content}>
                {category && (
                    <View style={styles.categoryContainer}>
                        <Text style={styles.category}>{category}</Text>
                    </View>
                )}

                <Text style={[styles.title, isDark && styles.titleDark]} numberOfLines={2}>
                    {title}
                </Text>

                <Text style={[styles.excerpt, isDark && styles.excerptDark]} numberOfLines={3}>
                    {excerpt}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.dateContainer}>
                        <Ionicons
                            name="calendar-outline"
                            size={14}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                        <Text style={[styles.date, isDark && styles.dateDark]}>
                            {formatDate(publishedDate)}
                        </Text>
                    </View>

                    <View style={styles.readMore}>
                        <Text style={styles.readMoreText}>Read more</Text>
                        <Ionicons name="arrow-forward" size={14} color="#FB902E" />
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
    thumbnail: {
        width: '100%',
        height: 200,
        backgroundColor: '#F3F4F6',
    },
    content: {
        padding: 16,
    },
    categoryContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 12,
    },
    category: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FB902E',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
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
    excerpt: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 16,
    },
    excerptDark: {
        color: '#9CA3AF',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    date: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    dateDark: {
        color: '#9CA3AF',
    },
    readMore: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readMoreText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FB902E',
    },
});
