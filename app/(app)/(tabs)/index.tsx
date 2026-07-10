import { StatusBar, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import HeroCard from '@/components/landing/HeroCard';
import QuickActions from '@/components/landing/QuickActions';
import NewsFeed from '@/components/landing/NewsFeed';
import PropertiesList from '@/components/landing/PropertiesList';
import useDeviceUpdate from '@/hooks/landing/useDeviceUpdate';
import ReferralCard from '@/components/landing/ReferralCard';

import { useTheme } from '@/context/ThemeContext';

export default function App() {
  useDeviceUpdate();

  const { colors } = useTheme();
  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HeroCard />
        <QuickActions />
        <PropertiesList />

        <ReferralCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
