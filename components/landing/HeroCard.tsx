// components/landing/HeroCard.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useHeroCard } from '@/hooks/landing/useHeroCard';
import QuickStats from '@/components/landing/QuickStats';

const CARD_PADDING = 16;
const CARD_MARGIN_H = 16;
const BRAND = '#358B8B';
const BRAND_DARK = '#2A6F6F';

// ── Formatters ────────────────────────────────────────────────────────────────
const formatNGN = (value: number, compact = false): string => {
  if (compact) {
    if (value >= 1_000_000_000)
      return `₦${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `₦${(value / 1_000).toFixed(0)}K`;
    return `₦${value.toFixed(0)}`;
  }
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCurrency = (
  value: number,
  currency: string,
  compact = false,
): string => {
  if (currency === 'NGN') return formatNGN(value, compact);
  if (compact) {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// ── Empty portfolio state ─────────────────────────────────────────────────────
const EmptyPortfolio: React.FC = () => {
  const router = useRouter();
  return (
    <LinearGradient
      colors={[BRAND_DARK, BRAND]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Decorative rings */}
      <View style={styles.emptyRingOuter} pointerEvents="none" />
      <View style={styles.emptyRingInner} pointerEvents="none" />

      <View style={styles.emptyContent}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="business-outline" size={34} color="#FFFFFF" />
        </View>

        <Text style={styles.emptyTitle}>No Portfolio Found</Text>
        <Text style={styles.emptyBody}>
          You don't have any properties in your portfolio yet.{'\n'}
          Add your first property now and track{'\n'}
          the value of your investments.
        </Text>

        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => router.push('/(app)/(manage)')}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={17} color={BRAND} />
          <Text style={styles.emptyBtnText}>Add First Property</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const HeroCard: React.FC = () => {
  const { data, loading, error, refetch } = useHeroCard();
  const [valVisible, setValVisible] = useState(true);

  const mask = (s: string) => s.replace(/[0-9.,]/g, '•');

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <LinearGradient
        colors={[BRAND_DARK, BRAND]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, styles.cardCenter]}
      >
        <ActivityIndicator color="#fff" size="small" />
        <Text style={styles.statusText}>Loading portfolio…</Text>
      </LinearGradient>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <LinearGradient
        colors={[BRAND_DARK, BRAND]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, styles.cardCenter]}
      >
        <Ionicons name="alert-circle-outline" size={26} color="#fff" />
        <Text style={styles.statusText}>{error ?? 'No data available'}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={refetch}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // ── Empty portfolio (new user) ─────────────────────────────────────────────
  if (data.total_properties === 0) {
    return <EmptyPortfolio />;
  }

  // ── Derived values (all DRF fields are strings) ────────────────────────────
  const currency = data.currency ?? 'NGN';
  const totalValue = parseFloat(data.total_current_value) || 0;
  const appreciationPct = parseFloat(data.appreciation_percentage) || 0;
  const monthlyIncome = parseFloat(data.monthly_income) || 0;
  const totalAppreciation = parseFloat(data.total_appreciation) || 0;
  const occupancyRate = parseFloat(data.occupancy_rate) || 0;

  const totalValueStr = formatCurrency(totalValue, currency);
  const monthlyStr = formatCurrency(monthlyIncome, currency, true);
  const appreciationStr = formatCurrency(totalAppreciation, currency, true);
  const pctStr = `${appreciationPct >= 0 ? '+' : ''}${appreciationPct.toFixed(1)}%`;
  const arrow = appreciationPct >= 0 ? '↑' : '↓';
  const pctColor = appreciationPct >= 0 ? '#9FE1CB' : '#FFB3AF';

  return (
    <>
      <LinearGradient
        colors={[BRAND_DARK, BRAND]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.label}>Total Portfolio Value</Text>
          <TouchableOpacity
            onPress={() => setValVisible((v) => !v)}
            style={styles.eyeButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={valVisible ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color="#E0F0F0"
            />
          </TouchableOpacity>
        </View>

        {/* Big value */}
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
          {valVisible ? totalValueStr : mask(totalValueStr)}
        </Text>

        {/* Sub-row */}
        <View style={styles.subRow}>
          <Text style={[styles.pctText, { color: pctColor }]}>
            {arrow} {valVisible ? pctStr : '••••'} this year
          </Text>
          <Text style={styles.secondaryText}>
            · {valVisible ? monthlyStr : mask(monthlyStr)}/mo
          </Text>
        </View>

        {/* Highlight cards */}
        <View style={styles.highlightsContainer}>
          <View style={styles.highlightCard}>
            <Ionicons name="business-outline" size={20} color="#E0F0F0" />
            <Text style={styles.highlightValue}>
              {valVisible ? data.total_properties : '••'}
            </Text>
            <Text style={styles.highlightLabel}>Properties</Text>
          </View>

          <View style={styles.highlightCard}>
            <Ionicons name="people-outline" size={20} color="#E0F0F0" />
            <Text style={styles.highlightValue}>
              {valVisible ? `${occupancyRate.toFixed(0)}%` : '••%'}
            </Text>
            <Text style={styles.highlightLabel}>Occupancy</Text>
          </View>

          <View style={styles.highlightCard}>
            <Ionicons
              name={
                appreciationPct >= 0
                  ? 'trending-up-outline'
                  : 'trending-down-outline'
              }
              size={20}
              color={pctColor}
            />
            <Text style={[styles.highlightValue, { color: pctColor }]}>
              {valVisible ? pctStr : '•••'}
            </Text>
            <Text style={styles.highlightLabel}>Growth</Text>
          </View>

          <View style={styles.highlightCard}>
            <Ionicons name="cash-outline" size={20} color="#E0F0F0" />
            <Text style={styles.highlightValue}>
              {valVisible ? appreciationStr : mask(appreciationStr)}
            </Text>
            <Text style={styles.highlightLabel}>Appreciation</Text>
          </View>
        </View>

        {/* Metrics row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Purchase Price</Text>
            <Text style={styles.metricValue}>
              {valVisible
                ? formatCurrency(
                    parseFloat(data.total_initial_cost) || 0,
                    currency,
                    true,
                  )
                : '••••'}
            </Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Occupied</Text>
            <Text style={styles.metricValue}>
              {valVisible ? data.occupied_count : '••'}
            </Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Total Gain</Text>
            <Text style={styles.metricValue}>
              {valVisible ? appreciationStr : mask(appreciationStr)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    marginHorizontal: CARD_MARGIN_H,
    marginTop: 20,
    marginBottom: 0,
    borderRadius: 20,
    paddingTop: CARD_PADDING,
    paddingHorizontal: CARD_PADDING,
    paddingBottom: CARD_PADDING,
    overflow: 'hidden',
  },
  cardCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    gap: 10,
  },

  // ── Loading / error ────────────────────────────────────────────────────────
  statusText: {
    fontSize: 13,
    color: '#E0F0F0',
    marginTop: 4,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 20,
  },
  retryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  // ── Empty state ────────────────────────────────────────────────────────────
  emptyRingOuter: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    top: -40,
    right: -50,
  },
  emptyRingInner: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    top: -10,
    right: -10,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 8,
    gap: 10,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  emptyBody: {
    fontSize: 13,
    color: '#C8E8E8',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: BRAND,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    color: '#E0F0F0',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  eyeButton: { padding: 4, marginRight: -4 },

  // ── Values ────────────────────────────────────────────────────────────────
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  pctText: { fontSize: 13, fontWeight: '600' },
  secondaryText: { fontSize: 13, color: '#E0F0F0', fontWeight: '500' },

  // ── Highlights ────────────────────────────────────────────────────────────
  highlightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 5,
  },
  highlightValue: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  highlightLabel: {
    fontSize: 9,
    color: '#E0F0F0',
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // ── Metrics row ───────────────────────────────────────────────────────────
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metricItem: { flex: 1, alignItems: 'center' },
  metricLabel: {
    fontSize: 10,
    color: '#E0F0F0',
    opacity: 0.7,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metricValue: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});

export default HeroCard;
