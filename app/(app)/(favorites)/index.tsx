import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/lib/apiClient';
import { Ionicons } from '@expo/vector-icons';
import useUserBookmark, { type Bookmark } from '@/hooks/market/useUserBookmark';
import { formatCurrency } from '@/utils/general/formatCurrency';
import { useTheme } from '@/context/ThemeContext';

export default function BookmarksScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { colors } = useTheme();

  const { bookmarks, loading, error, refetch } = useUserBookmark();
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRemoveBookmark = async (bookmarkId: number, slug: string) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this property from your bookmarks?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemovingId(bookmarkId);

            try {
              await api.post(`/api/market/${slug}/bookmark/`);
              Alert.alert('Success', 'Bookmark removed successfully');
              await refetch();
            } catch (err: any) {
              Alert.alert(
                'Error',
                err.response?.data?.message || 'An error occurred while removing the bookmark',
              );
              console.error('Remove bookmark error:', err);
            } finally {
              setRemovingId(null);
            }
          },
        },
      ],
    );
  };

  const handleCardPress = (slug: string) => {
    router.push({
      pathname: '/market/marketdetails',
      params: { slug },
    });
  };

  const renderBookmarkCard = ({ item }: { item: Bookmark }) => {
    const isRemoving = removingId === item.id;
    const thumbnailUrl = item.cover_image || null;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.background.secondary }]}
        onPress={() => handleCardPress(item.property_slug)}
        activeOpacity={0.7}
        disabled={isRemoving}
      >
        <View style={styles.cardContent}>
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.thumbnail,
                styles.thumbnailPlaceholder,
                { backgroundColor: colors.background.secondary },
              ]}
            >
              <Ionicons
                name="image-outline"
                size={40}
                color={colors.text.secondary}
              />
            </View>
          )}

          <View style={styles.details}>
            <Text
              style={[styles.title, { color: colors.text.primary }]}
              numberOfLines={2}
            >
              {item.property_title}
            </Text>

            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={colors.text.secondary}
              />
              <Text
                style={[styles.location, { color: colors.text.secondary }]}
                numberOfLines={1}
              >
                {item.property_city}, {item.property_state}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {formatCurrency(Number(item.property_price), item.property_currency)}
              </Text>

              <TouchableOpacity
                style={[
                  styles.removeButton,
                  { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' },
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleRemoveBookmark(item.id, item.property_slug);
                }}
                disabled={isRemoving}
              >
                {isRemoving ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="bookmark-outline"
        size={80}
        color={colors.text.secondary}
      />
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
        No Bookmarks Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
        Start bookmarking properties you're interested in to see them here.
      </Text>
      <TouchableOpacity
        style={[
          styles.reloadButton,
          { backgroundColor: colors.background.primary },
        ]}
        onPress={handleRefresh}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
        <Text style={styles.reloadButtonText}>Reload</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="alert-circle-outline"
        size={80}
        color={colors.text.secondary}
      />
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
        Error Loading Bookmarks
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
        {error}
      </Text>
      <TouchableOpacity
        style={[
          styles.reloadButton,
          { backgroundColor: colors.background.primary },
        ]}
        onPress={handleRefresh}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
        <Text style={styles.reloadButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.background.primary },
        ]}
      >
        <ActivityIndicator size="large" color={colors.background.primary} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          Loading saved properties...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      {/* Header without gradient */}
      <View
        style={[styles.header, { backgroundColor: colors.background.primary }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
              My Saved Properties
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: colors.text.secondary }]}
            >
              {bookmarks.length}{' '}
              {bookmarks.length === 1 ? 'property' : 'properties'} saved
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.headerButton,
              { backgroundColor: colors.background.secondary },
            ]}
            onPress={handleRefresh}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={bookmarks}
          renderItem={renderBookmarkCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            bookmarks.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.background.primary}
              colors={[colors.background.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  listContent: {
    padding: 20,
  },
  listContentEmpty: {
    flex: 1,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  thumbnailPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  location: {
    fontSize: 13,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  purposeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  purposeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#358B8B',
    flex: 1,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
