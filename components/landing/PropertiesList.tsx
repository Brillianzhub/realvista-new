// components/PropertiesList.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useUserProperties from '@/hooks/portfolio/useUserProperty';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

// Brand colors
const BRAND = '#358B8B';
const BRAND_DARK = '#2A6F6F';
const BRAND_LIGHT = '#E6F4F4';

// ---------------- TYPES ----------------
interface PropertyUI {
  id: string;
  name: string;
  type: string;
  value: string;
  change: string;
  changePositive: boolean;
  iconBg: string;
  iconColor: string;
  icon: string;
  iconSet: 'ionicons' | 'material';
}

// ---------------- HELPERS ----------------
const capitalize = (text: string) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : '';

const formatCurrency = (value: string, currency: string) => {
  const num = parseFloat(value || '0');

  if (currency === 'NGN') {
    return `₦${(num / 1_000_000).toFixed(1)}M`;
  }
  if (currency === 'EUR') {
    return `€${(num / 1_000).toFixed(1)}K`;
  }
  if (currency === 'USD') {
    return `$${(num / 1_000).toFixed(1)}K`;
  }

  return `${num.toLocaleString()}`;
};

const getIconConfig = (type: string) => {
  // Using only valid Ionicons and MaterialCommunityIcons names
  const iconMap: Record<
    string,
    { icon: string; iconSet: 'ionicons' | 'material'; label: string }
  > = {
    house: { icon: 'home-outline', iconSet: 'ionicons', label: 'House' },
    apartment: { icon: 'apartment', iconSet: 'material', label: 'Apartment' },
    land: { icon: 'map-outline', iconSet: 'ionicons', label: 'Land' },
    commercial: {
      icon: 'business-outline',
      iconSet: 'ionicons',
      label: 'Commercial',
    },
    office: { icon: 'briefcase-outline', iconSet: 'ionicons', label: 'Office' },
    warehouse: {
      icon: 'business-outline',
      iconSet: 'ionicons',
      label: 'Warehouse',
    },
    shop: { icon: 'storefront-outline', iconSet: 'ionicons', label: 'Shop' },
    duplex: { icon: 'home-outline', iconSet: 'ionicons', label: 'Duplex' },
    bungalow: { icon: 'home-outline', iconSet: 'ionicons', label: 'Bungalow' },
    terrace: { icon: 'home-outline', iconSet: 'ionicons', label: 'Terrace' },
    semi_detached: {
      icon: 'home-outline',
      iconSet: 'ionicons',
      label: 'Semi-Detached',
    },
    detached: { icon: 'home-outline', iconSet: 'ionicons', label: 'Detached' },
    farm_land: {
      icon: 'leaf-outline',
      iconSet: 'ionicons',
      label: 'Farm Land',
    },
    industrial: {
      icon: 'hardware-chip-outline',
      iconSet: 'ionicons',
      label: 'Industrial',
    },
    short_let: { icon: 'bed-outline', iconSet: 'ionicons', label: 'Short Let' },
    studio: {
      icon: 'color-palette-outline',
      iconSet: 'ionicons',
      label: 'Studio',
    },
  };

  const config = iconMap[type] || {
    icon: 'business-outline',
    iconSet: 'ionicons',
    label: 'Property',
  };

  return {
    ...config,
    iconBg: BRAND_LIGHT,
    iconColor: BRAND,
  };
};

const mapProperty = (item: any): PropertyUI => {
  const isPositive = item.percentage_performance >= 0;
  const iconConfig = getIconConfig(item.property_type);

  return {
    id: String(item.id),
    name: item.title,
    type: `${iconConfig.label} · ${item.num_units || 0} ${item.num_units === 1 ? 'unit' : 'units'}`,
    value: formatCurrency(item.current_value, item.currency),
    change: `${isPositive ? '+' : ''}${item.percentage_performance?.toFixed(1) || 0}%`,
    changePositive: isPositive,
    ...iconConfig,
  };
};

// ---------------- PROPERTY CARD COMPONENT ----------------
const PropertyCard = ({
  property,
  index,
  isLast,
  colors,
}: {
  property: PropertyUI;
  index: number;
  isLast: boolean;
  colors: any;
}) => {
  const router = useRouter();

  const renderIcon = (property: PropertyUI) => {
    if (property.iconSet === 'ionicons') {
      return (
        <Ionicons
          name={property.icon as any}
          size={22}
          color={property.iconColor}
        />
      );
    }
    return (
      <MaterialCommunityIcons
        name={property.icon as any}
        size={22}
        color={property.iconColor}
      />
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/property/${property.id}` as any)}
    >
      <LinearGradient
        colors={[colors.background.secondary, colors.background.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.propertyCard,
          !isLast && styles.propertyCardMargin,
          {
            backgroundColor: colors.background.secondary,
            shadowColor: BRAND,
          },
        ]}
      >
        <View style={styles.propertyCardContent}>
          {/* Icon Section */}
          <View
            style={[styles.iconContainer, { backgroundColor: property.iconBg }]}
          >
            {renderIcon(property)}
          </View>

          {/* Info Section */}
          <View style={styles.propertyInfo}>
            <Text style={[styles.propertyName, { color: colors.text.primary }]}>
              {property.name}
            </Text>
            <Text
              style={[styles.propertyType, { color: colors.text.secondary }]}
            >
              {property.type}
            </Text>
          </View>

          {/* Value Section */}
          <View style={styles.valueContainer}>
            <Text
              style={[styles.propertyValue, { color: colors.text.primary }]}
            >
              {property.value}
            </Text>
            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor: property.changePositive
                    ? `${BRAND}15`
                    : '#FF3B3015',
                },
              ]}
            >
              <Text
                style={[
                  styles.change,
                  property.changePositive
                    ? styles.positiveChange
                    : styles.negativeChange,
                ]}
              >
                {property.changePositive ? '↑' : '↓'} {property.change}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ---------------- MAIN COMPONENT ----------------
const PropertiesList: React.FC = () => {
  const { properties: rawProperties, loading, refetch } = useUserProperties();
  const router = useRouter();
  const { colors } = useTheme();

  const properties: PropertyUI[] = useMemo(() => {
    if (!rawProperties) return [];
    return rawProperties
      .slice()
      .sort((a, b) => b.id - a.id)
      .slice(0, 3)
      .map(mapProperty);
  }, [rawProperties]);

  const allProperties: PropertyUI[] = useMemo(() => {
    if (!rawProperties) return [];
    return rawProperties
      .slice()
      .sort((a, b) => b.id - a.id)
      .map(mapProperty);
  }, [rawProperties]);

  // ---------------- LOADING STATE ----------------
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background.primary },
        ]}
      >
        <View style={styles.loadingContainer}>
          <View style={styles.loadingShimmer} />
          <View style={[styles.loadingShimmer, styles.loadingShimmerDelay]} />
          <View style={[styles.loadingShimmer, styles.loadingShimmerDelay2]} />
        </View>
      </View>
    );
  }

  // ---------------- EMPTY STATE ----------------
  if (!allProperties.length) {
    return null;
  }

  // ---------------- UI ----------------
  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      {/* Header Section */}

      {/* Recent Properties Section */}
      <View style={styles.recentSection}>
        <View style={styles.header}>
          <Text style={[styles.recentTitle, { color: colors.text.secondary }]}>
            Recent Properties
          </Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => router.push('/(app)/(tabs)/properties' as any)}
          >
            <Text style={[styles.viewAll, { color: BRAND }]}>See All</Text>
            <Ionicons name="arrow-forward" size={14} color={BRAND} />
          </TouchableOpacity>
        </View>

        {properties.map((property, index) => (
          <PropertyCard
            key={property.id}
            property={property}
            index={index}
            isLast={index === properties.length - 1}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );
};

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 13,
  },

  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },

  recentSection: {
    marginBottom: 24,
  },

  recentTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },

  propertyCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  propertyCardMargin: {
    marginBottom: 12,
  },

  propertyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  propertyInfo: {
    flex: 1,
  },

  propertyName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },

  propertyType: {
    fontSize: 12,
  },

  valueContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },

  propertyValue: {
    fontSize: 15,
    fontWeight: '600',
  },

  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },

  change: {
    fontSize: 11,
    fontWeight: '600',
  },

  positiveChange: {
    color: BRAND,
  },

  negativeChange: {
    color: '#FF3B30',
  },

  allPropertiesSection: {
    marginBottom: 20,
  },

  horizontalScrollContent: {
    gap: 12,
    paddingRight: 16,
  },

  horizontalCard: {
    width: 140,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  horizontalIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  horizontalCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },

  horizontalCardValue: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },

  horizontalCardChange: {
    fontSize: 11,
    fontWeight: '600',
  },

  viewAllPropertiesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },

  viewAllPropertiesText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Loading states
  loadingContainer: {
    gap: 12,
  },

  loadingShimmer: {
    height: 80,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
    opacity: 0.3,
  },

  loadingShimmerDelay: {
    opacity: 0.2,
  },

  loadingShimmerDelay2: {
    opacity: 0.1,
  },

  // Empty state
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },

  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: BRAND_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },

  addPropertyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },

  addPropertyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  addPropertyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PropertiesList;
