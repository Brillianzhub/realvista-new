import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AddTargetModal from '@/components/modals/AddTargetModal';
import EditTargetModal from '@/components/modals/EditTargetModal';
import AddContributionModal from '@/components/modals/AddContributionModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


interface SavingsTarget {
    id: number;
    target_name: string;
    target_amount: string;
    current_savings: string;
    currency: string;
    timeframe: number;
    start_date: string;
    end_date: string;
    achieved_at: string | null;
    created_at: string;
    updated_at: string;
    user: number;
    minimum_monthly_contribution: number;
    months_remaining: number;
    progress_percentage: number;
    remaining_amount: number;
    contributions: any[];
}

export default function SavingsTab() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [targets, setTargets] = useState<SavingsTarget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [contributionModalVisible, setContributionModalVisible] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState<SavingsTarget | null>(null);

    useEffect(() => {
        fetchTargets();
    }, []);

    const fetchTargets = async () => {
        try {
            setIsLoading(true);

            const token = await AsyncStorage.getItem('authToken');

            if (!token) {
                setTargets([]);
                return;
            }

            const response = await fetch(
                'https://www.realvistamanagement.com/analyser/financial-targets/',
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch targets');
            }

            const data = await response.json();
            console.log('Fetched targets:', data);

            setTargets(data || []);
        } catch (error) {
            console.error('Error fetching targets:', error);
            Alert.alert('Error', 'Failed to load savings targets.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTarget = async (targetId: number) => {
        Alert.alert('Delete Target', 'Are you sure you want to delete this savings target?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {

                        const token = await AsyncStorage.getItem('authToken');

                        if (!token) {
                            Alert.alert('Error', 'Authentication required');
                            return;
                        }

                        const response = await fetch(
                            `https://www.realvistamanagement.com/analyser/financial-targets/${targetId}/`,
                            {
                                method: 'DELETE',
                                headers: {
                                    Authorization: `Token ${token}`,
                                    'Content-Type': 'application/json',
                                },
                            }
                        );

                        if (!response.ok) {
                            throw new Error('Failed to delete target');
                        }

                        Alert.alert('Success', 'Target deleted successfully!');
                        fetchTargets();
                    } catch (error) {
                        console.error('Error deleting target:', error);
                        Alert.alert('Error', 'Failed to delete target.');
                    }
                },
            },
        ]);
    };

    const handleEditTarget = (target: SavingsTarget) => {
        setSelectedTarget(target);
        setEditModalVisible(true);
    };

    const handleAddContribution = (target: SavingsTarget) => {
        setSelectedTarget(target);
        setContributionModalVisible(true);
    };

    const formatCurrency = (amount: string | number, currency: string): string => {
        const symbols: Record<string, string> = {
            NGN: '₦',
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            CAD: '$',
            AUD: '$',
            CHF: 'Fr',
        };
        const symbol = symbols[currency] || currency;
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return `${symbol}${numAmount.toLocaleString()}`;
    };

    const filteredTargets = targets.filter((target) => {
        if (filter === 'all') return true;
        if (filter === 'completed') return target.achieved_at !== null;
        return target.achieved_at === null;
    });

    const getProgressGradient = (progress: number) => {
        if (progress >= 80) return ['#10B981', '#059669'];
        if (progress >= 50) return ['#F59E0B', '#D97706'];
        return ['#3B82F6', '#2563EB'];
    };

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <View style={[styles.header, isDark && styles.headerDark]}>
                <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
                    My Savings Targets
                </Text>
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
                        onPress={() => setFilter('active')}
                    >
                        <Text
                            style={[
                                styles.filterButtonText,
                                filter === 'active' && styles.filterButtonTextActive,
                            ]}
                        >
                            Active
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
                        onPress={() => setFilter('completed')}
                    >
                        <Text
                            style={[
                                styles.filterButtonText,
                                filter === 'completed' && styles.filterButtonTextActive,
                            ]}
                        >
                            Completed
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                        onPress={() => setFilter('all')}
                    >
                        <Text
                            style={[
                                styles.filterButtonText,
                                filter === 'all' && styles.filterButtonTextActive,
                            ]}
                        >
                            All
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FB902E" />
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredTargets.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="wallet-outline" size={64} color="#D1D5DB" />
                            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                                No savings targets yet
                            </Text>
                            <Text style={[styles.emptySubtext, isDark && styles.emptySubtextDark]}>
                                Start by creating your first savings goal
                            </Text>
                        </View>
                    ) : (
                        filteredTargets.map((target, index) => {
                            const gradientColors = getProgressGradient(target.progress_percentage);

                            return (
                                <Animated.View
                                    key={target.id}
                                    entering={FadeInDown.delay(index * 100)}
                                    style={[styles.targetCard, isDark && styles.targetCardDark]}
                                >
                                    <View style={styles.targetHeader}>
                                        <View style={styles.targetTitleContainer}>
                                            <Ionicons name="flag" size={20} color="#FB902E" />
                                            <Text style={[styles.targetName, isDark && styles.targetNameDark]}>
                                                {target.target_name}
                                            </Text>
                                        </View>
                                        <View style={styles.targetActions}>
                                            <TouchableOpacity onPress={() => handleEditTarget(target)}>
                                                <Ionicons
                                                    name="create-outline"
                                                    size={20}
                                                    color={isDark ? '#9CA3AF' : '#6B7280'}
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeleteTarget(target.id)}>
                                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.targetAmounts}>
                                        <View>
                                            <Text style={[styles.amountLabel, isDark && styles.amountLabelDark]}>
                                                Current Savings
                                            </Text>
                                            <Text style={[styles.amountValue, isDark && styles.amountValueDark]}>
                                                {formatCurrency(target.current_savings, target.currency)}
                                            </Text>
                                        </View>
                                        <View style={styles.targetGoal}>
                                            <Text style={[styles.amountLabel, isDark && styles.amountLabelDark]}>
                                                Target
                                            </Text>
                                            <Text style={[styles.amountValue, isDark && styles.amountValueDark]}>
                                                {formatCurrency(target.target_amount, target.currency)}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.progressContainer}>
                                        <View style={[styles.progressBar, isDark && styles.progressBarDark]}>
                                            <LinearGradient
                                                colors={["#ff0000", "#00ff00"]}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={[styles.progressFill, { width: `${target.progress_percentage}%` }]}
                                            />
                                        </View>
                                        <Text style={[styles.progressText, isDark && styles.progressTextDark]}>
                                            {target.progress_percentage.toFixed(1)}%
                                        </Text>
                                    </View>

                                    <View style={styles.targetFooter}>
                                        <View style={styles.footerItem}>
                                            <Ionicons
                                                name="time-outline"
                                                size={16}
                                                color={isDark ? '#9CA3AF' : '#6B7280'}
                                            />
                                            <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
                                                {target.months_remaining} {target.months_remaining === 1 ? 'month' : 'months'} left
                                            </Text>
                                        </View>
                                        {target.achieved_at !== null && (
                                            <View style={styles.completedBadge}>
                                                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                                <Text style={styles.completedText}>Completed</Text>
                                            </View>
                                        )}
                                    </View>

                                    {target.achieved_at === null && (
                                        <TouchableOpacity
                                            style={styles.addContributionButton}
                                            onPress={() => handleAddContribution(target)}
                                        >
                                            <LinearGradient
                                                colors={['#FB902E', '#F97316']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.addContributionGradient}
                                            >
                                                <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                                                <Text style={styles.addContributionText}>Add Contribution</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    )}
                                </Animated.View>
                            );
                        })
                    )}
                </ScrollView>
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setAddModalVisible(true)}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#FB902E', '#F97316']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={28} color="#FFFFFF" />
                </LinearGradient>
            </TouchableOpacity>

            <AddTargetModal
                visible={addModalVisible}
                onClose={() => {
                    setAddModalVisible(false);
                    fetchTargets();
                }}
            />

            {selectedTarget && (
                <>
                    <EditTargetModal
                        visible={editModalVisible}
                        target={selectedTarget}
                        onClose={() => {
                            setEditModalVisible(false);
                            setSelectedTarget(null);
                            fetchTargets();
                        }}
                    />
                    <AddContributionModal
                        visible={contributionModalVisible}
                        targetId={selectedTarget.id}
                        targetName={selectedTarget.target_name}
                        currency={selectedTarget.currency}
                        onClose={() => {
                            setContributionModalVisible(false);
                            setSelectedTarget(null);
                            fetchTargets();
                        }}
                    />
                </>
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
        padding: 20,
        paddingTop: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerDark: {
        backgroundColor: '#1F2937',
        borderBottomColor: '#374151',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    headerTitleDark: {
        color: '#F9FAFB',
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    filterButtonActive: {
        backgroundColor: '#FB902E',
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterButtonTextActive: {
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
    },
    emptyTextDark: {
        color: '#9CA3AF',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },
    emptySubtextDark: {
        color: '#6B7280',
    },
    targetCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    targetCardDark: {
        backgroundColor: '#1F2937',
    },
    targetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    targetTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    targetName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
    },
    targetNameDark: {
        color: '#F9FAFB',
    },
    targetActions: {
        flexDirection: 'row',
        gap: 12,
    },
    targetAmounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    targetGoal: {
        alignItems: 'flex-end',
    },
    amountLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    amountLabelDark: {
        color: '#9CA3AF',
    },
    amountValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    amountValueDark: {
        color: '#F9FAFB',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarDark: {
        backgroundColor: '#374151',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        minWidth: 45,
        textAlign: 'right',
    },
    progressTextDark: {
        color: '#9CA3AF',
    },
    targetFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        fontSize: 12,
        color: '#6B7280',
    },
    footerTextDark: {
        color: '#9CA3AF',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    completedText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10B981',
    },
    addContributionButton: {
        marginTop: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    addContributionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
    },
    addContributionText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        borderRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
