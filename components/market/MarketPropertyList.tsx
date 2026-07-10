import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Listing } from '@/hooks/market/useAgentListings';
import { formatCurrency } from '@/utils/general/formatCurrency';
import { handleAddBookmark } from '@/utils/market/handleAddBookmarks';
import useUserBookmark, { type Bookmark } from '@/hooks/market/useUserBookmark';
import { handleViewProperty } from '@/utils/market/handleViewProperty';
import { useTheme } from '@/context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface MarketPropertyListProps {
  properties: Listing[];
  onAddProperty?: () => void;
}

const MarketPropertyList: React.FC<MarketPropertyListProps> = ({
  properties,
  onAddProperty,
}) => {
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState<
    Record<number, number>
  >({});
  const { bookmarks, refetch } = useUserBookmark();
  const { colors } = useTheme();

  const isPropertyBookmarked = (propertyId: number) => {
    return bookmarks?.some((b) => b.property === propertyId);
  };

  // 💖 Toggle bookmark
  const onAddBookmark = async (slug: string) => {
    if (!slug) return;

    try {
      const status = await handleAddBookmark(slug);
      await refetch();
    } catch (error) {
      console.error('Bookmark update failed:', error);
    }
  };

  const handlePropertyPress = async (property: Listing) => {
    await handleViewProperty(property.id);
    router.push({
      pathname: '/market/marketdetails',
      params: { slug: property.slug },
    });
  };

  return (
    <View style={[styles.container]}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {properties.map((property) => {
          const bookmarked = isPropertyBookmarked(property.id);

          return (
            <View
              key={property.id}
              style={[
                styles.propertyCard,
                { backgroundColor: colors.background.secondary },
              ]}
            >
              {/* Image Carousel */}
              <View style={styles.carouselContainer}>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={(event) => {
                    const x = event.nativeEvent.contentOffset.x;
                    const index = Math.round(x / (screenWidth - 32));
                    setActiveImageIndex((prev) => ({
                      ...prev,
                      [property.id]: index,
                    }));
                  }}
                  scrollEventThrottle={16}
                >
                  {(property.preview_images?.length
                    ? property.preview_images.slice(0, 3)
                    : ['https://via.placeholder.com/400x250.png?text=No+Image']
                  ).map((img, index) => (
                    <Image
                      key={index}
                      source={{ uri: img }}
                      style={styles.propertyImage}
                    />
                  ))}
                </ScrollView>

                {/* Pagination dots */}
                <View style={styles.dotsContainer}>
                  {(property.preview_images?.slice(0, 3) || [0, 1, 2]).map(
                    (_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          activeImageIndex[property.id] === index &&
                            styles.activeDot,
                        ]}
                      />
                    )
                  )}
                </View>
              </View>

              {/* Property Info */}
              <TouchableOpacity
                style={styles.propertyInfo}
                onPress={() => handlePropertyPress(property)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.propertyName, { color: colors.text.primary }]}
                >
                  {property.title}
                </Text>

                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text
                    style={[
                      styles.locationText,
                      { color: colors.text.secondary },
                    ]}
                  >
                    {property.city}, {property.state}
                  </Text>
                </View>

                <View style={styles.statsRow}>
                  <Text
                    style={[styles.valueText, { color: colors.text.primary }]}
                  >
                    {formatCurrency(property.price, property.currency)}
                  </Text>

                  {/* ❤️ Bookmark toggle */}
                  <TouchableOpacity onPress={() => onAddBookmark(property.slug)}>
                    <Ionicons
                      name={bookmarked ? 'heart' : 'heart-outline'}
                      size={26}
                      color={bookmarked ? '#e63946' : '#9CA3AF'}
                    />
                  </TouchableOpacity>
                </View>

                <Text
                  style={[styles.description, { color: colors.text.secondary }]}
                  numberOfLines={3}
                >
                  {property.short_description}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Floating Add Button */}
      {onAddProperty && (
        <TouchableOpacity style={styles.fabButton} onPress={onAddProperty}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MarketPropertyList;

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 80 },
  propertyCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  carouselContainer: { position: 'relative' },
  propertyImage: {
    width: screenWidth - 32,
    height: 220,
    resizeMode: 'cover',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  propertyInfo: { padding: 16 },
  propertyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: { fontSize: 14 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  valueText: { fontSize: 18, fontWeight: '600' },
  description: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
