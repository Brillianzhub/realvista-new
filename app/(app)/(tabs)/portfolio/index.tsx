import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useUserProperties from '@/hooks/portfolio/useUserProperty';
import { formatCurrency } from '@/utils/general/formatCurrency';

interface Income {
  amount: number | string;
  currency?: string;
  description?: string;
  label?: string;
}

interface Expense {
  amount: number | string;
  currency?: string;
  description?: string;
  label?: string;
}

export interface Property {
  id: string;
  name: string;
  type: 'Personal' | 'Group';
  value: number;
  roi: number;
  initialCost: number;
  appreciation: number;
  description: string;
  state: string;
  city: string;
  country: string;
  units: number;
  yearBought: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  incomes: Income[];
  expenses: Expense[];
  currency: string;
  performanceData: {
    labels: string[];
    datasets: Array<{ data: number[] }>;
  };
}

interface Investment {
  id: string;
  name: string;
  type: 'Personal' | 'Group';
  value: number;
  currency: string;
  roi: number;
}

interface Portfolio {
  totalValue: number;
  totalInvested: number;
  totalReturns: number;
  assetsCount: number;
  currency: string;
  investments: Investment[];
}




const formatROI = (roi: number): string => {
  return `${roi > 0 ? '+' : ''}${roi.toFixed(1)}%`;
};

export default function PortfolioScreen() {
  const router = useRouter();

  const { properties, loading, fetchUserProperties } = useUserProperties();

  const handleAddInvestment = () => {
    router.push('/(app)/(manage)');
  };

  const investments: Investment[] = properties.map((p: any) => ({
    id: p.id.toString(),
    name: p.title,
    currency: p.currency,
    type: p.group_property_id ? 'Group' : 'Personal',
    value: parseFloat(p.current_value),
    roi: p.roi ?? 0,
  }));


  const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);
  const assetsCount = investments.length;
  const totalInvested = properties.reduce(
    (sum, p) => sum + parseFloat(p.initial_cost || 0),
    0
  );
  const totalReturns = totalValue - totalInvested;
  const portfolioCurrency = investments[0]?.currency || 'NGN';

  const portfolio: Portfolio = {
    totalValue,
    totalInvested,
    totalReturns,
    assetsCount,
    currency: portfolioCurrency,
    investments,
  };

  const handlePropertyPress = (investmentId: string) => {
    // Find the matching property from the fetched data
    const property = properties.find((p: any) => p.id.toString() === investmentId);

    if (property) {
      router.push({
        pathname: '/portfolio/portfoliodetails',
        params: { propertyData: JSON.stringify(property) },
      });
    } else {
      console.warn('Property not found for ID:', investmentId);
    }
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        {/* <Text style={styles.headerTitle}>Portfolio</Text> */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddInvestment}>
          <Text style={styles.addButtonText}>+ Add Investment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.overviewSection}>
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total Portfolio Value</Text>
            <Text style={styles.cardValue}>{formatCurrency(portfolio.totalValue, portfolio.currency)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Number of Assets</Text>
            <Text style={styles.cardValue}>{portfolio.assetsCount}</Text>
          </View>
        </View>
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total Invested</Text>
            <Text style={styles.cardValue}>{formatCurrency(portfolio.totalInvested, portfolio.currency)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total Returns</Text>
            <Text style={styles.cardValue}>{formatCurrency(portfolio.totalReturns, portfolio.currency)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.investmentsSection}>
        <Text style={styles.sectionTitle}>Your Investments</Text>
        {portfolio.investments.map((investment, index) => (
          <View key={investment.id}>
            <TouchableOpacity
              style={styles.investmentItem}
              onPress={() => handlePropertyPress(investment.id)}
              activeOpacity={0.7}
            >
              <View style={styles.investmentInfo}>
                <Text style={styles.investmentName}>{investment.name}</Text>
                <Text style={styles.investmentType}>{investment.type}</Text>
              </View>
              <View style={styles.investmentStats}>
                <Text style={styles.investmentValue}>{formatCurrency(investment.value, portfolio.currency)}</Text>
                <View style={styles.roiContainer}>
                  <Ionicons
                    name={investment.roi > 0 ? 'arrow-up-outline' : 'arrow-down-outline'}
                    size={16}
                    color={investment.roi > 0 ? '#358B8B' : '#EF4444'}
                  />
                  <Text
                    style={[
                      styles.roiText,
                      { color: investment.roi > 0 ? '#358B8B' : '#EF4444' },
                    ]}
                  >
                    {formatROI(investment.roi)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            {index < portfolio.investments.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#358B8B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  overviewSection: {
    marginBottom: 32,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  investmentsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  investmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  investmentInfo: {
    flex: 1,
  },
  investmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  investmentType: {
    fontSize: 14,
    color: '#6B7280',
  },
  investmentStats: {
    alignItems: 'flex-end',
  },
  investmentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  roiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roiText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});
