import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import {
  getProPackages,
  subscribeToPro,
  restoreProSubscription,
} from '@/utils/subscriptions/proSubscription';
import { usePro } from '@/context/ProProvider';
import { PurchasesPackage } from 'react-native-purchases';

export default function ProPaywallScreen() {
  const router = useRouter();
  const { refreshProStatus } = usePro();
  const { colors } = useTheme();

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const pkgs = await getProPackages();
      setPackages(pkgs);
      if (pkgs.length > 0) {
        setSelectedPackage(pkgs[0].identifier);
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to load subscription options');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (pkg: PurchasesPackage) => {
    try {
      setPurchasing(true);
      const info = await subscribeToPro(pkg);

      if (info.entitlements.active['pro']) {
        await refreshProStatus();
        Alert.alert('Success', 'You are now a Pro user 🎉');
        router.back();
      }
    } catch (e: any) {
      if (!e?.userCancelled) {
        Alert.alert('Purchase Failed', 'Please try again');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      const info = await restoreProSubscription();

      if (info.entitlements.active['pro']) {
        await refreshProStatus();
        Alert.alert('Restored', 'Your Pro subscription has been restored');
        router.back();
      } else {
        Alert.alert('No Subscription', 'No active Pro subscription found');
      }
    } catch {
      Alert.alert('Error', 'Failed to restore purchases');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const getPackageType = (pkg: PurchasesPackage) => {
    const identifier = pkg.identifier.toLowerCase();
    if (identifier.includes('month')) return 'Monthly';
    if (identifier.includes('year')) return 'Yearly';
    if (identifier.includes('week')) return 'Weekly';
    return 'Subscription';
  };

  const formatPricePerMonth = (priceString: string, packageType: string) => {
    const price = parseFloat(priceString.replace(/[^0-9.]/g, ''));
    if (packageType === 'Yearly') {
      return `$${(price / 12).toFixed(2)}/month`;
    }
    return null;
  };

  if (loading) {
    return (
      <View
        style={[styles.center, { backgroundColor: colors.background.primary }]}
      >
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          Loading subscription options...
        </Text>
      </View>
    );
  }

  const proFeatures = [
    'Unlimited portfolio properties',
    'List properties on marketplace',
    'Priority customer support',
    'Advanced analytics dashboard',
    'Custom property reports',
    'No advertising',
    'Early access to new features',
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Upgrade to Pro
          </Text>
          <View style={styles.emptySpacer} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.badge, { backgroundColor: '#FB902E' + '20' }]}>
            <Ionicons name="sparkles" size={20} color="#FB902E" />
            <Text style={[styles.badgeText, { color: '#FB902E' }]}>
              Most Popular
            </Text>
          </View>

          <Text style={[styles.heroTitle, { color: colors.text.primary }]}>
            Unlock Professional Features
          </Text>

          <Text style={[styles.heroSubtitle, { color: colors.text.secondary }]}>
            Get access to all premium tools and features
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresCard}>
          <Text style={[styles.featuresTitle, { color: colors.text.primary }]}>
            Everything you get with Pro
          </Text>

          <View style={styles.featuresList}>
            {proFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: '#10B981' + '20' },
                  ]}
                >
                  <Ionicons name="checkmark" size={16} color="#10B981" />
                </View>
                <Text
                  style={[styles.featureText, { color: colors.text.secondary }]}
                >
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing Plans */}
        <View style={styles.pricingSection}>
          <Text style={[styles.pricingTitle, { color: colors.text.primary }]}>
            Choose your plan
          </Text>

          {packages.map((pkg, index) => {
            const packageType = getPackageType(pkg);
            const monthlyPrice = formatPricePerMonth(
              pkg.product.priceString,
              packageType
            );
            const isSelected = selectedPackage === pkg.identifier;

            return (
              <TouchableOpacity
                key={pkg.identifier}
                style={[
                  styles.planCard,
                  isSelected && styles.selectedPlanCard,
                  isSelected && { borderColor: '#FB902E' },
                  {
                    borderColor: colors.border.default,
                    backgroundColor: colors.background.secondary,
                  },
                ]}
                onPress={() => setSelectedPackage(pkg.identifier)}
                activeOpacity={0.8}
                disabled={purchasing}
              >
                {index === 0 && (
                  <View
                    style={[
                      styles.recommendedBadge,
                      { backgroundColor: '#FB902E' },
                    ]}
                  >
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View style={styles.planTypeContainer}>
                    <Text
                      style={[styles.planType, { color: colors.text.primary }]}
                    >
                      {packageType}
                    </Text>
                    {monthlyPrice && (
                      <Text
                        style={[
                          styles.monthlyPrice,
                          { color: colors.text.secondary },
                        ]}
                      >
                        {monthlyPrice}
                      </Text>
                    )}
                  </View>

                  <View style={styles.radioButton}>
                    {isSelected && (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: '#FB902E' },
                        ]}
                      />
                    )}
                  </View>
                </View>

                <Text
                  style={[styles.planPrice, { color: colors.text.primary }]}
                >
                  {pkg.product.priceString}
                </Text>

                <Text
                  style={[
                    styles.planDescription,
                    { color: colors.text.secondary },
                  ]}
                >
                  {pkg.product.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {selectedPackage && (
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() =>
                handleSubscribe(
                  packages.find((p) => p.identifier === selectedPackage)!
                )
              }
              disabled={purchasing}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FB902E', '#FFA726']}
                style={styles.subscribeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {purchasing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="lock-open" size={20} color="white" />
                    <Text style={styles.subscribeButtonText}>Upgrade Now</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={purchasing}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color={colors.text.secondary} />
            <Text
              style={[styles.restoreText, { color: colors.text.secondary }]}
            >
              Restore Purchase
            </Text>
          </TouchableOpacity>

          <Text style={[styles.footerText, { color: colors.text.secondary }]}>
            Subscription automatically renews unless canceled 24 hours before
            the end of the current period.
          </Text>

          <TouchableOpacity
            style={styles.termsButton}
            onPress={() =>
              Alert.alert('Terms', 'Link to terms and privacy policy')
            }
            activeOpacity={0.7}
          >
            <Text style={[styles.termsText, { color: colors.text.muted }]}>
              Terms • Privacy • Cancel anytime
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySpacer: {
    width: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 24,
  },
  pricingSection: {
    marginBottom: 32,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    marginBottom: 12,
    position: 'relative',
  },
  selectedPlanCard: {
    borderWidth: 2,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planTypeContainer: {
    flex: 1,
  },
  planType: {
    fontSize: 18,
    fontWeight: '700',
  },
  monthlyPrice: {
    fontSize: 14,
    marginTop: 4,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionSection: {
    gap: 16,
  },
  subscribeButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FB902E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  subscribeGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  restoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  restoreText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  termsButton: {
    paddingVertical: 8,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
