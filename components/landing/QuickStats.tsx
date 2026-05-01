import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useHeroCard } from '@/hooks/landing/useHeroCard';
import { useTheme } from '@/context/ThemeContext';

const QuickStats: React.FC = () => {
  const { data } = useHeroCard();
  const isDark = useColorScheme() === 'dark';

  const { colors } = useTheme();

  const appreciationRate = data
    ? `${parseFloat(data.appreciation_percentage).toFixed(0)}%`
    : '—';
  const totalProperties = data ? `${data.total_properties}` : '—';

  const stats = [
    { label: 'Properties', value: totalProperties },
    { label: 'Appreciation', value: appreciationRate },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View
          key={index}
          style={[
            styles.statCard,
            { backgroundColor: colors.background.secondary },
          ]}
        >
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
            {stat.label}
          </Text>
          <Text style={[styles.statValue, isDark && styles.statValueDark]}>
            {stat.value}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
  },
  statCardDark: {
    backgroundColor: '#1C2E2E',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statLabelDark: {
    color: '#6AABAB',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  statValueDark: {
    color: '#E8F5F5',
  },
});

export default QuickStats;
