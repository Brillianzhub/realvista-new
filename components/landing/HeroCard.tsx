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
import Svg, {
  Line,
  Polyline,
  Polygon,
  Circle,
  Text as SvgText,
} from 'react-native-svg';
import { useHeroCard, ChartPoint } from '@/hooks/landing/useHeroCard';
import QuickStats from '@/components/landing/QuickStats';

// ── Layout constants ──────────────────────────────────────────────────────────
const CARD_PADDING = 16;
const CARD_MARGIN_H = 16;
const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth - CARD_MARGIN_H * 2;
const chartWidth = cardWidth - CARD_PADDING * 2;
const chartHeight = 100;
const leftPadding = 44;
const plotWidth = chartWidth - leftPadding;

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

// ── Chart geometry ────────────────────────────────────────────────────────────
interface SvgPoint {
  x: number;
  y: number;
}

interface ChartGeometry {
  svgPoints: SvgPoint[];
  linePoints: string;
  areaPoints: string;
  gridMin: number;
  gridMax: number;
}

const buildChartGeometry = (chartData: ChartPoint[]): ChartGeometry => {
  const values = chartData.map((p) => parseFloat(p.value) || 0);
  const gridMin = Math.min(...values);
  const gridMax = Math.max(...values);
  const range = gridMax - gridMin || 1;
  const n = chartData.length;

  const svgPoints: SvgPoint[] = values.map((val, i) => ({
    x: leftPadding + (i / Math.max(n - 1, 1)) * plotWidth,
    y: chartHeight - ((val - gridMin) / range) * chartHeight,
  }));

  const linePoints = svgPoints
    .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(' ');

  const areaPoints = [
    ...svgPoints.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`),
    `${svgPoints[svgPoints.length - 1].x.toFixed(2)},${chartHeight}`,
    `${svgPoints[0].x.toFixed(2)},${chartHeight}`,
  ].join(' ');

  return { svgPoints, linePoints, areaPoints, gridMin, gridMax };
};

// ── Component ─────────────────────────────────────────────────────────────────
const HeroCard: React.FC = () => {
  const { data, loading, error, refetch } = useHeroCard();
  const [valVisible, setValVisible] = useState(true);

  const mask = (s: string) => s.replace(/[0-9.,]/g, '•');

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <LinearGradient
          colors={[BRAND_DARK, BRAND]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, styles.cardCenter]}
        >
          <ActivityIndicator color="#fff" size="small" />
          <Text style={styles.statusText}>Loading portfolio…</Text>
        </LinearGradient>
      </>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <>
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
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </LinearGradient>
      </>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const currency = data.currency ?? 'NGN';
  const totalValue = parseFloat(data.total_current_value) || 0;
  const appreciationPct = parseFloat(data.appreciation_percentage) || 0;
  const monthlyIncome = parseFloat(data.monthly_income) || 0;

  const totalValueStr = formatCurrency(totalValue, currency);
  const monthlyStr = formatCurrency(monthlyIncome, currency, true);
  const pctStr = `${appreciationPct >= 0 ? '+' : ''}${appreciationPct.toFixed(1)}%`;
  const arrow = appreciationPct >= 0 ? '↑' : '↓';
  const pctColor = appreciationPct >= 0 ? '#9FE1CB' : '#FFB3AF';

  // ── Chart ──────────────────────────────────────────────────────────────────
  const { svgPoints, linePoints, areaPoints, gridMin, gridMax } =
    buildChartGeometry(data.chart_data);

  const gridYPositions = [0, 33, 66, 100];
  const yPixelToValue = (yPx: number) =>
    gridMin + (1 - yPx / chartHeight) * (gridMax - gridMin);

  const lastPt = svgPoints[svgPoints.length - 1];

  return (
    // Wrap both card and QuickStats in a fragment so they flow together
    <>
      <LinearGradient
        colors={[BRAND_DARK, BRAND]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.label}>Total portfolio value</Text>
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

        {/* Chart */}
        <View style={styles.chartWrapper}>
          <Svg
            height={chartHeight + 20}
            width={chartWidth + CARD_PADDING}
            viewBox={`0 0 ${chartWidth + CARD_PADDING} ${chartHeight + 20}`}
          >
            {gridYPositions.map((yPx) => (
              <React.Fragment key={yPx}>
                <Line
                  x1={leftPadding}
                  y1={yPx}
                  x2={chartWidth + CARD_PADDING}
                  y2={yPx}
                  stroke="#FFFFFF"
                  strokeOpacity="0.13"
                  strokeWidth="0.8"
                  strokeDasharray="3,4"
                />
                <SvgText
                  x={0}
                  y={yPx === 0 ? 9 : yPx + 4}
                  fontSize="8"
                  fill="#FFFFFF"
                  fillOpacity="0.65"
                  textAnchor="start"
                >
                  {valVisible
                    ? formatCurrency(yPixelToValue(yPx), currency, true)
                    : '••••'}
                </SvgText>
              </React.Fragment>
            ))}

            <Polygon points={areaPoints} fill={BRAND} fillOpacity="0.35" />

            <Polyline
              points={linePoints}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            <Circle
              cx={lastPt.x}
              cy={lastPt.y}
              r="5"
              fill="#FFFFFF"
              fillOpacity="0.25"
            />
            <Circle cx={lastPt.x} cy={lastPt.y} r="3" fill="#FFFFFF" />

            {/* X-axis year labels — show all, yearly data is always sparse */}
            {data.chart_data.map((pt, idx) => {
              const x =
                leftPadding +
                (idx / Math.max(data.chart_data.length - 1, 1)) * plotWidth;
              return (
                <SvgText
                  key={idx}
                  x={x}
                  y={chartHeight + 14}
                  fontSize="8.5"
                  fill="#FFFFFF"
                  fillOpacity="0.7"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {pt.month}
                </SvgText>
              );
            })}
          </Svg>
        </View>
      </LinearGradient>

      {/* Stats rendered outside and below the card */}
      <QuickStats />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: CARD_MARGIN_H,
    marginVertical: 20,
    marginBottom: 0, // QuickStats provides its own marginBottom: 16
    borderRadius: 20,
    paddingTop: CARD_PADDING,
    paddingHorizontal: CARD_PADDING,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  cardCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    gap: 10,
  },
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
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
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
  eyeButton: {
    padding: 4,
    marginRight: -4,
  },
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
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  pctText: {
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryText: {
    fontSize: 13,
    color: '#E0F0F0',
    fontWeight: '500',
  },
  chartWrapper: {
    marginLeft: -CARD_PADDING / 8,
  },
});

export default HeroCard;
