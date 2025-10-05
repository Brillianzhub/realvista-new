import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { formatCurrency } from '@/utils/general/formatCurrency';
import usePortfolioDetail from '@/hooks/portfolio/usePortfolioDetail';

type Metrics = {
    totalInitialCost: number;
    totalCurrentValue: number;
    netAppreciation: number;
    totalValue: number;
    averageAppreciationPercentage: number;
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    roi: number;
};

const PortfolioDetails: React.FC = () => {
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const { result, loading, setLoading, currency, fetchPortfolioDetails } = usePortfolioDetail();

    const handleRefresh = (): void => {
        // Keep semantics similar to your previous code
        setLoading(true);
        fetchPortfolioDetails();
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#358B8B" />
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!result) {
        return (
            <View style={styles.centered}>
                <Text>No portfolio data available.</Text>
            </View>
        );
    }

    const renderCategoryDetails = (title: string, metrics?: Metrics | null): React.ReactElement => {
        if (!metrics) {
            return (
                <View style={styles.categoryContainer}>
                    <Text style={styles.categoryTitle}>{title}</Text>
                    <Text style={{ color: '#777' }}>No data available.</Text>
                </View>
            );
        }

        return (
            <View style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>{title}</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Total Initial Cost:</Text>
                    <Text style={[styles.value, { color: '#FB902E' }]}>{formatCurrency(metrics.totalInitialCost, currency)}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Total Current Value:</Text>
                    <Text style={[styles.value, { color: '#FB902E' }]}>{formatCurrency(metrics.totalCurrentValue, currency)}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Net Appreciation:</Text>
                    <Text style={[styles.value, { color: '#FB902E' }]}>{formatCurrency(metrics.netAppreciation, currency)}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Average Appreciation (%):</Text>
                    <Text style={[styles.value, { color: '#FB902E' }]}>{metrics.averageAppreciationPercentage}%</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Total Income:</Text>
                    <Text style={[styles.value, { color: '#FB902E' }]}>{formatCurrency(metrics.totalIncome, currency)}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Total Expenses:</Text>
                    <Text style={[styles.value, { color: '#FB902E' }]}>{formatCurrency(metrics.totalExpenses, currency)}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Net Cash Flow:</Text>
                    <Text style={[styles.value, { color: '#FB902E' }]}>{formatCurrency(metrics.netCashFlow, currency)}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>ROI (%):</Text>
                    <Text style={[styles.value, { color: '#FB902E' }]}>{metrics.roi}%</Text>
                </View>
            </View>
        );
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.title}>Portfolio Details</Text>

            {renderCategoryDetails('Personal Investment', result.personal_summary ?? null)}
            {renderCategoryDetails('Group Investment', result.group_summary ?? null)}
            {renderCategoryDetails('Overall Investment', result.overall_summary ?? null)}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    categoryContainer: {
        marginBottom: 30,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 10,
        color: '#358B8B',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
});

export default PortfolioDetails;
