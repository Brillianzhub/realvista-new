import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ListingCardProps = {
    id: string;
    thumbnailUrl?: string;
    propertyName: string;
    listingType: 'Corporate' | 'P2P';
    status: 'Draft' | 'Published' | 'Removed';
    completionPercentage: number;
    location?: string;
    propertyValue?: number;
    onUpdate: () => void;
    onRemove: () => void;
    onPress: () => void;
    onViewPerformance?: () => void;
};

export default function ListingCard({
    thumbnailUrl,
    propertyName,
    listingType,
    status,
    completionPercentage,
    location,
    propertyValue,
    onUpdate,
    onRemove,
    onPress,
    onViewPerformance,
}: ListingCardProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const getStatusColor = (stat: string) => {
        switch (stat) {
            case 'Published':
                return '#10B981';
            case 'Draft':
                return '#F59E0B';
            case 'Removed':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    const getListingTypeColor = (type: string) => {
        return type === 'Corporate' ? '#3B82F6' : '#8B5CF6';
    };

    const formatCurrency = (value: number) => {
        return `₦${value.toLocaleString()}`;
    };

    return (
        <TouchableOpacity
            style={[styles.card, isDark && styles.cardDark]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                {thumbnailUrl ? (
                    <Image
                        source={{ uri: thumbnailUrl }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.placeholderImage, isDark && styles.placeholderImageDark]}>
                        <Ionicons name="home-outline" size={48} color={isDark ? '#4B5563' : '#D1D5DB'} />
                    </View>
                )}

                <View style={styles.badges}>
                    <View style={styles.badgeGroup}>
                        <View
                            style={[
                                styles.typeBadge,
                                { backgroundColor: getListingTypeColor(listingType) },
                            ]}
                        >
                            <Text style={styles.typeBadgeText}>{listingType}</Text>
                        </View>

                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: getStatusColor(status) },
                            ]}
                        >
                            <Text style={styles.statusBadgeText}>{status}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.deleteIconButton, isDark && styles.deleteIconButtonDark]}
                        onPress={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="trash-outline" size={20} color={isDark ? '#F87171' : '#EF4444'} />
                    </TouchableOpacity>
                </View>

                {completionPercentage < 100 && (
                    <View style={styles.progressOverlay}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${completionPercentage}%` },
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>{completionPercentage}% Complete</Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={[styles.propertyName, isDark && styles.propertyNameDark]} numberOfLines={1}>
                        {propertyName}
                    </Text>
                </View>

                {location && (
                    <View style={styles.infoRow}>
                        <Ionicons
                            name="location-outline"
                            size={16}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                        <Text style={[styles.infoText, isDark && styles.infoTextDark]} numberOfLines={1}>
                            {location}
                        </Text>
                    </View>
                )}

                {propertyValue !== undefined && propertyValue > 0 && (
                    <View style={styles.infoRow}>
                        <Ionicons
                            name="cash-outline"
                            size={16}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                        <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                            {formatCurrency(propertyValue)}
                        </Text>
                    </View>
                )}

                <View style={styles.actions}>
                    {status === 'Published' && onViewPerformance && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.performanceButton]}
                            onPress={(e) => {
                                e.stopPropagation();
                                onViewPerformance();
                            }}
                        >
                            <Ionicons name="analytics-outline" size={18} color="#FFFFFF" />
                            <Text style={styles.performanceButtonText}>Performance</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.actionButton, styles.updateButton]}
                        onPress={(e) => {
                            e.stopPropagation();
                            onUpdate();
                        }}
                    >
                        <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Update</Text>
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
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 200,
    },
    thumbnail: {
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
    badgeGroup: {
        flexDirection: 'row',
        gap: 8,
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    progressOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        padding: 12,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 3,
        marginBottom: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FB902E',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    content: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    propertyName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
    },
    propertyNameDark: {
        color: '#F9FAFB',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
    },
    infoTextDark: {
        color: '#9CA3AF',
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 11,
        paddingHorizontal: 16,
        borderRadius: 10,
        gap: 6,
    },
    updateButton: {
        backgroundColor: '#358B8B',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    deleteIconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    deleteIconButtonDark: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
    },
    performanceButton: {
        backgroundColor: '#FB902E',
    },
    performanceButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
