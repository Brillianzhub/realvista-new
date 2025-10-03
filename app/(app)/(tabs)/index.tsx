import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Briefcase, TrendingUp, Target, Calculator, Users, BookOpen, ChartBar as BarChart3, Settings, DollarSign } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface CarouselItem {
  id: string;
  title: string;
  image: string;
  description: string;
}

const navigationItems: NavigationItem[] = [
  { id: '1', title: 'Portfolio', icon: Briefcase, color: '#3b82f6' },
  { id: '2', title: 'RealInvest', icon: DollarSign, color: '#10b981' },
  { id: '3', title: 'MutualInvest', icon: TrendingUp, color: '#f59e0b' },
];

const secondaryNavigationItems: NavigationItem[] = [
  { id: '4', title: 'Targets', icon: Target, color: '#ef4444' },
  { id: '5', title: 'Calculator', icon: Calculator, color: '#8b5cf6' },
  { id: '6', title: 'Manager', icon: Users, color: '#ec4899' },
  { id: '7', title: 'Learn', icon: BookOpen, color: '#06b6d4' },
  { id: '8', title: 'Trends', icon: BarChart3, color: '#84cc16' },
  { id: '9', title: 'Settings', icon: Settings, color: '#6b7280' },
];

const carouselItems: CarouselItem[] = [
  {
    id: '1',
    title: 'Real Estate Investment',
    image: 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Invest in premium real estate opportunities',
  },
  {
    id: '2',
    title: 'Portfolio Management',
    image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Diversify your investment portfolio',
  },
  {
    id: '3',
    title: 'Market Analysis',
    image: 'https://images.pexels.com/photos/7567486/pexels-photo-7567486.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Stay ahead with market insights',
  },
];

export default function HomeScreen() {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextSlide = (activeSlide + 1) % carouselItems.length;
      setActiveSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * screenWidth,
        animated: true,
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [activeSlide]);

  const handleNavigationPress = (item: NavigationItem) => {
    console.log(`Navigating to ${item.title}`);
  };

  const renderPrimaryNavigation = () => (
    <View style={styles.primaryNavContainer}>
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
            <Text style={styles.primaryNavSubtext}>Manage your investments</Text>
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

  const renderCarousel = () => (
    <View style={styles.carouselContainer}>
      <Text style={styles.carouselTitle}>Featured Opportunities</Text>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setActiveSlide(slideIndex);
        }}
        style={styles.carousel}
      >
        {carouselItems.map((item) => (
          <View key={item.id} style={styles.carouselItem}>
            <Image source={{ uri: item.image }} style={styles.carouselImage} />
            <View style={styles.carouselContent}>
              <Text style={styles.carouselItemTitle}>{item.title}</Text>
              <Text style={styles.carouselItemDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.pagination}>
        {carouselItems.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              { backgroundColor: index === activeSlide ? '#3b82f6' : '#d1d5db' }
            ]}
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderPrimaryNavigation()}
        {renderSecondaryNavigation()}
        {renderCarousel()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    fontSize: 14,
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