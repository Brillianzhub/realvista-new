import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import MapView, { Marker } from 'react-native-maps';
import { Property } from './index';

const screenWidth = Dimensions.get('window').width;

const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString()}`;
};

const formatROI = (roi: number): string => {
    return `${roi > 0 ? '+' : ''}${roi.toFixed(1)}%`;
};

export default function PropertyDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const property: Property = JSON.parse(params.propertyData as string);

    const totalIncome = property.income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = property.expenses.reduce((sum, item) => sum + item.amount, 0);
    const netReturn = totalIncome - totalExpenses;

    const getAppreciationInsight = () => {
        if (property.appreciation > 100) {
            return `The property has appreciated strongly by ${property.appreciation.toFixed(2)}%, indicating strong growth.`;
        } else if (property.appreciation > 20) {
            return `The property has shown solid appreciation of ${property.appreciation.toFixed(2)}%, performing well in the market.`;
        } else if (property.appreciation > 0) {
            return `The property has appreciated modestly by ${property.appreciation.toFixed(2)}%, showing stable growth.`;
        } else {
            return `The property has depreciated by ${Math.abs(property.appreciation).toFixed(2)}%, but market conditions may improve.`;
        }
    };

    const handleListForSale = () => {
        router.push({
            pathname: '/market',
            params: { propertyData: JSON.stringify(property) },
        });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={24} color="#111827" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.propertyName}>{property.name}</Text>
                    <View style={styles.headerStats}>
                        <Text style={styles.currentValue}>{formatCurrency(property.value)}</Text>
                        <View style={styles.roiContainer}>
                            <Ionicons
                                name={property.roi > 0 ? 'arrow-up-outline' : 'arrow-down-outline'}
                                size={18}
                                color={property.roi > 0 ? '#10B981' : '#EF4444'}
                            />
                            <Text
                                style={[
                                    styles.roiText,
                                    { color: property.roi > 0 ? '#10B981' : '#EF4444' },
                                ]}
                            >
                                {formatROI(property.roi)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Performance Overview</Text>
                <View style={styles.performanceCards}>
                    <View style={styles.perfCard}>
                        <Text style={styles.perfLabel}>Initial Cost</Text>
                        <Text style={styles.perfValue}>{formatCurrency(property.initialCost)}</Text>
                    </View>
                    <View style={styles.perfCard}>
                        <Text style={styles.perfLabel}>Appreciation</Text>
                        <Text
                            style={[
                                styles.perfValue,
                                { color: property.appreciation > 0 ? '#10B981' : '#EF4444' },
                            ]}
                        >
                            {property.appreciation.toFixed(1)}%
                        </Text>
                    </View>
                    <View style={styles.perfCard}>
                        <Text style={styles.perfLabel}>ROI</Text>
                        <Text
                            style={[
                                styles.perfValue,
                                { color: property.roi > 0 ? '#10B981' : '#EF4444' },
                            ]}
                        >
                            {property.roi.toFixed(1)}%
                        </Text>
                    </View>
                </View>
                <Text style={styles.insightText}>{getAppreciationInsight()}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Graphical Performance</Text>
                <View style={styles.chartContainer}>
                    <LineChart
                        data={property.performanceData}
                        width={screenWidth - 48}
                        height={220}
                        chartConfig={{
                            backgroundColor: '#FFFFFF',
                            backgroundGradientFrom: '#FFFFFF',
                            backgroundGradientTo: '#FFFFFF',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                            style: {
                                borderRadius: 16,
                            },
                            propsForDots: {
                                r: '4',
                                strokeWidth: '2',
                                stroke: '#3B82F6',
                            },
                        }}
                        bezier
                        style={styles.chart}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Income & Expenses</Text>
                <View style={styles.financeContainer}>
                    <View style={styles.financeColumn}>
                        <Text style={styles.financeHeader}>Income</Text>
                        {property.income.map((item, index) => (
                            <View key={index} style={styles.financeRow}>
                                <Text style={styles.financeLabel}>{item.label}</Text>
                                <Text style={styles.financeAmount}>{formatCurrency(item.amount)}</Text>
                            </View>
                        ))}
                        <View style={[styles.financeRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total Income</Text>
                            <Text style={styles.totalAmount}>{formatCurrency(totalIncome)}</Text>
                        </View>
                    </View>

                    <View style={styles.financeColumn}>
                        <Text style={styles.financeHeader}>Expenses</Text>
                        {property.expenses.map((item, index) => (
                            <View key={index} style={styles.financeRow}>
                                <Text style={styles.financeLabel}>{item.label}</Text>
                                <Text style={styles.financeAmount}>{formatCurrency(item.amount)}</Text>
                            </View>
                        ))}
                        <View style={[styles.financeRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total Expenses</Text>
                            <Text style={styles.totalAmount}>{formatCurrency(totalExpenses)}</Text>
                        </View>
                    </View>

                    <View style={[styles.netReturnContainer, netReturn > 0 ? styles.positiveNet : styles.negativeNet]}>
                        <Text style={styles.netReturnLabel}>Net Return</Text>
                        <Text style={[styles.netReturnValue, { color: netReturn > 0 ? '#10B981' : '#EF4444' }]}>
                            {formatCurrency(netReturn)}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Property Information</Text>
                <View style={styles.infoCard}>
                    <Text style={styles.description}>{property.description}</Text>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Location</Text>
                            <Text style={styles.infoValue}>
                                {property.city}, {property.state}, {property.country}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Number of Units</Text>
                            <Text style={styles.infoValue}>{property.units}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Year Bought</Text>
                            <Text style={styles.infoValue}>{property.yearBought}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Investment Type</Text>
                            <Text style={styles.infoValue}>{property.type}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Location</Text>
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: property.coordinates.latitude,
                            longitude: property.coordinates.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                    >
                        <Marker
                            coordinate={{
                                latitude: property.coordinates.latitude,
                                longitude: property.coordinates.longitude,
                            }}
                            title={property.name}
                            description={`${property.city}, ${property.state}`}
                        />
                    </MapView>
                </View>
            </View>

            <View style={styles.ctaSection}>
                <TouchableOpacity style={styles.listButton} onPress={handleListForSale}>
                    <Text style={styles.listButtonText}>List Property for Sale</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        marginBottom: 16,
    },
    headerInfo: {
        gap: 8,
    },
    propertyName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    currentValue: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
    },
    roiContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    roiText: {
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    performanceCards: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    perfCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    perfLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
    },
    perfValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    insightText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
        fontStyle: 'italic',
    },
    chartContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    chart: {
        borderRadius: 16,
    },
    financeContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    financeColumn: {
        marginBottom: 20,
    },
    financeHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    financeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    financeLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    financeAmount: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        marginTop: 8,
        paddingTop: 12,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    totalAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    netReturnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    positiveNet: {
        backgroundColor: '#D1FAE5',
    },
    negativeNet: {
        backgroundColor: '#FEE2E2',
    },
    netReturnLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    netReturnValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    description: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
        marginBottom: 16,
    },
    infoGrid: {
        gap: 12,
    },
    infoItem: {
        gap: 4,
    },
    infoLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '600',
    },
    mapContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    map: {
        width: '100%',
        height: 250,
    },
    ctaSection: {
        padding: 16,
        paddingBottom: 32,
    },
    listButton: {
        backgroundColor: '#14B8A6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    listButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
