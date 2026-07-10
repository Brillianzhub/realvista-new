import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import PagerView from 'react-native-pager-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import images from '@/constants/images';
import { useTheme } from '@/context/ThemeContext';
import { getDevicePayload } from '@/utils/device/deviceUtils';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const router = useRouter();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 3;
  const { colors } = useTheme();

  const slides = [
    {
      image: images.businessSales,
      title: 'Grow Your Wealth',
      description:
        'Invest in properties and watch your portfolio grow steadily with smart real estate choices.',
      message: 'Grow your wealth, one property at a time.',
      color: '#FB902E',
      icon: 'trending-up' as const,
    },
    {
      image: images.businessInvestor,
      title: 'Real-Time Insights',
      description:
        'Get instant market data and analytics to make informed investment decisions.',
      message: 'Real-time insights, real-time decisions. Act now.',
      color: '#358B8B',
      icon: 'flash' as const,
    },
    {
      image: images.scooter,
      title: 'Future of Investing',
      description:
        'Experience the next generation of real estate investment with cutting-edge tools.',
      message: 'The future of real estate investment is here.',
      color: '#477567ff',
      icon: 'rocket' as const,
    },
  ];

  const handleSignUp = () => {
    router.push('/(auth)/account-type');
  };

  const handleLogin = () => {
    router.push('/(auth)/sign-in');
  };

  const handleSkip = () => {
    router.push('/(auth)/sign-in');
  };

  useEffect(() => {
    const initDevice = async () => {
      try {
        await getDevicePayload();
      } catch (error) {
        console.error('Device init failed:', error);
      }
    };

    const timer = setTimeout(() => {
      initDevice();
    }, 500); // ⬅️ small delay is key

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(100),
      ]).start(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % slides.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      {/* Skip Button (Top Right) */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Animated Title Section */}
      <View style={styles.headerSection}>
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: colors.text.primary }]}>
            Realvista
          </Text>
          <View style={styles.logoBadge}>
            <Ionicons name="trending-up" size={14} color="white" />
          </View>
        </View>
        <Animated.Text
          style={[
            styles.animatedTitle,
            {
              opacity: fadeAnim,
              color: slides[currentMessageIndex].color,
            },
          ]}
        >
          {slides[currentMessageIndex].message}
        </Animated.Text>
      </View>

      {/* Main Content - Pager View */}
      <View style={styles.contentSection}>
        <PagerView
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={(e) => {
            setCurrentPage(e.nativeEvent.position);
            setCurrentMessageIndex(e.nativeEvent.position);
          }}
        >
          {slides.map((slide, index) => (
            <View key={index} style={styles.slideContainer}>
              {/* Slide Image with Overlay Background (Not cutting) */}
              <View style={styles.imageContainer}>
                <View
                  style={[
                    styles.imageBackgroundOverlay,
                    { backgroundColor: slide.color + '15' },
                  ]}
                >
                  <Image
                    source={slide.image}
                    style={styles.slideImage}
                    resizeMode="contain"
                  />
                </View>
                {/* Decorative Circles */}
                <View
                  style={[
                    styles.decorativeCircle1,
                    { backgroundColor: slide.color + '10' },
                  ]}
                />
                <View
                  style={[
                    styles.decorativeCircle2,
                    { backgroundColor: slide.color + '10' },
                  ]}
                />
              </View>

              {/* Slide Content */}
              <View style={styles.slideContent}>
                <View style={styles.slideTitleContainer}>
                  <View
                    style={[
                      styles.titleIcon,
                      { backgroundColor: slide.color + '30' },
                    ]}
                  >
                    <Ionicons name={slide.icon} size={24} color={slide.color} />
                  </View>
                  <Text
                    style={[styles.slideTitle, { color: colors.text.primary }]}
                  >
                    {slide.title}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.slideDescription,
                    { color: colors.text.secondary },
                  ]}
                >
                  {slide.description}
                </Text>
              </View>
            </View>
          ))}
        </PagerView>

        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDots}>
            {slides.map((slide, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  // You would need a ref to the pagerView to manually set page
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.progressDot,
                    currentPage === index && styles.activeProgressDot,
                    currentPage === index && { backgroundColor: slide.color },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.pageCounter}>
            <Text style={[styles.pageNumber, { color: colors.text.secondary }]}>
              {currentPage + 1}
              <Text style={{ color: '#9CA3AF' }}>/{totalPages}</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {/* Sign Up Button */}
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleSignUp}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#FB902E', '#FFA726']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="person-add" size={20} color="white" />
            <Text style={[styles.signUpButtonText, { color: 'white' }]}>
              Create Account
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, { borderColor: colors.border.default }]}
          onPress={handleLogin}
          activeOpacity={0.7}
        >
          <Ionicons name="log-in" size={20} color={colors.icon.default} />
          <Text
            style={[styles.loginButtonText, { color: colors.text.primary }]}
          >
            Sign In to Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  headerSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
    marginTop: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
  },
  logoBadge: {
    backgroundColor: '#358B8B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  animatedTitle: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 24,
    position: 'relative',
  },
  pagerView: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  imageBackgroundOverlay: {
    width: '100%',
    height: '100%',
    maxHeight: height * 0.4,
    maxWidth: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    maxHeight: height * 0.35,
    maxWidth: width * 0.75,
    resizeMode: 'contain',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: -20,
    right: 20,
    zIndex: -1,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    bottom: 0,
    left: 10,
    zIndex: -1,
  },
  slideContent: {
    paddingHorizontal: 8,
    marginTop: 20,
  },
  slideTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  titleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  slideDescription: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  activeProgressDot: {
    width: 24,
    backgroundColor: '#358B8B',
  },
  pageCounter: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  pageNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    gap: 12,
  },
  signUpButton: {
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
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Abel-Regular',
  },
  loginButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Abel-Regular',
  },
  guestButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  guestText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OnboardingScreen;
