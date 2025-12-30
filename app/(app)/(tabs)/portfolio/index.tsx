import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  useColorScheme,
  Modal,
  Animated,
  TouchableWithoutFeedback,
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
  const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');
  const [showYearModal, setShowYearModal] = useState(false);
  const [filterAnimation] = useState(new Animated.Value(0));

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

  const propertiesByYear = useMemo(() => {
    return properties.reduce<Record<number, typeof properties>>((acc, p) => {
      const year = p.year_bought;
      if (!acc[year]) acc[year] = [];
      acc[year].push(p);
      return acc;
    }, {});
  }, [properties]);

  const availableYears = useMemo(() => {
    return Object.keys(propertiesByYear)
      .map(Number)
      .sort((a, b) => b - a);
  }, [propertiesByYear]);

  const filteredProperties = useMemo(() => {
    if (selectedYear === 'All') return properties;
    return propertiesByYear[selectedYear] ?? [];
  }, [selectedYear, properties, propertiesByYear]);

  const investments: Investment[] = filteredProperties.map((p: any) => ({
    id: p.id.toString(),
    name: p.title,
    currency: p.currency,
    type: p.group_property_id ? 'Group' : 'Personal',
    value: parseFloat(p.current_value),
    roi: p.percentage_performance ?? 0,
  }));

  const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);
  const assetsCount = investments.length;
  const totalInvested = filteredProperties.reduce(
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
    const property = filteredProperties.find(
      (p: any) => p.id.toString() === investmentId
    );

    if (property) {
      router.push({
        pathname: '/portfolio/portfoliodetails',
        params: { propertyData: JSON.stringify(property), id: investmentId },
      });
    } else {
      console.warn('Property not found for ID:', investmentId);
    }
  };

  const handleFilterPress = () => {
    setShowYearModal(true);
    Animated.spring(filterAnimation, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseModal = () => {
    Animated.timing(filterAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowYearModal(false));
  };

  const handleYearSelect = (year: number | 'All') => {
    setSelectedYear(year);
    handleCloseModal();
  };

  const modalTranslateY = filterAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const modalOpacity = filterAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const renderYearModal = () => (
    <Modal
      transparent
      visible={showYearModal}
      animationType="none"
      onRequestClose={handleCloseModal}
    >
      <TouchableWithoutFeedback onPress={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.modalContent,
            { 
              transform: [{ translateY: modalTranslateY }],
              opacity: modalOpacity 
            }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                Filter by Year
              </Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.modalYearOption,
                  selectedYear === 'All' && styles.modalYearOptionSelected,
                  isDark && styles.modalYearOptionDark,
                ]}
                onPress={() => handleYearSelect('All')}
              >
                <Text style={[
                  styles.modalYearText,
                  selectedYear === 'All' && styles.modalYearTextSelected,
                  isDark && styles.modalYearTextDark,
                ]}>
                  All Years
                </Text>
                {selectedYear === 'All' && (
                  <Ionicons name="checkmark" size={20} color="#358B8B" />
                )}
              </TouchableOpacity>
              
              <View style={[styles.divider, isDark && styles.dividerDark]} />
              
              {availableYears.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.modalYearOption,
                    selectedYear === year && styles.modalYearOptionSelected,
                    isDark && styles.modalYearOptionDark,
                  ]}
                  onPress={() => handleYearSelect(year)}
                >
                  <Text style={[
                    styles.modalYearText,
                    selectedYear === year && styles.modalYearTextSelected,
                    isDark && styles.modalYearTextDark,
                  ]}>
                    {year}
                  </Text>
                  <View style={styles.yearPropertyCount}>
                    <Text style={[
                      styles.yearCountText,
                      selectedYear === year && styles.yearCountTextSelected,
                      isDark && styles.yearCountTextDark,
                    ]}>
                      {propertiesByYear[year]?.length || 0}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#358B8B" />
        }
      >
        {renderEmptyState()}
      </ScrollView>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, isDark && styles.containerDark]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
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
          
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.filterButton, isDark && styles.filterButtonDark]}
              onPress={handleFilterPress}
              activeOpacity={0.7}
            >
              <View style={styles.filterButtonContent}>
                <Ionicons 
                  name="filter" 
                  size={18} 
                  color={isDark ? '#358B8B' : '#358B8B'} 
                />
                <Text style={[
                  styles.filterButtonText,
                  isDark && styles.filterButtonTextDark
                ]}>
                  {selectedYear === 'All' ? 'Filter' : selectedYear}
                </Text>
              </View>
              
              {selectedYear !== 'All' && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleAddInvestment}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#358B8B', '#2C7070']}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
              {selectedYear !== 'All' && ` (${selectedYear})`}
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
      
      {renderYearModal()}
    </>
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
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  filterButtonDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterButtonTextDark: {
    color: '#D1D5DB',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#358B8B',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F9FAFB',
  },
  filterBadgeDark: {
    borderColor: '#1F2937',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  addButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#358B8B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalTitleDark: {
    color: '#F9FAFB',
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalYearOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalYearOptionDark: {
    borderBottomColor: '#374151',
  },
  modalYearOptionSelected: {
    backgroundColor: '#F0FDFA',
  },
  modalYearText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  modalYearTextDark: {
    color: '#D1D5DB',
  },
  modalYearTextSelected: {
    color: '#0F766E',
    fontWeight: '600',
  },
  yearPropertyCount: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  yearCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  yearCountTextDark: {
    color: '#9CA3AF',
  },
  yearCountTextSelected: {
    color: '#0F766E',
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
    fontWeight: '600',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  sectionTitleDark: {
    color: '#F9FAFB',
  },
  countBadge: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countBadgeDark: {
    backgroundColor: '#134E4A',
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: '700',
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 15,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeGroup: {
    backgroundColor: '#FEF3C7',
  },
  typeBadgeDark: {
    backgroundColor: '#202125ff',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
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