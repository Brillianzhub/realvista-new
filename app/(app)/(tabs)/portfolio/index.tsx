import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { properties, loading, refetch } = useUserProperties();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAddInvestment = () => {
    router.push('/(app)/(manage)');
  };

  const investments: Investment[] = properties.map((p: any) => ({
    id: p.id.toString(),
    name: p.title,
    currency: p.currency,
    type: p.group_property_id ? 'Group' : 'Personal',
    value: parseFloat(p.current_value),
    roi: p.percentage_performance ?? 0,
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

  const renderEmptyState = () => (
    <View style={[styles.emptyContainer, isDark && styles.emptyContainerDark]}>
      <LinearGradient
        colors={isDark ? ['#1F2937', '#111827'] : ['#F0FDFA', '#FFFFFF']}
        style={styles.emptyGradient}
      >
        <View style={[styles.emptyIconContainer, isDark && styles.emptyIconContainerDark]}>
          <Ionicons name="briefcase-outline" size={60} color="#358B8B" />
        </View>

        <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
          Build Your Property Portfolio
        </Text>

        <Text style={[styles.emptySubtitle, isDark && styles.emptySubtitleDark]}>
          Start tracking your real estate investments and grow your wealth with confidence
        </Text>

        <View style={[styles.benefitsCard, isDark && styles.benefitsCardDark]}>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="trending-up" size={24} color="#358B8B" />
            </View>
            <View style={styles.benefitText}>
              <Text style={[styles.benefitTitle, isDark && styles.benefitTitleDark]}>
                Track Performance
              </Text>
              <Text style={[styles.benefitDescription, isDark && styles.benefitDescriptionDark]}>
                Monitor ROI and appreciation over time
              </Text>
            </View>
          </View>

          <View style={styles.benefitDivider} />

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="analytics" size={24} color="#358B8B" />
            </View>
            <View style={styles.benefitText}>
              <Text style={[styles.benefitTitle, isDark && styles.benefitTitleDark]}>
                Financial Insights
              </Text>
              <Text style={[styles.benefitDescription, isDark && styles.benefitDescriptionDark]}>
                Get detailed reports on income and expenses
              </Text>
            </View>
          </View>

          <View style={styles.benefitDivider} />

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#358B8B" />
            </View>
            <View style={styles.benefitText}>
              <Text style={[styles.benefitTitle, isDark && styles.benefitTitleDark]}>
                Secure Records
              </Text>
              <Text style={[styles.benefitDescription, isDark && styles.benefitDescriptionDark]}>
                Keep all your property data safe in one place
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.emptyButton} onPress={handleAddInvestment}>
          <LinearGradient
            colors={['#358B8B', '#2C7070']}
            style={styles.emptyButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.emptyButtonText}>Add Your First Property</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, isDark && styles.secondaryButtonDark]}
          onPress={() => router.push('/(app)/(learn)')}
        >
          <Ionicons name="book-outline" size={20} color="#358B8B" />
          <Text style={styles.secondaryButtonText}>Learn About Real Estate Investing</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  if (properties.length === 0 && !loading) {
    return (
      <ScrollView
        style={[styles.container, isDark && styles.containerDark]}
        contentContainerStyle={styles.emptyScrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#358B8B" />
        }
      >
        {renderEmptyState()}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#358B8B" />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>My Portfolio</Text>
          <Text style={[styles.headerSubtitle, isDark && styles.headerSubtitleDark]}>
            Track your real estate investments
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddInvestment}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.overviewSection}>
        <View style={styles.cardsRow}>
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.cardHeader}>
              <Ionicons name="wallet" size={20} color="#358B8B" />
            </View>
            <Text style={[styles.cardLabel, isDark && styles.cardLabelDark]}>
              Total Portfolio Value
            </Text>
            <Text style={[styles.cardValue, isDark && styles.cardValueDark]}>
              {formatCurrency(portfolio.totalValue, portfolio.currency)}
            </Text>
          </View>
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.cardHeader}>
              <Ionicons name="business" size={20} color="#358B8B" />
            </View>
            <Text style={[styles.cardLabel, isDark && styles.cardLabelDark]}>Number of Assets</Text>
            <Text style={[styles.cardValue, isDark && styles.cardValueDark]}>
              {portfolio.assetsCount}
            </Text>
          </View>
        </View>
        <View style={styles.cardsRow}>
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.cardHeader}>
              <Ionicons name="cash" size={20} color="#358B8B" />
            </View>
            <Text style={[styles.cardLabel, isDark && styles.cardLabelDark]}>Total Invested</Text>
            <Text style={[styles.cardValue, isDark && styles.cardValueDark]}>
              {formatCurrency(portfolio.totalInvested, portfolio.currency)}
            </Text>
          </View>
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="trending-up"
                size={20}
                color={portfolio.totalReturns >= 0 ? '#10B981' : '#EF4444'}
              />
            </View>
            <Text style={[styles.cardLabel, isDark && styles.cardLabelDark]}>Total Returns</Text>
            <Text
              style={[
                styles.cardValue,
                isDark && styles.cardValueDark,
                { color: portfolio.totalReturns >= 0 ? '#10B981' : '#EF4444' },
              ]}
            >
              {formatCurrency(portfolio.totalReturns, portfolio.currency)}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.investmentsSection, isDark && styles.investmentsSectionDark]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Your Investments
          </Text>
          <View style={[styles.countBadge, isDark && styles.countBadgeDark]}>
            <Text style={[styles.countBadgeText, isDark && styles.countBadgeTextDark]}>
              {portfolio.investments.length}
            </Text>
          </View>
        </View>

        {portfolio.investments.map((investment, index) => (
          <View key={investment.id}>
            <TouchableOpacity
              style={styles.investmentItem}
              onPress={() => handlePropertyPress(investment.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.investmentIcon, isDark && styles.investmentIconDark]}>
                <Ionicons name="home" size={24} color="#358B8B" />
              </View>
              <View style={styles.investmentInfo}>
                <Text style={[styles.investmentName, isDark && styles.investmentNameDark]}>
                  {investment.name}
                </Text>
                <View style={styles.investmentMeta}>
                  <View
                    style={[
                      styles.typeBadge,
                      investment.type === 'Group' && styles.typeBadgeGroup,
                      isDark && styles.typeBadgeDark,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        investment.type === 'Group' && styles.typeBadgeTextGroup,
                      ]}
                    >
                      {investment.type}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.investmentStats}>
                <Text style={[styles.investmentValue, isDark && styles.investmentValueDark]}>
                  {formatCurrency(investment.value, portfolio.currency)}
                </Text>
                <View style={styles.roiContainer}>
                  <Ionicons
                    name={investment.roi > 0 ? 'arrow-up' : 'arrow-down'}
                    size={14}
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
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#9CA3AF' : '#D1D5DB'} />
            </TouchableOpacity>
            {index < portfolio.investments.length - 1 && (
              <View style={[styles.divider, isDark && styles.dividerDark]} />
            )}
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
  containerDark: {
    backgroundColor: '#111827',
  },
  contentContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  emptyScrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerTitleDark: {
    color: '#F9FAFB',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerSubtitleDark: {
    color: '#9CA3AF',
  },
  addButton: {
    backgroundColor: '#358B8B',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#358B8B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  overviewSection: {
    marginBottom: 24,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1F2937',
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  cardLabelDark: {
    color: '#9CA3AF',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cardValueDark: {
    color: '#F9FAFB',
  },
  investmentsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  investmentsSectionDark: {
    backgroundColor: '#1F2937',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionTitleDark: {
    color: '#F9FAFB',
  },
  countBadge: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeDark: {
    backgroundColor: '#134E4A',
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F766E',
  },
  countBadgeTextDark: {
    color: '#5EEAD4',
  },
  investmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  investmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  investmentIconDark: {
    backgroundColor: '#134E4A',
  },
  investmentInfo: {
    flex: 1,
  },
  investmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  investmentNameDark: {
    color: '#F9FAFB',
  },
  investmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeGroup: {
    backgroundColor: '#FEF3C7',
  },
  typeBadgeDark: {
    backgroundColor: '#1E3A8A',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
  },
  typeBadgeTextGroup: {
    color: '#92400E',
  },
  investmentStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  investmentValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  investmentValueDark: {
    color: '#F9FAFB',
  },
  roiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roiText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  dividerDark: {
    backgroundColor: '#374151',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  emptyContainerDark: {
    backgroundColor: '#111827',
  },
  emptyGradient: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#358B8B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyIconContainerDark: {
    backgroundColor: '#134E4A',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyTitleDark: {
    color: '#F9FAFB',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  emptySubtitleDark: {
    color: '#9CA3AF',
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  benefitsCardDark: {
    backgroundColor: '#1F2937',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    flex: 1,
    paddingTop: 4,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  benefitTitleDark: {
    color: '#F9FAFB',
  },
  benefitDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  benefitDescriptionDark: {
    color: '#9CA3AF',
  },
  benefitDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  emptyButton: {
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 12,
    shadowColor: '#358B8B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#F0FDFA',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  secondaryButtonDark: {
    backgroundColor: '#134E4A',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#358B8B',
  },
});
