import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  useColorScheme
} from 'react-native';
import {
  Briefcase,
  TrendingUp,
  Target,
  Calculator,
  Users,
  BookOpen,
  BarChart3,
  NotebookPen,
  CircleDollarSign
} from 'lucide-react-native';
import { useRouter, Href } from 'expo-router';
import FeaturedCarousel from '@/components/home/FeaturedCarousel';
import { useGlobalContext } from '@/context/GlobalProvider';

const ROUTES = {
  PORTFOLIO: '/(tabs)/portfolio' as Href,
  MANAGEMENT: '/(app)/(services)' as Href,
  TARGETS: '/(app)/(savings)' as Href,
  TRENDS: '/(app)/(trends)' as Href,
  ANALYSIS: '/(app)/(estimator)' as Href,
  LEARN: '/(app)/(learn)' as Href,
  MUTUAL: '/(enterprise)' as Href,
  MANAGER: '/(manage)' as Href,
  LISTINGS: '/(listings)' as Href,
};

const { width: screenWidth } = Dimensions.get('window');

interface NavigationItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  color: string;
  route: Href;
}

const navigationItems: NavigationItem[] = [
  { id: '1', title: 'Portfolio', subtitle: 'Track your real estate assets', icon: Briefcase, color: 'rgba(53, 139, 139, 1)', route: ROUTES.PORTFOLIO },
  { id: '2', title: 'RealManager', subtitle: 'We secure your investment', icon: NotebookPen, color: '#10b981', route: ROUTES.MANAGEMENT },
  { id: '3', title: 'MutualInvest', subtitle: 'Invest with others & earn returns', icon: TrendingUp, color: '#f59e0b', route: ROUTES.MUTUAL },
];

const secondaryNavigationItems: NavigationItem[] = [
  { id: '4', title: 'Set Financial Targets', icon: Target, color: '#ef4444', route: ROUTES.TARGETS },
  { id: '5', title: 'Evaluate Your Property', icon: Calculator, color: 'rgba(53, 139, 139, 1)', route: ROUTES.ANALYSIS },
  { id: '6', title: 'Manage Your Portfolio', icon: Users, color: '#ec4899', route: ROUTES.MANAGER },
  { id: '7', title: 'Learn', icon: BookOpen, color: '#06b6d4', route: ROUTES.LEARN },
  { id: '8', title: 'Market Trends & Info', icon: BarChart3, color: '#84cc16', route: ROUTES.TRENDS },
  { id: '9', title: 'Manage Your Listings', icon: CircleDollarSign, color: 'rgba(53, 139, 139, 1)', route: ROUTES.LISTINGS },
];

export default function HomeScreen() {
  const router = useRouter();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { user } = useGlobalContext();

  const handleNavigationPress = (item: NavigationItem) => {
    if (item.id === '3') {
      Alert.alert(
        "Coming Soon",
        "Thank you for your interest! The MutualInvest feature is not yet available - stay tuned for updates.",
        [{ text: "OK", style: "default" }]
      )
    } else {
      router.push(item.route);
    };

  };

  const renderPrimaryNavigation = () => (
    <View
      style={[styles.primaryNavContainer]}
    >
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.primaryNavGrid}>
        {navigationItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.primaryNavItem}
            onPress={() => handleNavigationPress(item)}
            activeOpacity={0.8}
          >
            <View style={[styles.primaryIconContainer, { backgroundColor: item.color }]}>
              <item.icon size={32} color="#ffffff" />
            </View>
            <Text style={styles.primaryNavText}>{item.title}</Text>
            <Text style={styles.primaryNavSubtext}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSecondaryNavigation = () => (
    <View style={styles.secondaryNavContainer}>
      <Text style={styles.sectionTitle}>Tools & Resources</Text>
      <View style={styles.secondaryNavGrid}>
        {secondaryNavigationItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.secondaryNavItem}
            onPress={() => handleNavigationPress(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.secondaryIconContainer, { backgroundColor: item.color }]}>
              <item.icon size={24} color="#ffffff" />
            </View>
            <Text style={styles.secondaryNavText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderPrimaryNavigation()}
        {renderSecondaryNavigation()}
        <FeaturedCarousel />
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  primaryNavContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryNavGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryNavItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  primaryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryNavText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  primaryNavSubtext: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 14,
  },
  secondaryNavContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryNavGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  secondaryNavItem: {
    width: '33.333%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  secondaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryNavText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  carouselContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  carouselTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 20,
    marginBottom: 16,
  },
  carousel: {
    marginBottom: 16,
  },
  carouselItem: {
    width: screenWidth - 32,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  carouselContent: {
    padding: 20,
  },
  carouselItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  carouselItemDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});