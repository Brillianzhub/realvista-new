import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    useColorScheme,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ListingPerformanceModalProps {
    visible: boolean;
    performanceData: {
        propertyName: string;
        dateListed: string;
        totalViews: number;
        totalEnquiries: number;
        totalBookmarks: number;
    } | null;
    onClose: () => void;
}

export default function ListingPerformanceModal({
    visible,
    performanceData,
    onClose,
}: ListingPerformanceModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';


    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        };
        return date.toLocaleDateString('en-US', options);
    };

    const formatDateTime = (dateString: string | null): string => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };
        return date.toLocaleDateString('en-US', options);
    };

    const getDaysSinceListed = (dateString: string): number => {
        const listed = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - listed.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getAverageViewsPerDay = (views: number, daysSince: number): string => {
        if (daysSince === 0) return '0';
        return (views / daysSince).toFixed(1);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
                    <LinearGradient
                        colors={['#358B8B', '#2C7070']}
                        style={styles.header}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <View style={styles.headerContent}>
                            <View style={styles.headerLeft}>
                                <Ionicons name="analytics" size={28} color="#FFFFFF" />
                                <View style={styles.headerText}>
                                    <Text style={styles.headerTitle}>Listing Performance</Text>
                                    {performanceData && (
                                        <Text style={styles.headerSubtitle} numberOfLines={1}>
                                            {performanceData.propertyName}
                                        </Text>
                                    )}
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {performanceData ? (
                            <>
                                <View style={[styles.statusCard, isDark && styles.statusCardDark]}>
                                    <View style={styles.statusHeader}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={24}
                                            color="#10B981"
                                        />
                                        <Text style={[styles.statusText, isDark && styles.statusTextDark]}>
                                            Status: <Text style={styles.statusValue}>Published</Text>
                                        </Text>
                                    </View>
                                    <Text style={[styles.statusSubtext, isDark && styles.statusSubtextDark]}>
                                        Listed {getDaysSinceListed(performanceData.dateListed)} days ago
                                    </Text>
                                </View>

                                <View style={styles.metricsGrid}>
                                    <View style={[styles.metricCard, isDark && styles.metricCardDark]}>
                                        <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                                            <Ionicons name="calendar-outline" size={32} color="#2563EB" />
                                        </View>
                                        <Text style={[styles.metricLabel, isDark && styles.metricLabelDark]}>
                                            Date Listed
                                        </Text>
                                        <Text style={[styles.metricValue, isDark && styles.metricValueDark]}>
                                            {formatDate(performanceData.dateListed)}
                                        </Text>
                                    </View>

                                    <View style={[styles.metricCard, isDark && styles.metricCardDark]}>
                                        <View style={[styles.iconContainer, { backgroundColor: '#FCE7F3' }]}>
                                            <Ionicons name="eye-outline" size={32} color="#DB2777" />
                                        </View>
                                        <Text style={[styles.metricLabel, isDark && styles.metricLabelDark]}>
                                            Total Views
                                        </Text>
                                        <Text style={[styles.metricValue, isDark && styles.metricValueDark]}>
                                            {performanceData.totalViews.toLocaleString()}
                                        </Text>
                                        {/* <Text style={[styles.metricSubtext, isDark && styles.metricSubtextDark]}>
                                            {getAverageViewsPerDay(
                                                performanceData.totalViews,
                                                getDaysSinceListed(performanceData.dateListed)
                                            )}{' '}
                                            since listing
                                        </Text> */}
                                    </View>

                                    <View style={[styles.metricCard, isDark && styles.metricCardDark]}>
                                        <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                                            <Ionicons name="chatbubble-outline" size={32} color="#D97706" />
                                        </View>
                                        <Text style={[styles.metricLabel, isDark && styles.metricLabelDark]}>
                                            Total Enquiries
                                        </Text>
                                        <Text style={[styles.metricValue, isDark && styles.metricValueDark]}>
                                            {performanceData.totalEnquiries.toLocaleString()}
                                        </Text>
                                    </View>

                                    <View style={[styles.metricCard, isDark && styles.metricCardDark]}>
                                        <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
                                            <Ionicons name="bookmark-outline" size={32} color="#059669" />
                                        </View>
                                        <Text style={[styles.metricLabel, isDark && styles.metricLabelDark]}>
                                            Total Bookmarks
                                        </Text>
                                        <Text style={[styles.metricValue, isDark && styles.metricValueDark]}>
                                            {performanceData.totalBookmarks.toLocaleString()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={[styles.tipsCard, isDark && styles.tipsCardDark]}>
                                    <View style={styles.tipsHeader}>
                                        <Ionicons name="bulb-outline" size={24} color="#F59E0B" />
                                        <Text style={[styles.tipsTitle, isDark && styles.tipsTitleDark]}>
                                            Tips to Improve Performance
                                        </Text>
                                    </View>
                                    <View style={styles.tipsList}>
                                        <View style={styles.tipItem}>
                                            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                                            <Text style={[styles.tipText, isDark && styles.tipTextDark]}>
                                                Add high-quality images to attract more views
                                            </Text>
                                        </View>
                                        <View style={styles.tipItem}>
                                            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                                            <Text style={[styles.tipText, isDark && styles.tipTextDark]}>
                                                Update property description with detailed features
                                            </Text>
                                        </View>
                                        <View style={styles.tipItem}>
                                            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                                            <Text style={[styles.tipText, isDark && styles.tipTextDark]}>
                                                Respond quickly to enquiries to build trust
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="analytics-outline" size={64} color="#D1D5DB" />
                                <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                                    No performance data available
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        minHeight: '90%',
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    modalContainerDark: {
        backgroundColor: '#1F2937',
    },
    header: {
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    emptyTextDark: {
        color: '#9CA3AF',
    },
    statusCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    statusCardDark: {
        backgroundColor: '#111827',
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    statusTextDark: {
        color: '#F9FAFB',
    },
    statusValue: {
        color: '#358B8B',
        fontWeight: '700',
    },
    statusSubtext: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 36,
    },
    statusSubtextDark: {
        color: '#9CA3AF',
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    metricCard: {
        flex: 1,
        minWidth: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    metricCardDark: {
        backgroundColor: '#111827',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    metricLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 6,
    },
    metricLabelDark: {
        color: '#9CA3AF',
    },
    metricValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    metricValueDark: {
        color: '#F9FAFB',
    },
    metricSubtext: {
        fontSize: 12,
        color: '#6B7280',
    },
    metricSubtextDark: {
        color: '#9CA3AF',
    },
    infoCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    infoCardDark: {
        backgroundColor: '#111827',
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    infoLabelDark: {
        color: '#9CA3AF',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    infoValueDark: {
        color: '#F9FAFB',
    },
    tipsCard: {
        backgroundColor: '#FFFBEB',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    tipsCardDark: {
        backgroundColor: '#78350F',
        borderColor: '#92400E',
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#92400E',
    },
    tipsTitleDark: {
        color: '#FDE68A',
    },
    tipsList: {
        gap: 12,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        color: '#78350F',
    },
    tipTextDark: {
        color: '#FEF3C7',
    },
});
