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
  income: Array<{ label: string; amount: number }>;
  expenses: Array<{ label: string; amount: number }>;
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
  roi: number;
}

interface Portfolio {
  totalValue: number;
  totalInvested: number;
  totalReturns: number;
  assetsCount: number;
  investments: Investment[];
}

const propertyDetails: Property[] = [
  {
    id: '1',
    name: 'Lakeside Villa',
    type: 'Group',
    value: 80000,
    roi: 8.2,
    initialCost: 32000,
    appreciation: 150.0,
    description: 'Luxurious lakeside property with stunning water views and modern amenities. Perfect investment opportunity in a growing vacation rental market.',
    state: 'California',
    city: 'Lake Tahoe',
    country: 'USA',
    units: 1,
    yearBought: 2019,
    coordinates: { latitude: 39.0968, longitude: -120.0324 },
    income: [
      { label: 'Rental Income', amount: 24000 },
      { label: 'Parking Fees', amount: 1200 },
    ],
    expenses: [
      { label: 'Property Tax', amount: 3200 },
      { label: 'Maintenance', amount: 2400 },
      { label: 'Insurance', amount: 1800 },
      { label: 'HOA Fees', amount: 1200 },
    ],
    performanceData: {
      labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
      datasets: [{ data: [32000, 40000, 52000, 68000, 75000, 80000] }],
    },
  },
  {
    id: '2',
    name: 'Sunset Apartments',
    type: 'Personal',
    value: 50000,
    roi: -2.4,
    initialCost: 55000,
    appreciation: -9.1,
    description: 'Charming apartment complex in a transitioning neighborhood. Short-term market fluctuation expected to stabilize.',
    state: 'Texas',
    city: 'Austin',
    country: 'USA',
    units: 4,
    yearBought: 2021,
    coordinates: { latitude: 30.2672, longitude: -97.7431 },
    income: [
      { label: 'Rental Income', amount: 18000 },
      { label: 'Laundry Fees', amount: 800 },
    ],
    expenses: [
      { label: 'Property Tax', amount: 2800 },
      { label: 'Maintenance', amount: 3200 },
      { label: 'Insurance', amount: 1500 },
      { label: 'Utilities', amount: 2400 },
    ],
    performanceData: {
      labels: ['2021', '2022', '2023', '2024'],
      datasets: [{ data: [55000, 52000, 48000, 50000] }],
    },
  },
  {
    id: '3',
    name: 'City Towers',
    type: 'Group',
    value: 120000,
    roi: 5.7,
    initialCost: 95000,
    appreciation: 26.3,
    description: 'Prime commercial property in downtown district with excellent tenant mix and stable cash flow. Long-term growth potential.',
    state: 'New York',
    city: 'New York City',
    country: 'USA',
    units: 8,
    yearBought: 2020,
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    income: [
      { label: 'Rental Income', amount: 42000 },
      { label: 'Commercial Lease', amount: 8400 },
      { label: 'Parking Income', amount: 2400 },
    ],
    expenses: [
      { label: 'Property Tax', amount: 8500 },
      { label: 'Maintenance', amount: 4200 },
      { label: 'Insurance', amount: 3800 },
      { label: 'Management Fee', amount: 2800 },
    ],
    performanceData: {
      labels: ['2020', '2021', '2022', '2023', '2024'],
      datasets: [{ data: [95000, 102000, 110000, 115000, 120000] }],
    },
  },
];

const portfolio: Portfolio = {
  totalValue: 250000,
  totalInvested: 200000,
  totalReturns: 50000,
  assetsCount: 5,
  investments: [
    { id: '1', name: 'Lakeside Villa', type: 'Group', value: 80000, roi: 8.2 },
    { id: '2', name: 'Sunset Apartments', type: 'Personal', value: 50000, roi: -2.4 },
    { id: '3', name: 'City Towers', type: 'Group', value: 120000, roi: 5.7 },
  ],
};

const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString()}`;
};

const formatROI = (roi: number): string => {
  return `${roi > 0 ? '+' : ''}${roi.toFixed(1)}%`;
};

export default function PortfolioScreen() {
  const router = useRouter();

  const handleAddInvestment = () => {
    console.log('Add Investment pressed');
  };

  const handlePropertyPress = (investmentId: string) => {
    const property = propertyDetails.find(p => p.id === investmentId);
    if (property) {
      router.push({
        pathname: '/portfolio/portfoliodetails',
        params: { propertyData: JSON.stringify(property) },
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddInvestment}>
          <Text style={styles.addButtonText}>+ Add Investment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.overviewSection}>
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total Portfolio Value</Text>
            <Text style={styles.cardValue}>{formatCurrency(portfolio.totalValue)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Number of Assets</Text>
            <Text style={styles.cardValue}>{portfolio.assetsCount}</Text>
          </View>
        </View>
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total Invested</Text>
            <Text style={styles.cardValue}>{formatCurrency(portfolio.totalInvested)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total Returns</Text>
            <Text style={styles.cardValue}>{formatCurrency(portfolio.totalReturns)}</Text>
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
                <Text style={styles.investmentValue}>{formatCurrency(investment.value)}</Text>
                <View style={styles.roiContainer}>
                  <Ionicons
                    name={investment.roi > 0 ? 'arrow-up-outline' : 'arrow-down-outline'}
                    size={16}
                    color={investment.roi > 0 ? '#10B981' : '#EF4444'}
                  />
                  <Text
                    style={[
                      styles.roiText,
                      { color: investment.roi > 0 ? '#10B981' : '#EF4444' },
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
    paddingTop: 50,
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
    backgroundColor: '#3B82F6',
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
    fontSize: 24,
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
    fontSize: 16,
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
