import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Carousel from 'react-native-reanimated-carousel';
import { usePropertyDetails } from '@/hooks/market/usePropertyDetails';
import { formatCurrency } from '@/utils/general/formatCurrency';
import MapViewer from '@/components/general/MapViewer';
import { handleAddBookmark } from '@/utils/market/handleAddBookmarks';
import { handleRecordInquiry } from '@/utils/market/handleRecordInquiry';
import { useStartConversation } from '@/hooks/useConversation';
import { useTheme } from '@/context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const mapFeaturesToReadable = (featuresArray: any[]): string[] => {
  if (!featuresArray || featuresArray.length === 0) return [];

  const f = featuresArray[0]; // there’s usually only one object in the array

  const mapped: string[] = [];

  if (f.negotiable === 'yes') mapped.push('Negotiable');
  if (f.furnished) mapped.push('Furnished');
  if (f.pet_friendly) mapped.push('Pet Friendly');
  if (f.parking_available) mapped.push('Parking Available');
  if (f.swimming_pool) mapped.push('Swimming Pool');
  if (f.garden) mapped.push('Garden');
  if (f.water_supply) mapped.push('Water Supply');
  if (f.security) mapped.push('Security');

  // include qualitative fields
  if (f.road_network) mapped.push(`Road Network: ${f.road_network}`);
  if (f.development_level)
    mapped.push(`Development Level: ${f.development_level}`);
  if (f.electricity_proximity)
    mapped.push(`Electricity Proximity: ${f.electricity_proximity}`);

  if (f.verified_user) mapped.push('Verified User');

  // you can include more if needed
  return mapped;
};

const getAmenityIcon = (amenity: string): string => {
  const iconMap: { [key: string]: string } = {
    WiFi: 'wifi',
    Parking: 'car',
    Pool: 'water',
    Garden: 'leaf',
    Gym: 'fitness',
    Security: 'shield-checkmark',
    Elevator: 'arrow-up-circle',
    'Beach Access': 'beach',
    Fireplace: 'flame',
    'Hot Tub': 'water',
    'Hiking Trails': 'trail-sign',
  };
  return iconMap[amenity] || 'checkmark-circle';
};

export default function MarketDetailScreen() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { property, loading, error } = usePropertyDetails(slug);

  const { colors } = useTheme();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const { startConversation, loading: startingConv } = useStartConversation();

  const handleMessageAgent = async () => {
    if (!property?.agent_id) {
      Alert.alert('Unavailable', 'Agent contact not available for this listing.');
      return;
    }
    await handleRecordInquiry(property.slug);
    const conv = await startConversation(property.agent_id, property.slug);
    if (conv) {
      router.push({
        pathname: '/(app)/(tabs)/market/chat',
        params: { conversationId: String(conv.id) },
      });
    } else {
      Alert.alert('Error', 'Could not start conversation. Please try again.');
    }
  };

  // 🧭 Set initial bookmark state for this property
  useEffect(() => {
    if (property) {
      setIsBookmarked(property.is_bookmarked);
    }
  }, [property]);

  // 💖 Toggle bookmark
  const onAddBookmark = async () => {
    if (!property || !property.slug) {
      console.warn('No property available to bookmark');
      return;
    }

    try {
      const bookmarkStatus = await handleAddBookmark(property.slug);
      setIsBookmarked(bookmarkStatus);
    } catch (error) {
      console.error('Bookmark update failed:', error);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, backgroundColor: colors.background.primary }}
      />
    );
  }
  if (error) return <Text>{error}</Text>;

  if (!property) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background.primary,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <Text>Loading property...</Text>
      </View>
    );
  }

  const renderCarouselItem = ({ item }: { item: string }) => (
    <View style={styles.carouselItem}>
      {item ? (
        <Image
          source={{ uri: item }}
          style={styles.carouselImage}
          resizeMode="cover"
        />
      ) : (
        <Text>No image available</Text>
      )}
    </View>
  );

  const imageUrls =
    property.images?.map(
      (img) => img.image_url_resolved ?? img.image_url ?? '',
    ) || [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.carouselContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <View style={styles.backButtonCircle}>
            <Ionicons name="arrow-back-outline" size={24} color="#111827" />
          </View>
        </TouchableOpacity>

        <Carousel
          loop={false}
          width={screenWidth}
          height={300}
          data={imageUrls}
          scrollAnimationDuration={1000}
          renderItem={renderCarouselItem}
          onSnapToItem={setActiveSlide}
        />

        <View style={styles.pagination}>
          {imageUrls.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeSlide && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.propertyName, { color: colors.text.primary }]}>
          {property?.title}
        </Text>
        <View style={styles.headerStats}>
          <Text style={[styles.currentValue, { color: colors.text.primary }]}>
            {formatCurrency(Number(property.price), property.currency)}
          </Text>
          <TouchableOpacity style={styles.roiContainer} onPress={onAddBookmark}>
            <Ionicons
              name={'heart'}
              size={24}
              color={isBookmarked ? '#e63946' : '#ccc'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location" size={18} color="#6B7280" />
          <Text style={[styles.locationText, { color: colors.text.primary }]}>
            {property.city}, {property.state}
          </Text>
        </View>
        <Text
          style={[styles.description, { color: colors.text.secondary }]}
          numberOfLines={descriptionExpanded ? undefined : 3}
        >
          {property.description}
        </Text>
        {!descriptionExpanded && (
          <TouchableOpacity
            onPress={() => setDescriptionExpanded(true)}
            style={styles.readMoreButton}
          >
            <Text
              style={[styles.readMoreText, { color: colors.text.secondary }]}
            >
              Read More
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={colors.icon.default}
            />
          </TouchableOpacity>
        )}
        {descriptionExpanded && (
          <TouchableOpacity
            onPress={() => setDescriptionExpanded(false)}
            style={styles.readMoreButton}
          >
            <Text
              style={[styles.readMoreText, { color: colors.text.secondary }]}
            >
              Read Less
            </Text>
            <Ionicons name="chevron-up" size={16} color={colors.icon.default} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Owner Information
        </Text>
        <View
          style={[
            styles.ownerCard,
            { backgroundColor: colors.background.secondary },
          ]}
        >
          <View style={styles.ownerHeader}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text
                  style={[styles.avatarText, { color: colors.text.primary }]}
                >
                  {getInitials(property.owner_name)}
                </Text>
              </View>
            </View>
            <View style={styles.ownerInfo}>
              <Text style={[styles.ownerName, { color: colors.text.primary }]}>
                {property.owner_name}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Property Features
        </Text>
        <View style={styles.amenitiesContainer}>
          {mapFeaturesToReadable(property.features).map((amenity, index) => (
            <View key={index} style={styles.amenityChip}>
              <Ionicons
                name={getAmenityIcon(amenity) as any}
                size={16}
                color="#358B8B"
              />
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Location
        </Text>
        {property.coordinates?.length > 0 ? (
          <MapViewer
            latitude={property.coordinates[0].latitude}
            longitude={property.coordinates[0].longitude}
            title={property.title}
          />
        ) : (
          <Text style={{ color: '#888', marginTop: 8 }}>
            No coordinates available
          </Text>
        )}
      </View>
      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={[styles.messageButton, startingConv && styles.messageButtonDisabled]}
          onPress={handleMessageAgent}
          disabled={startingConv}
        >
          {startingConv ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
              <Text style={styles.messageButtonText}>Message Agent</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carouselContainer: {
    position: 'relative',
    height: 300,
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 16,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  carouselItem: {
    width: screenWidth,
    height: 300,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  section: {
    padding: 16,
  },
  propertyName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  currentValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 14,
    color: '#358B8B',
    fontWeight: '600',
  },
  roiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roiText: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  ownerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  ownerHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    backgroundColor: '#358B8B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  ownerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  ownerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ownerMeta: {
    fontSize: 13,
    marginBottom: 4,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ownerContact: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
  },
  featuresGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  featureItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  featureLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  featureValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  amenitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  amenityText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chart: {
    borderRadius: 16,
  },
  mapContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  map: {
    width: '100%',
    height: 250,
  },
  ctaSection: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#348b8b',
    paddingVertical: 14,
    borderRadius: 12,
  },
  messageButtonDisabled: {
    opacity: 0.6,
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: '#358B8B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
