// app/analytics.tsx
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Dimensions,
  RefreshControl,
} from 'react-native';
import Svg, {
  Rect,
  Line,
  Text as SvgText,
  TSpan,
  G,
  Circle,
  Path,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import {
  useAnalytics,
  AnalyticsPeriod,
  PortfolioMixItem,
  PropertyPerformanceItem,
  MonthlyIncomePoint,
} from '@/hooks/analytics/useAnalytics';
import { useTheme } from '@/context/ThemeContext';

const { width: SCREEN_W } = Dimensions.get('window');
const H_PAD = 20;

// Brand colors
const BRAND = '#358B8B';
const BRAND_DARK = '#2A6F6F';
const BRAND_LIGHT = '#E6F4F4';
const BRAND_LIGHTER = '#9FD1D1';
const ACCENT = '#FFA726'; // Keeping accent as a complementary color

// ── Formatters ────────────────────────────────────────────────────────────────
const fmt = (
  value: string | number,
  currency: string,
  compact = false,
): string => {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '—';
  const sym = currency === 'NGN' ? '₦' : '$';
  if (compact) {
    if (n >= 1_000_000_000) return `${sym}${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${sym}${(n / 1_000).toFixed(1)}K`;
    return `${sym}${n.toFixed(0)}`;
  }
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency === 'NGN' ? 'NGN' : currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};

const fmtPct = (v: string, showSign = true): string => {
  const n = parseFloat(v);
  if (isNaN(n)) return '—';
  return `${showSign && n > 0 ? '+' : ''}${n.toFixed(1)}%`;
};

// ── Period selector ────────────────────────────────────────────────────────────
const PERIODS: AnalyticsPeriod[] = ['1Y', '3Y', '5Y'];

const PeriodSelector = ({
  value,
  onChange,
  isDark,
  colors,
}: {
  value: AnalyticsPeriod;
  onChange: (p: AnalyticsPeriod) => void;
  isDark: boolean;
  colors: any;
}) => (
  <View
    style={[
      styles.periodRow,
      {
        backgroundColor:
          colors.background.tertiary || colors.background.secondary,
      },
      isDark && styles.periodRowDark,
    ]}
  >
    {PERIODS.map((p) => (
      <TouchableOpacity
        key={p}
        style={[styles.periodPill, p === value && styles.periodPillActive]}
        onPress={() => onChange(p)}
        activeOpacity={0.75}
      >
        <Text
          style={[
            styles.periodPillText,
            p === value && styles.periodPillTextActive,
          ]}
        >
          {p}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ── KPI card ──────────────────────────────────────────────────────────────────
const KPICard = ({
  label,
  value,
  delta,
  deltaLabel,
  isDark,
  invertDelta = false,
  colors,
}: {
  label: string;
  value: string;
  delta: string;
  deltaLabel: string;
  isDark: boolean;
  invertDelta?: boolean;
  colors: any;
}) => {
  const deltaNum = parseFloat(delta);
  const isPositive = invertDelta ? deltaNum <= 0 : deltaNum >= 0;
  const deltaColor = isPositive ? BRAND : '#E24B4A';
  const arrow = deltaNum >= 0 ? '↑' : '↓';

  return (
    <View
      style={[
        styles.kpiCard,
        {
          backgroundColor: colors.background.secondary,
          borderColor: colors.border?.default || colors.border,
        },
        isDark && styles.kpiCardDark,
      ]}
    >
      <Text style={[styles.kpiLabel, isDark && styles.kpiLabelDark]}>
        {label}
      </Text>
      <Text style={[styles.kpiValue, isDark && styles.kpiValueDark]}>
        {value}
      </Text>
      <Text style={[styles.kpiDelta, { color: deltaColor }]}>
        {arrow} {deltaLabel}
      </Text>
    </View>
  );
};

// ── Bar chart ─────────────────────────────────────────────────────────────────
const BarChart = ({
  data,
  currency,
  isDark,
  containerWidth,
}: {
  data: MonthlyIncomePoint[];
  currency: string;
  isDark: boolean;
  containerWidth: number;
}) => {
  if (!data.length) return null;

  const BAR_CHART_H = 140;
  const BAR_CHART_W = containerWidth - 32; // Subtract section padding (16px on each side)
  const BAR_LEFT_PAD = 46;
  const BAR_BOTTOM_PAD = 22;
  const BAR_PLOT_W = BAR_CHART_W - BAR_LEFT_PAD - 8;
  const BAR_PLOT_H = BAR_CHART_H - BAR_BOTTOM_PAD - 8;

  const allVals = data.flatMap((d) => [
    parseFloat(d.rental),
    parseFloat(d.other_income),
  ]);
  const maxVal = Math.max(...allVals, 1);
  const gridLines = 4;
  const groupW = BAR_PLOT_W / data.length;
  const barW = Math.min(groupW * 0.32, 14);
  const gap = barW * 0.4;
  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const tickColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  return (
    <Svg width={BAR_CHART_W} height={BAR_CHART_H}>
      {/* Grid lines + Y labels */}
      {Array.from({ length: gridLines + 1 }, (_, i) => {
        const y = 8 + (BAR_PLOT_H * (gridLines - i)) / gridLines;
        const val = (maxVal * i) / gridLines;
        return (
          <G key={i}>
            <Line
              x1={BAR_LEFT_PAD}
              y1={y}
              x2={BAR_CHART_W - 4}
              y2={y}
              stroke={gridColor}
              strokeWidth="1"
            />
            <SvgText
              x={BAR_LEFT_PAD - 4}
              y={y + 3.5}
              fontSize="9"
              fill={tickColor}
              textAnchor="end"
            >
              {fmt(val, currency, true)}
            </SvgText>
          </G>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const rental = parseFloat(d.rental);
        const other = parseFloat(d.other_income);
        const cx = BAR_LEFT_PAD + i * groupW + groupW / 2;
        const rH = (rental / maxVal) * BAR_PLOT_H;
        const oH = (other / maxVal) * BAR_PLOT_H;
        const baseY = 8 + BAR_PLOT_H;

        return (
          <G key={i}>
            {/* Rental bar */}
            <Rect
              x={cx - gap / 2 - barW}
              y={baseY - rH}
              width={barW}
              height={Math.max(rH, 1)}
              rx="3"
              fill={BRAND}
            />
            {/* Other income bar */}
            <Rect
              x={cx + gap / 2}
              y={baseY - oH}
              width={barW}
              height={Math.max(oH, 1)}
              rx="3"
              fill={BRAND_LIGHTER}
            />
            {/* X label */}
            <SvgText
              x={cx}
              y={BAR_CHART_H - 4}
              fontSize="9"
              fill={tickColor}
              textAnchor="middle"
            >
              {d.month}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};

// ── Donut chart ───────────────────────────────────────────────────────────────
const DONUT_COLORS = [
  BRAND,
  BRAND_LIGHT,
  '#7F77DD',
  ACCENT,
  '#E24B4A',
  '#4A90D9',
];
const DONUT_R = 44;
const DONUT_CX = 58;
const DONUT_CY = 58;
const STROKE = 18;

const polarToXY = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeArc = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToXY(cx, cy, r, endAngle);
  const end = polarToXY(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
};

const DonutChart = ({
  mix,
  totalValue,
  currency,
  isDark,
  colors,
}: {
  mix: PortfolioMixItem[];
  totalValue: string;
  currency: string;
  isDark: boolean;
  colors: any;
}) => {
  let currentAngle = 0;

  return (
    <View style={styles.mixRow}>
      {/* Donut */}
      <View style={styles.donutWrap}>
        <Svg width={116} height={116} viewBox="0 0 116 116">
          {mix.map((item, i) => {
            const pct = parseFloat(item.percentage);
            const sweep = (pct / 100) * 360;
            const path = describeArc(
              DONUT_CX,
              DONUT_CY,
              DONUT_R,
              currentAngle,
              currentAngle + sweep,
            );
            currentAngle += sweep;
            return (
              <Path
                key={i}
                d={path}
                stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                strokeWidth={STROKE}
                fill="none"
                strokeLinecap="butt"
              />
            );
          })}
          {/* Centre label - Fixed positioning to prevent overlap */}
          <SvgText
            x={DONUT_CX}
            y={DONUT_CY - 10} // start a bit higher
            textAnchor="middle"
          >
            {/* COUNT */}
            <TSpan
              x={DONUT_CX}
              dy="0"
              fontSize="12"
              fontWeight="700"
              fill={isDark ? BRAND_LIGHTER : BRAND}
            >
              {mix.reduce((s, m) => s + m.count, 0)}
            </TSpan>

            {/* LABEL */}
            <TSpan x={DONUT_CX} dy="12" fontSize="9" fill="#8E8E93">
              props
            </TSpan>

            {/* VALUE */}
            <TSpan
              x={DONUT_CX}
              dy="14"
              fontSize="11"
              fontWeight="700"
              fill={isDark ? '#E8F5F5' : BRAND_DARK}
            >
              {fmt(totalValue, currency, true)}
            </TSpan>
          </SvgText>
        </Svg>
      </View>

      {/* Legend + progress bars */}
      <View style={styles.mixLegend}>
        {mix.map((item, i) => (
          <View key={i} style={styles.mixLegendItem}>
            <View style={styles.mixLabelRow}>
              <Text
                style={[styles.mixLabelText, isDark && styles.mixLabelTextDark]}
                numberOfLines={1}
              >
                {item.property_type}
              </Text>
              <Text
                style={[styles.mixPctText, isDark && styles.mixPctTextDark]}
              >
                {fmtPct(item.percentage, false)}
              </Text>
            </View>
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: colors.background.tertiary || '#E8F0F0' },
                isDark && styles.progressTrackDark,
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${parseFloat(item.percentage)}%`,
                    backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length],
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// ── Performance table ─────────────────────────────────────────────────────────
const PerformanceTable = ({
  data,
  currency,
  isDark,
  colors,
}: {
  data: PropertyPerformanceItem[];
  currency: string;
  isDark: boolean;
  colors: any;
}) => (
  <View>
    {/* Header */}
    <View
      style={[
        styles.tableHeader,
        { borderBottomColor: colors.border?.default || colors.border },
      ]}
    >
      <Text
        style={[
          styles.tableHeaderCell,
          { flex: 2 },
          isDark && styles.tableHeaderCellDark,
        ]}
      >
        Property
      </Text>
      <Text
        style={[
          styles.tableHeaderCell,
          styles.tableRight,
          isDark && styles.tableHeaderCellDark,
        ]}
      >
        Value
      </Text>
      <Text
        style={[
          styles.tableHeaderCell,
          styles.tableRight,
          isDark && styles.tableHeaderCellDark,
        ]}
      >
        Return
      </Text>
    </View>

    {data.map((item, i) => {
      const returnNum = parseFloat(item.return_pct);
      const returnColor = returnNum >= 0 ? BRAND : '#E24B4A';
      return (
        <View
          key={item.id}
          style={[
            styles.tableRow,
            isDark && styles.tableRowDark,
            i < data.length - 1 && styles.tableRowBorder,
            i < data.length - 1 && {
              borderBottomColor: colors.border?.default || colors.border,
            },
          ]}
        >
          <View style={{ flex: 2 }}>
            <Text
              style={[styles.tableCell, isDark && styles.tableCellDark]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              style={[styles.tableCellSub, isDark && styles.tableCellSubDark]}
            >
              {item.property_type}
            </Text>
          </View>
          <Text
            style={[
              styles.tableCell,
              styles.tableRight,
              isDark && styles.tableCellDark,
            ]}
          >
            {fmt(item.current_value, currency, true)}
          </Text>
          <Text
            style={[
              styles.tableCell,
              styles.tableRight,
              { color: returnColor, fontWeight: '600' },
            ]}
          >
            {fmtPct(item.return_pct)}
          </Text>
        </View>
      );
    })}
  </View>
);

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({
  title,
  right,
  children,
  isDark,
  colors,
  onLayout,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  isDark: boolean;
  colors: any;
  onLayout?: (event: any) => void;
}) => (
  <View
    onLayout={onLayout}
    style={[
      styles.section,
      {
        backgroundColor: colors.background.secondary,
        borderColor: colors.border?.default || colors.border,
      },
    ]}
  >
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
        {title}
      </Text>
      {right}
    </View>
    {children}
  </View>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = ({ isDark, colors }: { isDark: boolean; colors: any }) => (
  <ScrollView
    style={{ flex: 1 }}
    contentContainerStyle={{ padding: H_PAD, gap: 14 }}
  >
    {[200, 160, 220, 180].map((h, i) => (
      <View
        key={i}
        style={{
          height: h,
          borderRadius: 16,
          backgroundColor: colors.background.secondary,
        }}
      />
    ))}
  </ScrollView>
);

// ── Main screen ───────────────────────────────────────────────────────────────
export default function AnalyticsScreen() {
  const isDark = useColorScheme() === 'dark';
  const [sectionWidth, setSectionWidth] = React.useState(SCREEN_W - H_PAD * 2);

  const { colors } = useTheme();
  const { data, loading, error, period, setPeriod, refetch } =
    useAnalytics('1Y');

  const bg = colors.background.primary;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <View
          style={[
            styles.topBar,
            {
              backgroundColor: colors.background.primary,
              borderBottomColor: colors.border?.default || colors.border,
            },
            isDark && styles.topBarDark,
          ]}
        >
          <Text style={[styles.pageTitle, isDark && styles.pageTitleDark]}>
            Analytics
          </Text>
          <PeriodSelector
            value={period}
            onChange={setPeriod}
            isDark={isDark}
            colors={colors}
          />
        </View>
        <Skeleton isDark={isDark} colors={colors} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View
        style={[styles.container, styles.centered, { backgroundColor: bg }]}
      >
        <View
          style={[
            styles.stateIconRing,
            { borderColor: isDark ? '#3B1F1F' : '#FDDCDC' },
          ]}
        >
          <Ionicons name="alert-circle-outline" size={30} color="#E24B4A" />
        </View>
        <Text style={[styles.stateTitle, isDark && styles.pageTitleDark]}>
          {error ?? 'No data available'}
        </Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={refetch}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    kpis,
    monthly_income_chart,
    portfolio_mix,
    property_performance,
    currency,
    total_portfolio_value,
  } = data;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Top bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.background.primary,
            borderBottomColor: colors.border?.default || colors.border,
          },
          isDark && styles.topBarDark,
        ]}
      >
        <View>
          <View style={styles.accentBar} />
          <Text style={[styles.pageTitle, isDark && styles.pageTitleDark]}>
            Analytics
          </Text>
        </View>
        <PeriodSelector
          value={period}
          onChange={setPeriod}
          isDark={isDark}
          colors={colors}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
            tintColor={BRAND}
            colors={[BRAND]}
          />
        }
      >
        {/* ── KPI grid ─────────────────────────────────────────────────── */}
        <View style={styles.kpiGrid}>
          <KPICard
            label="Total return"
            value={fmtPct(kpis.total_return_pct, true)}
            delta={kpis.total_return_pct_vs_last}
            deltaLabel={`${fmtPct(kpis.total_return_pct_vs_last, true)} vs last`}
            isDark={isDark}
            colors={colors}
          />
          <KPICard
            label="Net income"
            value={fmt(kpis.net_income, currency, true)}
            delta={kpis.net_income_vs_last}
            deltaLabel={`${fmt(kpis.net_income_vs_last, currency, true)} vs last`}
            isDark={isDark}
            colors={colors}
          />
          <KPICard
            label="Avg cap rate"
            value={fmtPct(kpis.avg_cap_rate, false)}
            delta="0"
            deltaLabel={`Mkt avg ${fmtPct(kpis.market_avg_cap_rate, false)}`}
            isDark={isDark}
            colors={colors}
          />
          <KPICard
            label="Vacancy loss"
            value={fmt(kpis.vacancy_loss, currency, true)}
            delta={kpis.vacancy_loss_vs_last}
            deltaLabel={`${fmt(kpis.vacancy_loss_vs_last, currency, true)} vs last`}
            isDark={isDark}
            invertDelta
            colors={colors}
          />
        </View>

        {/* ── Monthly income chart ──────────────────────────────────────── */}
        <Section
          title="Monthly income"
          isDark={isDark}
          colors={colors}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setSectionWidth(width);
          }}
          right={
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: BRAND }]} />
              <Text
                style={[styles.legendText, isDark && styles.legendTextDark]}
              >
                Rental
              </Text>
              <View
                style={[styles.legendDot, { backgroundColor: BRAND_LIGHTER }]}
              />
              <Text
                style={[styles.legendText, isDark && styles.legendTextDark]}
              >
                Other
              </Text>
            </View>
          }
        >
          <BarChart
            data={monthly_income_chart}
            currency={currency}
            isDark={isDark}
            containerWidth={sectionWidth}
          />
        </Section>

        {/* ── Portfolio mix ─────────────────────────────────────────────── */}
        <Section title="Portfolio mix" isDark={isDark} colors={colors}>
          <DonutChart
            mix={portfolio_mix}
            totalValue={total_portfolio_value}
            currency={currency}
            isDark={isDark}
            colors={colors}
          />
        </Section>

        {/* ── Property performance ──────────────────────────────────────── */}
        <Section title="Property performance" isDark={isDark} colors={colors}>
          <PerformanceTable
            data={property_performance}
            currency={currency}
            isDark={isDark}
            colors={colors}
          />
        </Section>
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: H_PAD, paddingTop: 12, paddingBottom: 40, gap: 14 },

  // Top bar
  topBar: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: H_PAD,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 0.5,
  },
  topBarDark: {},
  accentBar: {
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: BRAND,
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: BRAND_DARK,
    letterSpacing: -0.4,
  },
  pageTitleDark: { color: '#E8F5F5' },

  // Period selector
  periodRow: {
    flexDirection: 'row',
    gap: 4,
    borderRadius: 20,
    padding: 3,
  },
  periodRowDark: {},
  periodPill: { paddingVertical: 4, paddingHorizontal: 13, borderRadius: 20 },
  periodPillActive: { backgroundColor: BRAND },
  periodPillText: { fontSize: 12, fontWeight: '500', color: BRAND_DARK },
  periodPillTextActive: { color: '#FFFFFF' },

  // KPI grid
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
  },
  kpiCardDark: {},
  kpiLabel: { fontSize: 11, color: BRAND, marginBottom: 4 },
  kpiLabelDark: { color: BRAND_LIGHTER },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    color: BRAND_DARK,
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  kpiValueDark: { color: '#E8F5F5' },
  kpiDelta: { fontSize: 11, fontWeight: '500' },

  // Section
  section: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
  },
  sectionDark: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: BRAND_DARK },
  sectionTitleDark: { color: '#E8F5F5' },

  // Chart legend
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 11, color: BRAND },
  legendTextDark: { color: BRAND_LIGHTER },

  // Portfolio mix
  mixRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  donutWrap: {
    width: 116,
    height: 116,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mixLegend: { flex: 1, gap: 12 },
  mixLegendItem: { gap: 6 },
  mixLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mixLabelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0D2626',
    flex: 1,
    marginRight: 8,
  },
  mixLabelTextDark: {
    color: '#E8F5F5',
  },
  mixPctText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D2626',
  },
  mixPctTextDark: {
    color: '#E8F5F5',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressTrackDark: {},
  progressFill: {
    height: 6,
    borderRadius: 3,
  },

  // Performance table
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: '600',
    color: BRAND,
    flex: 1,
  },
  tableHeaderCellDark: { color: BRAND_LIGHTER },
  tableRight: { textAlign: 'right' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  tableRowDark: {},
  tableRowBorder: { borderBottomWidth: 0.5 },
  tableRowBorderDark: {},
  tableCell: { fontSize: 13, color: BRAND_DARK, flex: 1 },
  tableCellDark: { color: '#E8F5F5' },
  tableCellSub: { fontSize: 11, color: BRAND, marginTop: 1 },
  tableCellSubDark: { color: BRAND_LIGHTER },

  // Error state
  stateIconRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND_DARK,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: BRAND,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  retryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
